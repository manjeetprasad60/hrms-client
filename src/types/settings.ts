/**
 * Organization-Level Settings Model
 *
 * Configures client company defaults, operational policies, and module toggles.
 */

export interface LocalizationSettings {
  readonly defaultCountry?: string;
  readonly defaultTimezone: string;
  readonly defaultCurrency: string;
  readonly dateFormat: string;
  readonly timeFormat: '12h' | '24h';
  readonly defaultLanguage: string;
}

export interface BrandingSettings {
  readonly primaryColor?: string;
  readonly accentColor?: string;
  readonly logoUrl?: string;
  readonly portalTitle?: string;
  readonly theme?: 'light' | 'dark' | 'system';
}

export interface NotificationSettings {
  readonly emailNotificationsEnabled: boolean;
  readonly dailyDigestEnabled: boolean;
  readonly notifyOnLeaveRequests: boolean;
  readonly notifyOnAttendanceAnomalies: boolean;
  readonly notifyOnPayrollDisbursements: boolean;
}

export interface SecuritySettings {
  readonly requireTwoFactorAuth: boolean;
  readonly sessionTimeoutMinutes: number;
  readonly passwordExpiryDays: number;
  readonly allowMultipleSessions: boolean;
}

export interface WorkScheduleSettings {
  readonly workDays: readonly number[]; // 0 = Sunday, 1 = Monday, etc.
  readonly standardWorkHoursPerDay: number;
  readonly flexibleHoursAllowed: boolean;
}

export interface FiscalYearSettings {
  readonly startMonth: number; // 1 to 12
  readonly startDay: number;   // 1 to 31
}

export interface AttendancePolicySettings {
  readonly requireGeofencing: boolean;
  readonly allowIpRestriction: boolean;
  readonly overtimeThresholdHoursPerWeek: number;
  readonly autoApproveCheckins: boolean;
}

export interface LeavePolicySettings {
  readonly leaveYearCycle: 'calendar_year' | 'fiscal_year' | 'hire_date';
  readonly allowNegativeBalance: boolean;
  readonly requireManagerApproval: boolean;
}

export interface PayrollPolicySettings {
  readonly payFrequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  readonly currency: string;
  readonly taxId?: string;
}

export interface OrganizationSettings {
  readonly organizationId: string;
  readonly localization: LocalizationSettings;
  readonly branding?: BrandingSettings;
  readonly workSchedule: WorkScheduleSettings;
  readonly notifications?: NotificationSettings;
  readonly security?: SecuritySettings;
  readonly fiscalYear: FiscalYearSettings;
  readonly enabledModules: readonly string[];
  readonly attendance: AttendancePolicySettings;
  readonly leaves: LeavePolicySettings;
  readonly payroll: PayrollPolicySettings;
  readonly updatedAt: string;
}

export type ClientSettings = OrganizationSettings;

export type UpdateClientSettingsInput = Omit<
  Partial<OrganizationSettings>,
  'organizationId' | 'updatedAt'
>;
