import { vi, describe, it, expect, beforeEach } from 'vitest';
import { membershipService } from '../../services/membership/membershipService';
import { apiClient } from '../../services/api/apiClient';
import { FIXTURES } from '../fixtures';

vi.mock('../../services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('MembershipService', () => {
  const activeMembership = FIXTURES.memberships.flextrOwner;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getCurrentMembership', () => {
    it('should return null if backend returns null', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(null);

      const result = await membershipService.getCurrentMembership('uid_123', 'test@test.com');
      expect(result).toBeNull();
    });

    it('should accept active membership with accepted invitation by userId', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        [activeMembership.id]: activeMembership,
      });

      const result = await membershipService.getCurrentMembership(activeMembership.userId, 'different@test.com');
      expect(result).toEqual(activeMembership);
    });

    it('should accept active membership by normalized email', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        [activeMembership.id]: activeMembership,
      });

      const result = await membershipService.getCurrentMembership('different_uid', activeMembership.email.toUpperCase());
      expect(result).toEqual(activeMembership);
    });

    it('should reject disabled membership (accountStatus: "disabled")', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        [activeMembership.id]: { ...activeMembership, accountStatus: 'disabled' },
      });

      const result = await membershipService.getCurrentMembership(activeMembership.userId, activeMembership.email);
      expect(result).toBeNull();
    });

    it('should reject suspended membership (accountStatus: "suspended")', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        [activeMembership.id]: { ...activeMembership, accountStatus: 'suspended' },
      });

      const result = await membershipService.getCurrentMembership(activeMembership.userId, activeMembership.email);
      expect(result).toBeNull();
    });

    it('should reject expired invitation (invitationStatus: "expired")', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        [activeMembership.id]: { ...activeMembership, invitationStatus: 'expired' },
      });

      const result = await membershipService.getCurrentMembership(activeMembership.userId, activeMembership.email);
      expect(result).toBeNull();
    });

    it('should reject revoked invitation (invitationStatus: "revoked")', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        [activeMembership.id]: { ...activeMembership, invitationStatus: 'revoked' },
      });

      const result = await membershipService.getCurrentMembership(activeMembership.userId, activeMembership.email);
      expect(result).toBeNull();
    });
  });

  describe('getMembershipsByCompany', () => {
    it('should validate companyId is non-empty', async () => {
      await expect(membershipService.getMembershipsByCompany('')).rejects.toThrow('Company ID is required');
    });

    it('should filter memberships by companyId (tenant isolation)', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        [activeMembership.id]: activeMembership,
        [FIXTURES.memberships.naukrigramOwner.id]: FIXTURES.memberships.naukrigramOwner,
      });

      const result = await membershipService.getMembershipsByCompany(activeMembership.companyId);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(activeMembership);
    });
  });

  describe('updateMembership', () => {
    it('should throw if membershipId is missing', async () => {
      await expect(membershipService.updateMembership('', { name: 'Test' })).rejects.toThrow('Membership ID is required');
    });

    it('should update membership with timestamp', async () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      await membershipService.updateMembership(activeMembership.id, { name: 'Updated Name' });

      expect(apiClient.put).toHaveBeenCalledWith(`clientAdminMemberships/${activeMembership.id}`, {
        name: 'Updated Name',
        updatedAt: now,
      });

      vi.restoreAllMocks();
    });
  });
});
