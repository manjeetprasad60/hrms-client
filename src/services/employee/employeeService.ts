import { apiClient } from '../api/apiClient';
import { activityService } from '../activity/activityService';
import type { Employee, CreateEmployeePayload, UpdateEmployeePayload } from './employee.types';

type EmployeeCreateInput = Partial<Employee> & {
  readonly companyId?: string;
  readonly name?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
};

class EmployeeServiceImpl {
  /**
   * Directly posts to /employees API endpoint
   * curl --location 'http://localhost:5001/api/employees'
   */
  public async addEmployee(payload: CreateEmployeePayload): Promise<Employee> {
    if (!payload.companyId) throw new Error('Company ID is required');
    if (!payload.email) throw new Error('Employee email is required');

    const res = await apiClient.post<Employee>('/employees', payload);

    try {
      await activityService.logActivity(payload.companyId, {
        action: 'create_employee',
        description: `Created employee ${payload.name || `${payload.firstName} ${payload.lastName}`}`,
        performedBy: { userId: 'system' },
        resourceType: 'employee',
        resourceId: (res as { id?: string })?.id || `emp_${Date.now()}`,
        metadata: { email: payload.email },
        timestamp: Date.now(),
      });
    } catch {
      // Activity logging non-blocking
    }

    return res;
  }

  public async getEmployees(companyId: string): Promise<Employee[]> {
    if (!companyId) throw new Error('Company ID is required');

    try {
      const res = await apiClient.get<Record<string, Employee> | Employee[]>('/employees', {
        params: { companyId },
      });

      if (Array.isArray(res)) return res;
      if (res && typeof res === 'object') return Object.values(res);
      return [];
    } catch {
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
  }

  public async createEmployee(companyIdOrInput: string | EmployeeCreateInput, maybeInput?: EmployeeCreateInput): Promise<Employee & { companyId: string }> {
    const input = typeof companyIdOrInput === 'string' ? (maybeInput ?? {}) : companyIdOrInput;
    const companyId = typeof companyIdOrInput === 'string' ? companyIdOrInput : input.companyId ?? '';

    if (!companyId) throw new Error('Company ID is required');

    const nameParts = (input.name || '').trim().split(/\s+/);
    const resolvedFirstName = input.firstName?.trim() || nameParts[0] || '';
    const resolvedLastName = input.lastName?.trim() || nameParts.slice(1).join(' ') || '';

    if (!resolvedFirstName) throw new Error('Employee first name is required');
    if (!resolvedLastName) throw new Error('Employee last name is required');
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
    const fullName = input.name?.trim() || `${resolvedFirstName} ${resolvedLastName}`.trim();

    const employee: Employee & { companyId: string } = {
      id: employeeId,
      employeeId,
      companyId,
      name: fullName,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
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

    const apiPayload: CreateEmployeePayload = {
      companyId,
      name: fullName,
      email,
      department: input.department || '',
      designation: input.designation || '',
      status: input.status || 'active',
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
    };

    try {
      await apiClient.post('/employees', apiPayload);
    } catch {
      try {
        await apiClient.post(`companies/${companyId}/employees`, employee);
      } catch {
        // Non-blocking in dev
      }
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

  /**
   * PUT /employees/{employeeId}
   * curl -X PUT http://localhost:5001/api/employees/{employeeId} \
   *   -H "Content-Type: application/json" \
   *   -d '{"companyId": "...", "designation": "...", "status": "..."}'
   */
  public async updateEmployee(
    companyId: string,
    employeeId: string,
    updates: UpdateEmployeePayload | Partial<Employee>
  ): Promise<Employee & { companyId?: string }> {
    if (!companyId || !employeeId) throw new Error('Company ID and Employee ID are required');

    const payload: UpdateEmployeePayload = {
      companyId: (updates.companyId as string) || companyId,
      ...updates,
    };

    let updated: (Employee & { companyId?: string }) | undefined;

    try {
      updated = await apiClient.put<Employee & { companyId?: string }>(`/employees/${employeeId}`, payload);
    } catch {
      try {
        updated = await apiClient.patch<Employee & { companyId?: string }>(
          `companies/${companyId}/employees/${employeeId}`,
          payload
        );
      } catch {
        // Non-blocking in dev
      }
    }

    if (!updated || typeof updated !== 'object') {
      updated = {
        id: employeeId,
        companyId,
        ...payload,
        updatedAt: Date.now(),
      } as Employee & { companyId: string };
    }

    try {
      await activityService.logActivity(companyId, {
        action: 'update_employee',
        description: `Updated employee ${employeeId}`,
        performedBy: { userId: 'system' },
        resourceType: 'employee',
        resourceId: employeeId,
        metadata: { updates: payload },
        timestamp: Date.now(),
      });
    } catch {
      // Activity logging non-blocking
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
