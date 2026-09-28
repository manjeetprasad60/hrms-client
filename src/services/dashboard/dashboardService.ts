import { companyService } from '../company/companyService';
import { employeeService } from '../employee/employeeService';
import { departmentService } from '../department/departmentService';
import { locationService } from '../location/locationService';
import { clientAdminService } from '../clientAdmin/clientAdminService';
import { subscriptionService } from '../subscription/subscriptionService';
import { activityService } from '../activity/activityService';
import type { DashboardData } from './dashboard.types';

class DashboardService {
  public async getDashboard(companyId: string): Promise<DashboardData> {
    if (!companyId) throw new Error('Company ID is required');

    const [
      , // ignore companyResult
      employeesResult,
      departmentsResult,
      locationsResult,
      adminsResult,
      subscriptionResult,
      activitiesResult
    ] = await Promise.allSettled([
      companyService.getCompany(companyId),
      employeeService.getEmployees(companyId),
      departmentService.getDepartments(companyId),
      locationService.getLocations(companyId),
      clientAdminService.getAdministrators(companyId),
      subscriptionService.getSubscriptionByCompany(companyId),
      activityService.getCompanyActivities(companyId, 10)
    ]);

    // companyResult is intentionally ignored if company is unused
    const employees = employeesResult.status === 'fulfilled' ? employeesResult.value : [];
    const departments = departmentsResult.status === 'fulfilled' ? departmentsResult.value : [];
    const locations = locationsResult.status === 'fulfilled' ? locationsResult.value : [];
    const admins = adminsResult.status === 'fulfilled' ? adminsResult.value : [];
    const subscription = subscriptionResult.status === 'fulfilled' ? subscriptionResult.value : null;
    const recentActivities = activitiesResult.status === 'fulfilled' ? activitiesResult.value : [];

    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const activeAdmins = admins.filter(a => a.accountStatus === 'active').length;
    const activeDepartments = departments.filter(d => d.status === 'active').length;
    const activeLocations = locations.filter(l => l.status === 'active').length;

    let planLimits = {
      maxEmployees: 100, // Defaults if plan limits aren't found
      maxAdmins: 5,
      maxDepartments: 10,
      maxLocations: 5
    };

    if (subscription && subscription.planId) {
      try {
        const plan = await subscriptionService.getPlan(subscription.planId);
        if (plan && plan.limits) {
          planLimits = {
            maxEmployees: plan.limits.maxEmployees ?? planLimits.maxEmployees,
            maxAdmins: plan.limits.maxAdmins ?? planLimits.maxAdmins,
            maxDepartments: plan.limits.maxDepartments ?? planLimits.maxDepartments,
            maxLocations: plan.limits.maxLocations ?? planLimits.maxLocations
          };
        }
      } catch (e) {
        console.warn('Failed to fetch plan limits', e);
      }
    }

    return {
      employeeCount: activeEmployees,
      activeAdministrators: activeAdmins,
      departmentCount: activeDepartments,
      locationCount: activeLocations,
      subscription: subscription ? {
        planName: subscription.planName || 'Unknown Plan',
        status: subscription.status,
        trialEndDate: subscription.trialEnd,
        renewalDate: subscription.currentPeriodEnd
      } : null,
      usage: {
        employees: { current: activeEmployees, limit: planLimits.maxEmployees },
        admins: { current: activeAdmins, limit: planLimits.maxAdmins },
        departments: { current: activeDepartments, limit: planLimits.maxDepartments },
        locations: { current: activeLocations, limit: planLimits.maxLocations }
      },
      recentActivities
    };
  }
}

export const dashboardService = new DashboardService();
