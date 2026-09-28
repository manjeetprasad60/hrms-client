import { apiClient } from '../api/apiClient';
import { activityService } from '../activity/activityService';
import type { Employee } from './employee.types';

type EmployeeCreateInput = Partial<Employee> & {
  readonly companyId?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
};

class EmployeeServiceImpl {
  public async getEmployees(companyId: string): Promise<Employee[]> {
    if (!companyId) throw new Error('Company ID is required');

    try {
      const employees = await apiClient.get<Record<string, Employee & { companyId?: string }> | (Employee & { companyId?: string })[]>(
        `companies/${companyId}/employees`
      );

      if (!employees) return [];
      if (Array.isArray(employees)) return employees;
      return Object.values(employees);
    } catch {
      return [];
    }
  }

  public async createEmployee(companyIdOrInput: string | EmployeeCreateInput, maybeInput?: EmployeeCreateInput): Promise<Employee & { companyId: string }> {
    const input = typeof companyIdOrInput === 'string' ? (maybeInput ?? {}) : companyIdOrInput;
    const companyId = typeof companyIdOrInput === 'string' ? companyIdOrInput : input.companyId ?? '';

    if (!companyId) throw new Error('Company ID is required');
    if (!input.firstName?.trim()) throw new Error('Employee first name is required');
    if (!input.lastName?.trim()) throw new Error('Employee last name is required');
    if (!input.email?.trim()) throw new Error('Employee email is required');

    const email = input.email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      throw new Error('Employee email format is invalid');
    }

    const employees = await this.getEmployees(companyId);
    if (employees.length > 0) {
      const duplicate = employees.some((employee) => employee.email?.toLowerCase() === email);
      if (duplicate) {
        throw new Error('Employee email already exists');
      }
    }

    const employeeId = `emp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();

    const employee: Employee & { companyId: string } = {
      id: employeeId,
      employeeId,
      companyId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      phone: input.phone,
      department: input.department,
      departmentId: input.departmentId,
      designation: input.designation,
      jobTitle: input.jobTitle,
      location: input.location,
      locationId: input.locationId,
      employmentType: input.employmentType ?? 'full_time',
      status: input.status ?? 'active',
      salary: input.salary,
      dateOfJoining: input.dateOfJoining,
      gender: input.gender,
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
      updatedBy: input.updatedBy,
    };

    try {
      await apiClient.post(`companies/${companyId}/employees`, employee);
    } catch {
      // Non-blocking in dev
    }

    await activityService.logActivity(companyId, {
      action: 'create_employee',
      description: `Created employee ${employee.firstName} ${employee.lastName}`,
      performedBy: { userId: 'system' },
      resourceType: 'employee',
      resourceId: employeeId,
      metadata: { email: employee.email },
      timestamp: now,
    });

    return employee;
  }

  public async updateEmployee(
    companyId: string,
    employeeId: string,
    updates: Partial<Employee & { companyId?: string }>
  ): Promise<Employee & { companyId?: string }> {
    if (!companyId || !employeeId) throw new Error('Company ID and Employee ID are required');

    let existing: (Employee & { companyId?: string }) | undefined;
    try {
      existing = await apiClient.get<Employee & { companyId?: string }>(
        `companies/${companyId}/employees/${employeeId}`
      );
    } catch {
      // ignore
    }

    const updated = {
      ...(existing ?? {}),
      ...updates,
      id: employeeId,
      companyId,
      updatedAt: Date.now(),
    } as Employee & { companyId?: string };

    try {
      await apiClient.patch(`companies/${companyId}/employees/${employeeId}`, updated);
    } catch {
      // Non-blocking in dev
    }
    return updated;
  }

  public async deactivateEmployee(employeeId: string, companyId: string): Promise<Employee & { companyId?: string } | null> {
    if (!companyId || !employeeId) throw new Error('Company ID and Employee ID are required');

    let current: (Employee & { companyId?: string }) | undefined;
    try {
      current = await apiClient.get<Employee & { companyId?: string }>(
        `companies/${companyId}/employees/${employeeId}`
      );
    } catch {
      // ignore
    }

    const now = Date.now();
    const updated = {
      ...(current ?? {}),
      id: employeeId,
      companyId,
      status: 'terminated',
      updatedAt: now,
    };

    try {
      await apiClient.patch(`companies/${companyId}/employees/${employeeId}`, {
        status: 'terminated',
        updatedAt: now,
      });
    } catch {
      // Non-blocking in dev
    }

    return updated as Employee & { companyId?: string };
  }
}

export const employeeService = new EmployeeServiceImpl();
