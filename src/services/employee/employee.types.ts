export interface Employee {
  readonly id: string;
  readonly employeeId?: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly department?: string;
  readonly departmentId?: string;
  readonly designation?: string;
  readonly jobTitle?: string;
  readonly location?: string;
  readonly locationId?: string;
  readonly employmentType: 'full_time' | 'part_time' | 'contractor' | 'intern';
  readonly status: 'active' | 'inactive' | 'on_leave' | 'probation' | 'terminated';
  readonly salary?: number;
  readonly dateOfJoining?: number;
  readonly dateOfBirth?: string;
  readonly gender?: string;
  readonly bloodGroup?: string;
  readonly emergencyContact?: { name: string; phone: string; relationship: string };
  readonly address?: { street?: string; city?: string; state?: string; zipCode?: string; country?: string };
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly createdBy?: string;
  readonly updatedBy?: string;
}
