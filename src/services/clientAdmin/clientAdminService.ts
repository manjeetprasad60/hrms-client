import { apiClient } from '../api/apiClient';
import type { ClientAdminInput } from './clientAdmin.types';
import type { ClientMembership } from '../membership/membership.types';
import { activityService } from '../activity/activityService';
import { companyService } from '../company/companyService';

class ClientAdminService {
  public async getAdministrators(companyId: string): Promise<ClientMembership[]> {
    if (!companyId) throw new Error('Company ID is required');
    
    try {
      const memberships = await apiClient.get<Record<string, ClientMembership> | ClientMembership[]>(
        `companies/${companyId}/administrators`
      );
      if (!memberships) return [];
      const list = Array.isArray(memberships) ? memberships : Object.values(memberships);
      return list.filter(m => m.companyId === companyId);
    } catch {
      return [];
    }
  }

  public async inviteAdministrator(companyId: string, input: ClientAdminInput, actorId: string): Promise<ClientMembership> {
    if (!companyId) throw new Error('Company ID is required');
    
    const company = await companyService.getCompany(companyId);
    if (!company) throw new Error('Company not found');
    
    const id = `mem_${Date.now().toString(36)}_${Math.random().toString(36).substring(2,6)}`;
    const invitationId = `inv_${Date.now().toString(36)}_${Math.random().toString(36).substring(2,6)}`;
    const now = Date.now();

    const membership: ClientMembership = {
      id,
      userId: '', // Set when user accepts
      companyId,
      companyDisplayId: company.displayId,
      companyName: company.displayName,
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role,
      accountStatus: 'inactive',
      invitationStatus: 'pending',
      isPrimary: false,
      createdAt: now,
      updatedAt: now
    };

    try {
      await apiClient.post(`companies/${companyId}/administrators`, {
        membership,
        invitationId,
        actorId,
      });
    } catch {
      // Non-blocking in dev
    }
    
    await activityService.logActivity(companyId, {
      action: 'invited',
      description: `Invited administrator ${input.email}`,
      performedBy: { userId: actorId },
      resourceType: 'administrator',
      resourceId: id
    });

    return membership;
  }

  public async updateAdministrator(companyId: string, membershipId: string, updates: Partial<ClientMembership>, actorId: string): Promise<ClientMembership> {
    if (!companyId || !membershipId) throw new Error('Company ID and Membership ID are required');
    
    let existing: ClientMembership | undefined;
    try {
      existing = await apiClient.get<ClientMembership>(`companies/${companyId}/administrators/${membershipId}`);
    } catch {
      // ignore
    }

    const updated: ClientMembership = {
      ...(existing ?? {
        id: membershipId,
        userId: membershipId,
        companyId,
        email: '',
        name: '',
        role: 'hr_admin',
        accountStatus: 'active',
        invitationStatus: 'accepted',
        isPrimary: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
      ...updates,
      userId: updates.userId || existing?.userId || membershipId,
      updatedAt: Date.now()
    };

    try {
      await apiClient.patch(`companies/${companyId}/administrators/${membershipId}`, updated);
    } catch {
      // Non-blocking in dev
    }
    
    await activityService.logActivity(companyId, {
      action: 'updated',
      description: `Updated administrator ${updated.email || membershipId}`,
      performedBy: { userId: actorId },
      resourceType: 'administrator',
      resourceId: membershipId
    });

    return updated;
  }

  public async deactivateAdministrator(companyId: string, membershipId: string, actorId: string): Promise<void> {
    await this.updateAdministrator(companyId, membershipId, { accountStatus: 'disabled' }, actorId);
  }
}

export const clientAdminService = new ClientAdminService();
