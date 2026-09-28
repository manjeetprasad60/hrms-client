import { apiClient } from '../api/apiClient';
import { companyService } from '../company/companyService';
import type { Plan, Subscription } from './subscription.types';

class SubscriptionServiceImpl {
  public async getSubscription(companyId: string): Promise<Subscription | null> {
    if (!companyId) throw new Error('Company ID is required');
    return this.getSubscriptionByCompany(companyId);
  }

  public async getSubscriptionByCompany(companyId: string): Promise<Subscription | null> {
    if (!companyId) throw new Error('Company ID is required');

    const company = await companyService.getCompany(companyId);
    if (company?.subscription && typeof company.subscription === 'object') {
      return company.subscription as Subscription;
    }

    try {
      const subscription = await apiClient.get<Subscription>(`companies/${companyId}/subscription`);
      if (subscription) return subscription;
    } catch {
      // ignore
    }

    return null;
  }

  public async getPlan(planId: string): Promise<Plan | null> {
    if (!planId) throw new Error('Plan ID is required');
    try {
      return await apiClient.get<Plan>(`plans/${planId}`);
    } catch {
      return null;
    }
  }
}

export const subscriptionService = new SubscriptionServiceImpl();
