
import { apiClient } from '../api/apiClient';
import type { CompanyActivity } from './activity.types';

class ActivityServiceImpl {
  public async getActivities(companyId?: string): Promise<CompanyActivity[]> {
    if (!companyId) return [];
    return this.getCompanyActivities(companyId);
  }

  public async getCompanyActivities(companyId: string, limit = 20): Promise<CompanyActivity[]> {
    if (!companyId) throw new Error('Company ID is required');

    try {
      const activities = await apiClient.get<Record<string, CompanyActivity> | CompanyActivity[]>(
        `companies/${companyId}/activities`,
        { params: { limit } }
      );
      if (!activities) return [];
      const list = Array.isArray(activities) ? activities : Object.values(activities);
      return list
        .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  public async logActivity(
    companyId: string,
    activity: Partial<CompanyActivity> & { action: string; description?: string; resourceType?: CompanyActivity['resourceType']; resourceId?: string; metadata?: Record<string, unknown>; }
  ): Promise<CompanyActivity> {
    if (!companyId) throw new Error('Company ID is required');
    if (!activity.action) throw new Error('Activity action is required');

    const id = `act_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();

    const nextActivity: CompanyActivity = {
      id,
      companyId,
      action: activity.action,
      description: activity.description ?? activity.action,
      performedBy: activity.performedBy ?? { userId: 'system' },
      resourceType: activity.resourceType ?? 'company',
      resourceId: activity.resourceId,
      metadata: activity.metadata ?? {},
      timestamp: activity.timestamp ?? now,
    };

    try {
      await apiClient.post(`companies/${companyId}/activities`, nextActivity);
    } catch {
      // Non-blocking in dev
    }
    return nextActivity;
  }
}

export const activityService = new ActivityServiceImpl();
