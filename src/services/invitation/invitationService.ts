/**
 * Organization User Invitation Service Implementation
 *
 * Manages the complete invitation lifecycle:
 * pending -> accepted | expired | revoked
 *
 * Enforces role delegation authorization, tenant isolation, and non-destructive transitions.
 */

import { databaseService } from '../database';
import { clientDataService } from '../client/clientDataService';
import { auditService } from '../audit/auditService';
import { AUDIT_ACTIONS } from '../../types/audit';
import { authService } from '../auth';
import {
  ClientInvalidDataError,
  ClientNotFoundError,
  ClientUnauthorizedError,
  mapToClientServiceError,
} from '../client/clientErrors';
import { canAssignRole } from '../../permissions/roles';
import { CLIENT_USER_STATUS, type ClientUser } from '../../types/auth';
import {
  USER_INVITATION_STATUS,
  type UserInvitation,
  type CreateInvitationInput,
} from '../../types/invitation';
import { emailDeliveryService } from './emailDeliveryService';
import type { InvitationService } from './invitation.types';

export class InvitationServiceImpl implements InvitationService {
  private mockInvitationsByOrg = new Map<string, UserInvitation[]>();

  private getMockInvitations(orgId: string): UserInvitation[] {
    if (!this.mockInvitationsByOrg.has(orgId)) {
      const now = Date.now();
      const seedInvitations: UserInvitation[] = [
        {
          id: 'inv_seed_01',
          organizationId: orgId,
          organizationName: 'Client Workspace',
          email: 'laura.vance@acme-corp.com',
          firstName: 'Laura',
          lastName: 'Vance',
          role: 'dept_head',
          roleIds: ['dept_head'],
          departmentIds: ['dept_marketing'],
          locationIds: ['loc_hq'],
          customPermissions: [],
          invitedBy: {
            uid: 'usr_admin_01',
            name: 'Alex Morgan',
            email: 'admin@acme-corp.com',
          },
          status: USER_INVITATION_STATUS.PENDING,
          token: 'tok_demo_pending_12345',
          expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days remaining
          createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
          updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
        {
          id: 'inv_seed_02',
          organizationId: orgId,
          organizationName: 'Client Workspace',
          email: 'brian.cooper@acme-corp.com',
          firstName: 'Brian',
          lastName: 'Cooper',
          role: 'employee',
          roleIds: ['employee'],
          departmentIds: ['dept_eng'],
          locationIds: ['loc_remote'],
          customPermissions: [],
          invitedBy: {
            uid: 'usr_admin_01',
            name: 'Alex Morgan',
            email: 'admin@acme-corp.com',
          },
          status: USER_INVITATION_STATUS.EXPIRED,
          token: 'tok_demo_expired_67890',
          expiresAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(), // expired 2 days ago
          createdAt: new Date(now - 1000 * 60 * 60 * 24 * 9).toISOString(),
          updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 9).toISOString(),
        },
        {
          id: 'inv_seed_03',
          organizationId: orgId,
          organizationName: 'Client Workspace',
          email: 'rachel.green@acme-corp.com',
          firstName: 'Rachel',
          lastName: 'Green',
          role: 'employee',
          roleIds: ['employee'],
          departmentIds: ['dept_sales'],
          locationIds: ['loc_remote'],
          customPermissions: [],
          invitedBy: {
            uid: 'usr_admin_01',
            name: 'Alex Morgan',
            email: 'admin@acme-corp.com',
          },
          status: USER_INVITATION_STATUS.REVOKED,
          token: 'tok_demo_revoked_11223',
          expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 3).toISOString(),
          revokedAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
          createdAt: new Date(now - 1000 * 60 * 60 * 24 * 4).toISOString(),
          updatedAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
        },
      ];
      this.mockInvitationsByOrg.set(orgId, seedInvitations);
    }
    return this.mockInvitationsByOrg.get(orgId)!;
  }

  public async listInvitations(): Promise<UserInvitation[]> {
    const ctx = clientDataService.getTrustedContext();
    const now = Date.now();

    try {
      if (clientDataService.isConfigured()) {
        const path = clientDataService.buildClientPath('invitations');
        const raw = await databaseService.get<Record<string, UserInvitation>>(path);
        if (!raw || typeof raw !== 'object') {
          return [];
        }

        const list = Object.entries(raw).map(([key, val]) => ({
          ...val,
          id: val.id || key,
        }));

        // Dynamically evaluate expired statuses
        return list.map((inv) => {
          if (inv.status === USER_INVITATION_STATUS.PENDING) {
            const expMs = new Date(inv.expiresAt).getTime();
            if (now >= expMs) {
              return { ...inv, status: USER_INVITATION_STATUS.EXPIRED };
            }
          }
          return inv;
        });
      }

      const mockList = this.getMockInvitations(ctx.organizationId);
      return mockList.map((inv) => {
        if (inv.status === USER_INVITATION_STATUS.PENDING) {
          const expMs = new Date(inv.expiresAt).getTime();
          if (now >= expMs) {
            return { ...inv, status: USER_INVITATION_STATUS.EXPIRED };
          }
        }
        return inv;
      });
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async createInvitation(input: CreateInvitationInput): Promise<UserInvitation> {
    const ctx = clientDataService.getTrustedContext();

    // 1. Role Assignment Authorization Check
    if (!canAssignRole(ctx.role, input.role)) {
      throw new ClientUnauthorizedError(
        `You do not have permission to assign the role "${input.role}".`,
        ctx.organizationId
      );
    }

    // 2. Validate Email Syntax
    const email = input.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ClientInvalidDataError('A valid corporate email address is required.');
    }

    if (!input.firstName?.trim() || !input.lastName?.trim()) {
      throw new ClientInvalidDataError('First name and last name are required.');
    }

    // 3. Ensure User Doesn't Already Exist
    const existingUsers = await clientDataService.listClientUsers();
    if (existingUsers.some((u) => u.email.toLowerCase() === email && u.status !== CLIENT_USER_STATUS.DISABLED)) {
      throw new ClientInvalidDataError(`An active user with email "${email}" already exists in this organization.`);
    }

    // 4. Ensure No Pending Invitation Already Exists
    const existingInvites = await this.listInvitations();
    const hasPending = existingInvites.some(
      (inv) => inv.email.toLowerCase() === email && inv.status === USER_INVITATION_STATUS.PENDING
    );
    if (hasPending) {
      throw new ClientInvalidDataError(`A pending invitation has already been sent to "${email}".`);
    }

    const session = authService.getCurrentSession();
    const invId = `inv_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const token = `tok_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}${Math.random().toString(36).substring(2, 9)}`;
    const nowIso = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days

    const invitation: UserInvitation = {
      id: invId,
      organizationId: ctx.organizationId,
      organizationName: session?.organization?.name || 'Your Organization',
      email,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      role: input.role,
      roleIds: [input.role],
      departmentIds: input.departmentIds || [],
      locationIds: input.locationIds || [],
      customPermissions: input.customPermissions || [],
      phone: input.phone?.trim() || undefined,
      employeeId: input.employeeId?.trim() || undefined,
      invitedBy: {
        uid: ctx.userId,
        name: session?.user?.displayName || session?.user?.firstName || 'Administrator',
        email: session?.user?.email,
      },
      status: USER_INVITATION_STATUS.PENDING,
      token,
      expiresAt,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      if (clientDataService.isConfigured()) {
        const path = clientDataService.buildClientPath('invitations', invId);
        await databaseService.set(path, invitation);
        // Also write public token index for resolution on /accept-invitation
        await databaseService.set(`invitationsByToken/${token}`, {
          invitationId: invId,
          organizationId: ctx.organizationId,
        });
      } else {
        const mockList = this.getMockInvitations(ctx.organizationId);
        mockList.unshift(invitation);
      }

      // Dispatch invitation through backend email delivery boundary
      const acceptUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://portal.clienthris.com'}/accept-invitation?token=${token}`;
      await emailDeliveryService.dispatchInvitationEmail(invitation, acceptUrl);

      // Record administrative audit log
      await auditService.recordEvent({
        action: AUDIT_ACTIONS.USER_INVITED,
        resourceType: 'invitation',
        resourceId: invitation.id,
        metadata: {
          invitedEmail: invitation.email,
          role: invitation.role,
          roleIds: invitation.roleIds,
          expiresAt: invitation.expiresAt,
        },
      });

      return invitation;
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async resendInvitation(invitationId: string): Promise<UserInvitation> {
    const ctx = clientDataService.getTrustedContext();
    const invitations = await this.listInvitations();
    const existing = invitations.find((i) => i.id === invitationId);

    if (!existing) {
      throw new ClientNotFoundError(`Invitation "${invitationId}" was not found.`, ctx.organizationId);
    }

    if (existing.status === USER_INVITATION_STATUS.REVOKED) {
      throw new ClientInvalidDataError('Cannot re-send a revoked invitation. Please create a new invitation.');
    }
    if (existing.status === USER_INVITATION_STATUS.ACCEPTED) {
      throw new ClientInvalidDataError('This invitation has already been accepted by the user.');
    }

    const nowIso = new Date().toISOString();
    const extendedExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

    const updatedInvitation: UserInvitation = {
      ...existing,
      status: USER_INVITATION_STATUS.PENDING,
      expiresAt: extendedExpiresAt,
      updatedAt: nowIso,
    };

    try {
      if (clientDataService.isConfigured()) {
        const path = clientDataService.buildClientPath('invitations', invitationId);
        await databaseService.update(path, {
          status: USER_INVITATION_STATUS.PENDING,
          expiresAt: extendedExpiresAt,
          updatedAt: nowIso,
        });
      } else {
        const mockList = this.getMockInvitations(ctx.organizationId);
        const idx = mockList.findIndex((i) => i.id === invitationId);
        if (idx >= 0) {
          mockList[idx] = updatedInvitation;
        }
      }

      const acceptUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://portal.clienthris.com'}/accept-invitation?token=${updatedInvitation.token}`;
      await emailDeliveryService.dispatchInvitationEmail(updatedInvitation, acceptUrl);

      return updatedInvitation;
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async revokeInvitation(invitationId: string): Promise<UserInvitation> {
    const ctx = clientDataService.getTrustedContext();
    const invitations = await this.listInvitations();
    const existing = invitations.find((i) => i.id === invitationId);

    if (!existing) {
      throw new ClientNotFoundError(`Invitation "${invitationId}" was not found.`, ctx.organizationId);
    }

    if (existing.status === USER_INVITATION_STATUS.ACCEPTED) {
      throw new ClientInvalidDataError('Cannot revoke an already accepted invitation.');
    }

    const nowIso = new Date().toISOString();
    const revokedInvitation: UserInvitation = {
      ...existing,
      status: USER_INVITATION_STATUS.REVOKED,
      revokedAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      if (clientDataService.isConfigured()) {
        const path = clientDataService.buildClientPath('invitations', invitationId);
        await databaseService.update(path, {
          status: USER_INVITATION_STATUS.REVOKED,
          revokedAt: nowIso,
          updatedAt: nowIso,
        });
      } else {
        const mockList = this.getMockInvitations(ctx.organizationId);
        const idx = mockList.findIndex((i) => i.id === invitationId);
        if (idx >= 0) {
          mockList[idx] = revokedInvitation;
        }
      }

      // Record administrative audit log
      await auditService.recordEvent({
        action: AUDIT_ACTIONS.INVITATION_REVOKED,
        resourceType: 'invitation',
        resourceId: invitationId,
        metadata: {
          invitedEmail: existing.email,
          role: existing.role,
        },
      });

      return revokedInvitation;
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async getInvitationByToken(token: string): Promise<UserInvitation | null> {
    if (!token?.trim()) return null;
    const cleanToken = token.trim();

    try {
      if (databaseService.isConfigured()) {
        const tokenRef = await databaseService.get<{
          invitationId: string;
          organizationId: string;
        }>(`invitationsByToken/${cleanToken}`);

        if (!tokenRef?.invitationId || !tokenRef.organizationId) {
          return null;
        }

        const path = `organizations/${tokenRef.organizationId}/invitations/${tokenRef.invitationId}`;
        const invitation = await databaseService.get<UserInvitation>(path);
        if (!invitation) return null;

        // Dynamic expiration check
        if (invitation.status === USER_INVITATION_STATUS.PENDING) {
          if (Date.now() >= new Date(invitation.expiresAt).getTime()) {
            return { ...invitation, status: USER_INVITATION_STATUS.EXPIRED };
          }
        }
        return invitation;
      }

      // Offline / development mock lookup across all organizations
      for (const list of this.mockInvitationsByOrg.values()) {
        const found = list.find((i) => i.token === cleanToken);
        if (found) {
          if (found.status === USER_INVITATION_STATUS.PENDING) {
            if (Date.now() >= new Date(found.expiresAt).getTime()) {
              return { ...found, status: USER_INVITATION_STATUS.EXPIRED };
            }
          }
          return found;
        }
      }

      // Check default seed invitations
      const defaultSeeds = this.getMockInvitations('org_client_01');
      const seedFound = defaultSeeds.find((i) => i.token === cleanToken);
      if (seedFound) {
        if (seedFound.status === USER_INVITATION_STATUS.PENDING) {
          if (Date.now() >= new Date(seedFound.expiresAt).getTime()) {
            return { ...seedFound, status: USER_INVITATION_STATUS.EXPIRED };
          }
        }
        return seedFound;
      }

      return null;
    } catch {
      return null;
    }
  }

  public async acceptInvitation(
    token: string,
    authUid: string
  ): Promise<{ user: ClientUser; invitation: UserInvitation }> {
    const invitation = await this.getInvitationByToken(token);

    if (!invitation) {
      throw new ClientNotFoundError('The invitation link is invalid or does not exist.');
    }

    if (invitation.status === USER_INVITATION_STATUS.REVOKED) {
      throw new ClientInvalidDataError('This invitation has been revoked by an administrator.');
    }
    if (invitation.status === USER_INVITATION_STATUS.ACCEPTED) {
      throw new ClientInvalidDataError('This invitation has already been accepted.');
    }
    if (invitation.status === USER_INVITATION_STATUS.EXPIRED || Date.now() >= new Date(invitation.expiresAt).getTime()) {
      throw new ClientInvalidDataError('This invitation has expired. Please contact your administrator.');
    }

    const nowIso = new Date().toISOString();

    // 1. Provision the activated Client User in the organization's tenant directory
    const activatedUser: ClientUser = {
      id: authUid,
      authUid,
      organizationId: invitation.organizationId,
      clientId: invitation.organizationId,
      email: invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      displayName: `${invitation.firstName} ${invitation.lastName}`.trim(),
      role: invitation.role,
      roleId: invitation.role,
      roleIds: invitation.roleIds && invitation.roleIds.length > 0 ? invitation.roleIds : [invitation.role],
      departmentIds: invitation.departmentIds || [],
      locationIds: invitation.locationIds || [],
      customPermissions: invitation.customPermissions || [],
      phone: invitation.phone,
      phoneNumber: invitation.phone,
      employeeId: invitation.employeeId,
      isEmailVerified: true,
      status: CLIENT_USER_STATUS.ACTIVE,
      lastLoginAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const acceptedInvitation: UserInvitation = {
      ...invitation,
      status: USER_INVITATION_STATUS.ACCEPTED,
      acceptedAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      if (databaseService.isConfigured()) {
        const userPath = `organizations/${invitation.organizationId}/users/${authUid}`;
        await databaseService.set(userPath, activatedUser);

        const invitePath = `organizations/${invitation.organizationId}/invitations/${invitation.id}`;
        await databaseService.update(invitePath, {
          status: USER_INVITATION_STATUS.ACCEPTED,
          acceptedAt: nowIso,
          updatedAt: nowIso,
        });
      } else {
        // Mock fallback
        const mockInvites = this.getMockInvitations(invitation.organizationId);
        const idx = mockInvites.findIndex((i) => i.id === invitation.id);
        if (idx >= 0) {
          mockInvites[idx] = acceptedInvitation;
        }
      }

      // Record administrative audit log
      try {
        if (clientDataService.hasTrustedContext()) {
          await auditService.recordEvent({
            action: AUDIT_ACTIONS.INVITATION_ACCEPTED,
            resourceType: 'invitation',
            resourceId: invitation.id,
            metadata: {
              authUid,
              email: invitation.email,
              role: invitation.role,
            },
          });
        } else {
          // Direct recording for public acceptance flow where session context is not yet loaded
          const eventId = `aud_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
          const nowIso = new Date().toISOString();
          const auditEvent = {
            id: eventId,
            clientId: invitation.organizationId,
            organizationId: invitation.organizationId,
            actorUserId: authUid,
            actor: {
              uid: authUid,
              email: invitation.email,
              displayName: `${invitation.firstName} ${invitation.lastName}`.trim(),
              role: invitation.role,
            },
            action: AUDIT_ACTIONS.INVITATION_ACCEPTED,
            resourceType: 'invitation' as const,
            resourceId: invitation.id,
            timestamp: nowIso,
            metadata: {
              authUid,
              email: invitation.email,
              role: invitation.role,
            },
          };
          if (databaseService.isConfigured()) {
            await databaseService.set(`organizations/${invitation.organizationId}/auditLogs/${eventId}`, auditEvent);
          }
        }
      } catch {
        // Non-blocking audit recording during token acceptance
      }

      return {
        user: activatedUser,
        invitation: acceptedInvitation,
      };
    } catch (err) {
      throw mapToClientServiceError(err, invitation.organizationId);
    }
  }
}

export const invitationService: InvitationService = new InvitationServiceImpl();
