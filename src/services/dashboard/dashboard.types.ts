import type { CompanyActivity } from '../activity/activity.types';

export interface DashboardData {
  readonly employeeCount: number;
  readonly activeAdministrators: number;
  readonly departmentCount: number;
  readonly locationCount: number;
  readonly subscription: {
    planName: string;
    status: string;
    trialEndDate?: number;
    renewalDate?: number;
  } | null;
  readonly usage: {
    employees: { current: number; limit: number };
    admins: { current: number; limit: number };
    departments: { current: number; limit: number };
    locations: { current: number; limit: number };
  } | null;
  readonly recentActivities: CompanyActivity[];
}
