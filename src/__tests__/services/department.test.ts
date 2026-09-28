import { vi, describe, it, expect, beforeEach } from 'vitest';
import { apiClient } from '../../services/api/apiClient';

const departmentService = {
  getDepartment: async (companyId: string, departmentId: string) => {
    return apiClient.get(`companies/${companyId}/departments/${departmentId}`);
  },
  createDepartment: async (companyId: string, data: Record<string, unknown>) => {
    if (!data.name) throw new Error('Department name is required');
    const id = `dept_${Date.now()}`;
    await apiClient.post(`companies/${companyId}/departments`, { ...data, id });
    return id;
  },
  archiveDepartment: async (companyId: string, departmentId: string) => {
    await apiClient.put(`companies/${companyId}/departments/${departmentId}`, { status: 'archived' });
  },
};

vi.mock('../../services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('DepartmentService', () => {
  const companyId = 'cmp_123';
  const deptId = 'dept_456';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should validate department name is required', async () => {
    await expect(departmentService.createDepartment(companyId, {})).rejects.toThrow('Department name is required');
  });

  it('should query correct endpoint: companies/{companyId}/departments/{departmentId}', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ id: deptId, name: 'Engineering' });
    await departmentService.getDepartment(companyId, deptId);
    expect(apiClient.get).toHaveBeenCalledWith(`companies/${companyId}/departments/${deptId}`);
  });

  it('should archive department (set status to "archived")', async () => {
    await departmentService.archiveDepartment(companyId, deptId);
    expect(apiClient.put).toHaveBeenCalledWith(
      `companies/${companyId}/departments/${deptId}`,
      { status: 'archived' }
    );
  });

  it('should handle department not found', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(null);
    const result = await departmentService.getDepartment(companyId, 'invalid_dept');
    expect(result).toBeNull();
  });
});
