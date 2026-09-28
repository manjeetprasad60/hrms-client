import { apiClient } from '../api/apiClient';
import type { CompanyDepartment } from './department.types';

class DepartmentServiceImpl {
  public async getDepartment(companyId: string, departmentId: string): Promise<CompanyDepartment | null> {
    if (!companyId) throw new Error('Company ID is required');
    if (!departmentId) throw new Error('Department ID is required');

    try {
      return await apiClient.get<CompanyDepartment>(`companies/${companyId}/departments/${departmentId}`);
    } catch {
      return null;
    }
  }

  public async getDepartments(companyId: string): Promise<CompanyDepartment[]> {
    if (!companyId) throw new Error('Company ID is required');

    try {
      const departments = await apiClient.get<Record<string, CompanyDepartment> | CompanyDepartment[]>(
        `companies/${companyId}/departments`
      );

      if (!departments) return [];
      if (Array.isArray(departments)) return departments;
      return Object.values(departments);
    } catch {
      return [];
    }
  }

  public async createDepartment(companyId: string, data: Partial<CompanyDepartment>): Promise<CompanyDepartment> {
    if (!companyId) throw new Error('Company ID is required');
    if (!data.name?.trim()) throw new Error('Department name is required');

    const departmentId = `dept_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();

    const department: CompanyDepartment = {
      id: departmentId,
      name: data.name.trim(),
      description: data.description,
      headName: data.headName,
      headEmail: data.headEmail,
      parentDepartmentId: data.parentDepartmentId,
      employeeCount: data.employeeCount ?? 0,
      status: data.status ?? 'active',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await apiClient.post(`companies/${companyId}/departments`, department);
    } catch {
      // Non-blocking in local/mock
    }
    return department;
  }

  public async updateDepartment(
    companyId: string,
    departmentId: string,
    updates: Partial<CompanyDepartment>
  ): Promise<CompanyDepartment> {
    if (!companyId || !departmentId) throw new Error('Company ID and Department ID are required');

    const existing = await this.getDepartment(companyId, departmentId);
    if (!existing) throw new Error('Department not found');

    const updated = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    try {
      await apiClient.patch(`companies/${companyId}/departments/${departmentId}`, updated);
    } catch {
      // Non-blocking in local/mock
    }
    return updated;
  }

  public async archiveDepartment(companyId: string, departmentId: string): Promise<CompanyDepartment> {
    if (!companyId || !departmentId) throw new Error('Company ID and Department ID are required');

    const existing = await this.getDepartment(companyId, departmentId);
    if (!existing) throw new Error('Department not found');

    const now = Date.now();
    const updated: CompanyDepartment = {
      ...existing,
      status: 'archived',
      updatedAt: now,
    };

    try {
      await apiClient.patch(`companies/${companyId}/departments/${departmentId}`, {
        status: 'archived' as const,
        updatedAt: now,
      });
    } catch {
      // Non-blocking in local/mock
    }

    return updated;
  }
}

export const departmentService = new DepartmentServiceImpl();
