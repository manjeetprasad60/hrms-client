export interface CompanyActivity {
  readonly id: string;
  readonly companyId: string;
  readonly action: string;
  readonly description: string;
  readonly performedBy: { userId: string; name?: string; email?: string };
  readonly resourceType: 'employee' | 'department' | 'location' | 'administrator' | 'company' | 'document' | 'subscription';
  readonly resourceId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly timestamp: number;
}
