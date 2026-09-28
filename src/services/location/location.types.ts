export interface CompanyLocation {
  readonly id: string;
  readonly name: string;
  readonly type: 'headquarters' | 'branch' | 'remote' | 'warehouse';
  readonly address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  readonly phone?: string;
  readonly email?: string;
  readonly timezone?: string;
  readonly isHeadquarters: boolean;
  readonly employeeCount?: number;
  readonly status: 'active' | 'inactive' | 'archived';
  readonly createdAt: number;
  readonly updatedAt: number;
}
