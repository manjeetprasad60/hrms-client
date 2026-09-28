export interface Company {
  readonly id: string;
  readonly displayId: string;
  readonly displayName: string;
  readonly legalName?: string;
  readonly email: string;
  readonly phone?: string;
  readonly website?: string;
  readonly industry?: string;
  readonly companySize?: string;
  readonly status: 'active' | 'inactive' | 'suspended' | 'trial';
  readonly employeeCount: number;
  readonly address?: CompanyAddress;
  readonly configuration?: CompanyConfiguration;
  readonly primaryAdmin?: PrimaryAdmin;
  readonly subscription?: CompanySubscription;
  readonly activities?: Readonly<Record<string, CompanyActivityRecord>>;
  readonly administrators?: Readonly<Record<string, CompanyAdministratorRecord>>;
  readonly departments?: Readonly<Record<string, CompanyDepartmentRecord>>;
  readonly locations?: Readonly<Record<string, CompanyLocationRecord>>;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface CompanyAddress {
  readonly addressLine1?: string;
  readonly addressLine2?: string;
  readonly street?: string;
  readonly city?: string;
  readonly state?: string;
  readonly pinCode?: string;
  readonly zipCode?: string;
  readonly country?: string;
}

export interface CompanyConfiguration {
  readonly timezone?: string;
  readonly currency?: string;
  readonly dateFormat?: string;
  readonly language?: string;
  readonly financialYear?: string;
  readonly fiscalYearStart?: string;
  readonly workingWeek?: string;
}

export interface PrimaryAdmin {
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly invitationStatus?: string;
  readonly userId?: string;
  readonly membershipId?: string;
}

export interface CompanySubscription {
  readonly plan?: string;
  readonly planId?: string;
  readonly planName?: string;
  readonly status: 'active' | 'trial' | 'expired' | 'cancelled' | 'suspended';
  readonly isTrial?: boolean;
  readonly maxEmployees?: number;
  readonly monthlyRate?: number;
  readonly startDate?: number | string;
  readonly endDate?: number | string;
  readonly expiryDate?: string;
  readonly trialDurationDays?: number;
  readonly trialEndDate?: number;
}

export interface CompanyActivityRecord {
  readonly action: string;
  readonly actorId: string;
  readonly actorName: string;
  readonly category: string;
  readonly companyId: string;
  readonly companyName: string;
  readonly description: string;
  readonly id: string;
  readonly timestamp: number;
}

export interface CompanyAdministratorRecord {
  readonly companyId: string;
  readonly createdAt: number;
  readonly email: string;
  readonly id: string;
  readonly isPrimary: boolean;
  readonly name: string;
  readonly phone?: string;
  readonly role: string;
  readonly status: string;
}

export interface CompanyDepartmentRecord {
  readonly code: string;
  readonly companyId: string;
  readonly createdAt: number;
  readonly employeeCount: number;
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly updatedAt: number;
}

export interface CompanyLocationRecord {
  readonly addressLine1?: string;
  readonly addressLine2?: string;
  readonly city?: string;
  readonly code: string;
  readonly companyId: string;
  readonly country?: string;
  readonly createdAt: number;
  readonly employeeCount: number;
  readonly id: string;
  readonly isHeadquarters: boolean;
  readonly name: string;
  readonly pinCode?: string;
  readonly state?: string;
  readonly status: string;
  readonly updatedAt: number;
}
