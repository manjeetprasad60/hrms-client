export interface Subscription {
  readonly id: string;
  readonly companyId: string;
  readonly planId: string;
  readonly planName?: string;
  readonly status: 'active' | 'trial' | 'expired' | 'cancelled' | 'past_due';
  readonly currentPeriodStart?: number;
  readonly currentPeriodEnd?: number;
  readonly trialEnd?: number;
  readonly cancelledAt?: number;
  readonly features?: Record<string, boolean | number | string>;
  readonly limits?: {
    maxEmployees?: number;
    maxAdmins?: number;
    maxDepartments?: number;
    maxLocations?: number;
    maxStorage?: number;
  };
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface Plan {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly price?: number;
  readonly interval?: 'monthly' | 'yearly';
  readonly features?: Record<string, boolean | number | string>;
  readonly limits?: {
    maxEmployees?: number;
    maxAdmins?: number;
    maxDepartments?: number;
    maxLocations?: number;
    maxStorage?: number;
  };
  readonly status: 'active' | 'deprecated';
}
