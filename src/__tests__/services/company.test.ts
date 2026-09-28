import { vi, describe, it, expect, beforeEach } from 'vitest';
import { companyService } from '../../services/company/companyService';
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

vi.mock('../../services/dashboard/dashboardService', () => ({
  dashboardService: {
    getDashboard: vi.fn(),
  },
}));

describe('CompanyService', () => {
  const company = FIXTURES.companies.flextr;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getCompany', () => {
    it('should validate companyId is non-empty', async () => {
      await expect(companyService.getCompany('')).rejects.toThrow('Company ID is required');
    });

    it('should fetch company via backend API endpoint: /companies/{companyId}', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(company);
      await companyService.getCompany(company.id);
      expect(apiClient.get).toHaveBeenCalledWith(`/companies/${company.id}`);
    });

    it('should handle company not found', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(null);
      const result = await companyService.getCompany('invalid_id');
      expect(result).toBeNull();
    });

    it('should correctly identify active vs suspended companies', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ ...company, status: 'suspended' });
      const result = await companyService.getCompany(company.id);
      expect(result?.status).toBe('suspended');
    });
  });

  describe('updateCompany', () => {
    it('should validate companyId is non-empty', async () => {
      await expect(companyService.updateCompany('', { displayName: 'Test' })).rejects.toThrow('Company ID is required');
    });

    it('should send update payload with updatedAt timestamp', async () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      await companyService.updateCompany(company.id, { displayName: 'New Name' });
      expect(apiClient.put).toHaveBeenCalledWith(`/companies/${company.id}`, {
        displayName: 'New Name',
        updatedAt: now,
      });

      vi.restoreAllMocks();
    });

    it('should use epoch-millisecond timestamps', async () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      await companyService.updateCompany(company.id, {});
      expect(apiClient.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ updatedAt: now })
      );

      expect(typeof now).toBe('number');
      expect(now).toBeGreaterThan(1600000000000);

      vi.restoreAllMocks();
    });
  });
});
