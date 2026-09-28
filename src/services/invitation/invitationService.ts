/**
 * Organization User Invitation Service Implementation
 *
 * Manages the complete invitation lifecycle:
 * pending -> accepted | expired | revoked
 *
 * Enforces role delegation authorization, tenant isolation, and non-destructive transitions.
 */

import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import {
  verifyClientInvitation,
  acceptClientInvitation,
  createAuthUser,
  buildCreateAuthUserPayload,
} from './clientInviteApiService';
import { clientDataService } from '../client/clientDataService';
import { auditService } from '../audit/auditService';
import { AUDIT_ACTIONS } from '../../types/audit';
import { authService } from '../auth';
import { companyService } from '../company/companyService';
import {
  ClientInvalidDataError,
  ClientNotFoundError,
  ClientUnauthorizedError,
  mapToClientServiceError,
} from '../client/clientErrors';
import { canAssignRole, type ClientRole } from '../../permissions/roles';
import { CLIENT_USER_STATUS, type ClientUser } from '../../types/auth';
import {
  USER_INVITATION_STATUS,
  type UserInvitation,
  type CreateInvitationInput,
  type UserInvitationStatus,
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
      let list: UserInvitation[] = [];
      try {
        const path = API_ENDPOINTS.organization.invitations(ctx.organizationId);
        const raw = await apiClient.get<UserInvitation[] | Record<string, UserInvitation>>(path);
        if (raw && typeof raw === 'object') {
          list = Array.isArray(raw) ? raw : Object.entries(raw).map(([key, val]) => ({
            ...val,
            id: val.id || key,
          }));
        }
      } catch {
        list = this.getMockInvitations(ctx.organizationId);
      }

      if (list.length === 0) {
        list = this.getMockInvitations(ctx.organizationId);
      }
      return list.map((inv) => {
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
      try {
        const path = API_ENDPOINTS.organization.invitations(ctx.organizationId);
        await apiClient.post(path, invitation);
      } catch {
        // Fallback or API offline
      }
      const mockList = this.getMockInvitations(ctx.organizationId);
      mockList.unshift(invitation);

      // Dispatch invitation through backend email delivery boundary
      const acceptUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://portal.clienthris.com'}/accept-invitation?token=${token}&email=${encodeURIComponent(invitation.email)}`;
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
      try {
        const path = API_ENDPOINTS.organization.invitation(ctx.organizationId, invitationId);
        await apiClient.put(path, updatedInvitation);
      } catch {
        // Fallback or API offline
      }
      const mockList = this.getMockInvitations(ctx.organizationId);
      const idx = mockList.findIndex((i) => i.id === invitationId);
      if (idx >= 0) {
        mockList[idx] = updatedInvitation;
      }

      const acceptUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://portal.clienthris.com'}/accept-invitation?token=${updatedInvitation.token}&email=${encodeURIComponent(updatedInvitation.email)}`;
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
      try {
        const path = API_ENDPOINTS.organization.invitation(ctx.organizationId, invitationId);
        await apiClient.put(path, revokedInvitation);
      } catch {
        // Fallback or API offline
      }
      const mockList = this.getMockInvitations(ctx.organizationId);
      const idx = mockList.findIndex((i) => i.id === invitationId);
      if (idx >= 0) {
        mockList[idx] = revokedInvitation;
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
      try {
        const verifyRes = await verifyClientInvitation(cleanToken);
        if (verifyRes.success && verifyRes.data) {
          const data = verifyRes.data;
          const [firstName, ...lastParts] = (data.name || '').split(' ');
          const lastName = lastParts.join(' ') || '';
          const mapped: UserInvitation = {
            id: data.invitationId || `inv_${cleanToken}`,
            organizationId: data.organizationName || 'org_client_01',
            organizationName: data.organizationName || data.companyName || 'Organization',
            clientId: data.clientId,
            email: data.email,
            firstName: firstName || 'Invited',
            lastName: lastName || 'User',
            role: (data.role as ClientRole) || 'employee',
            roleIds: [(data.role as ClientRole) || 'employee'],
            departmentIds: data.departmentIds || [],
            locationIds: data.locationIds || [],
            customPermissions: data.customPermissions || [],
            phone: data.phone || data.phoneNumber,
            phoneNumber: data.phoneNumber || data.phone,
            photoURL: data.photoURL,
            avatarUrl: data.avatarUrl,
            employeeId: data.employeeId,
            invitedBy: {
              uid: 'admin',
              name: data.invitedBy || 'Administrator',
              email: 'admin@company.com',
            },
            status: data.status === 'pending' ? USER_INVITATION_STATUS.PENDING : (data.status as UserInvitationStatus),
            token: cleanToken,
            expiresAt: data.expiresAt || new Date(Date.now() + 86400000).toISOString(),
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          if (mapped.status === USER_INVITATION_STATUS.PENDING) {
            if (Date.now() >= new Date(mapped.expiresAt).getTime()) {
              return { ...mapped, status: USER_INVITATION_STATUS.EXPIRED };
            }
          }
          return mapped;
        }
      } catch {
        // Backend API offline or token unverified by server; fallback to local mock
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
  ): Promise<{ user: ClientUser; invitation: UserInvitation; companyId: string }> {
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

    try {
      const acceptance = await acceptClientInvitation(token, invitation.email, authUid);
      const companyId = acceptance.data?.companyId || acceptance.companyId;
      if (!companyId) {
        throw new Error('Invitation acceptance did not return a company ID.');
      }

      let company = null;
      try {
        company = await companyService.getCompany(companyId);
      } catch {
        company = null;
      }

      const companyDisplayName =
        ((acceptance.data as Record<string, unknown>)?.companyName as string) ||
        ((acceptance.data as Record<string, unknown>)?.organizationName as string) ||
        company?.displayName ||
        company?.legalName ||
        invitation.organizationName ||
        companyId;

      authService.setCompanyContext(companyId, companyDisplayName);

      const orgName = companyDisplayName;
      const orgSlug =
        ((acceptance.data as Record<string, unknown>)?.companySlug as string) ||
        ((acceptance.data as Record<string, unknown>)?.organizationSlug as string) ||
        (company as unknown as { slug?: string })?.slug ||
        orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
        'organization';

      const clientId =
        ((acceptance.data as Record<string, unknown>)?.clientId as string) ||
        acceptance.clientId ||
        invitation.clientId ||
        company?.displayId ||
        companyId;

      // Construct payload and invoke POST /api/auth/user
      const userPayload = buildCreateAuthUserPayload({
        authUid,
        companyId,
        invitation,
        organizationName: orgName,
        organizationSlug: orgSlug,
        clientId,
      });

      await createAuthUser(userPayload);

      const activatedUser: ClientUser = {
        id: authUid,
        authUid,
        organizationId: companyId,
        clientId,
        email: invitation.email,
        firstName: userPayload.firstName,
        lastName: userPayload.lastName,
        displayName: userPayload.displayName,
        role: invitation.role,
        roleId: userPayload.roleId,
        roleIds: userPayload.roleIds,
        departmentIds: userPayload.departmentIds,
        locationIds: userPayload.locationIds,
        customPermissions: userPayload.customPermissions,
        phone: userPayload.phone,
        phoneNumber: userPayload.phoneNumber,
        photoURL: userPayload.photoURL,
        avatarUrl: userPayload.avatarUrl,
        employeeId: userPayload.employeeId,
        isEmailVerified: true,
        status: CLIENT_USER_STATUS.ACTIVE,
        lastLoginAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const acceptedInvitation: UserInvitation = {
        ...invitation,
        organizationId: companyId,
        status: USER_INVITATION_STATUS.ACCEPTED,
        acceptedAt: nowIso,
        updatedAt: nowIso,
      };

      const mockInvites = this.getMockInvitations(invitation.organizationId);
      const idx = mockInvites.findIndex((i) => i.id === invitation.id);
      if (idx >= 0) {
        mockInvites[idx] = acceptedInvitation;
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
        }
      } catch {
        // Non-blocking audit recording during token acceptance
      }

      return {
        user: activatedUser,
        invitation: acceptedInvitation,
        companyId,
      };
    } catch (err) {
      throw mapToClientServiceError(err, invitation.organizationId);
    }
  }
}

export const invitationService: InvitationService = new InvitationServiceImpl();
