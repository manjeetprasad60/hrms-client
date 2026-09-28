import { apiClient } from '../api/apiClient';
import type { ClientMembership } from './membership.types';

class MembershipService {
  public async getCurrentMembership(uid: string, email: string): Promise<ClientMembership | null> {
    try {
      const memberships = await apiClient.get<Record<string, ClientMembership> | ClientMembership[]>('clientAdminMemberships');
      if (!memberships) return null;

      const normalizedEmail = email.toLowerCase();
      const list = Array.isArray(memberships) ? memberships : Object.values(memberships);
      const membership = list.find(m => 
        (m.userId === uid || m.email.toLowerCase() === normalizedEmail) &&
        m.accountStatus === 'active' &&
        m.invitationStatus === 'accepted'
      );

      return membership || null;
    } catch {
      return null;
    }
  }

  public async getMembershipsByCompany(companyId: string): Promise<ClientMembership[]> {
    if (!companyId) throw new Error('Company ID is required');

    try {
      const memberships = await apiClient.get<Record<string, ClientMembership> | ClientMembership[]>(
        `companies/${companyId}/memberships`
      );
      if (!memberships) return [];
      const list = Array.isArray(memberships) ? memberships : Object.values(memberships);
      return list.filter(m => m.companyId === companyId);
    } catch {
      return [];
    }
  }

  public async updateMembership(membershipId: string, updates: Partial<ClientMembership>): Promise<void> {
    if (!membershipId) throw new Error('Membership ID is required');
    try {
      await apiClient.patch<ClientMembership>(`clientAdminMemberships/${membershipId}`, {
        ...updates,
        updatedAt: Date.now()
      });
    } catch {
      // Non-blocking in dev
    }
  }
}

export const membershipService = new MembershipService();
