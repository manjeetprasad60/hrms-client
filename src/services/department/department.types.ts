export interface CompanyDepartment {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly headName?: string;
  readonly headEmail?: string;
  readonly parentDepartmentId?: string;
  readonly employeeCount?: number;
  readonly status: 'active' | 'inactive' | 'archived';
  readonly createdAt: number;
  readonly updatedAt: number;
}
