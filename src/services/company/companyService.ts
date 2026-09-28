import { apiClient } from '../api/apiClient';
import type { Company } from './company.types';
import type { DashboardData } from '../dashboard/dashboard.types';

class CompanyService {
  public async getCompany(companyId: string): Promise<Company | null> {
    if (!companyId) throw new Error('Company ID is required');
    try {
      return await apiClient.get<Company>(`/companies/${companyId}`);
    } catch {
      return null;
    }
  }

  public async updateCompany(companyId: string, updates: Partial<Company>): Promise<void> {
    if (!companyId) throw new Error('Company ID is required');
    await apiClient.patch<Company>(`/companies/${companyId}`, {
      ...updates,
      updatedAt: Date.now()
    });
  }

  public async getCompanyDashboard(companyId: string): Promise<DashboardData> {
    if (!companyId) throw new Error('Company ID is required');
    const { dashboardService } = await import('../dashboard/dashboardService');
    return dashboardService.getDashboard(companyId);
  }
}

export const companyService = new CompanyService();
