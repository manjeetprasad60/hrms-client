/**
 * Employee Data Boundary Types
 *
 * Lightweight contract for employee references within organization,
 * department, and location management. Full module will be implemented in future phase.
 */

export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'intern';
export type EmploymentStatus = 'active' | 'on_leave' | 'probation' | 'terminated';

export interface EmployeeSummary {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeNumber: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly avatarUrl?: string;
  readonly departmentId: string;
  readonly locationId: string;
  readonly jobTitle: string;
  readonly employmentType: EmploymentType;
  readonly status: EmploymentStatus;
  readonly managerId?: string;
  readonly joinedAt: string;
}
