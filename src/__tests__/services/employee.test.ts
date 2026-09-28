import { vi, describe, it, expect, beforeEach } from 'vitest';
import { employeeService } from '../../services/employee/employeeService';
import { apiClient } from '../../services/api/apiClient';
import { activityService } from '../../services/activity/activityService';

vi.mock('../../services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../services/activity/activityService', () => ({
  activityService: {
    logActivity: vi.fn(),
  },
}));

describe('EmployeeService', () => {
  const companyId = 'cmp_test_123';
  const validEmployee = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
    companyId,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  // Tests for expected behavior based on requirements
  describe('createEmployee', () => {
    it('should validate required fields (firstName, lastName, email)', async () => {
      await expect(employeeService.createEmployee({ ...validEmployee, firstName: '' })).rejects.toThrow();
      await expect(employeeService.createEmployee({ ...validEmployee, lastName: '' })).rejects.toThrow();
      await expect(employeeService.createEmployee({ ...validEmployee, email: '' })).rejects.toThrow();
    });

    it('should reject creation when companyId is missing', async () => {
      await expect(employeeService.createEmployee({ ...validEmployee, companyId: '' })).rejects.toThrow();
    });

    it('should validate email format', async () => {
      await expect(employeeService.createEmployee({ ...validEmployee, email: 'invalid-email' })).rejects.toThrow();
    });

    it('should not allow duplicate employee emails', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        emp_1: { email: validEmployee.email },
      });
      await expect(employeeService.createEmployee(validEmployee)).rejects.toThrow();
    });

    it('should generate unique employee IDs and save via backend API', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(null);
      await employeeService.createEmployee(validEmployee);

      expect(apiClient.post).toHaveBeenCalledWith(
        `companies/${companyId}/employees`,
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@test.com',
          companyId,
        })
      );
    });

    it('should create activity record on employee creation', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(null);
      await employeeService.createEmployee(validEmployee);

      expect(activityService.logActivity).toHaveBeenCalledWith(
        companyId,
        expect.objectContaining({
          action: 'create_employee',
        })
      );
    });
  });

  describe('deactivateEmployee', () => {
    it('should deactivate employee (set status to "terminated")', async () => {
      const empId = 'emp_123';
      await employeeService.deactivateEmployee(empId, companyId);

      expect(apiClient.put).toHaveBeenCalledWith(
        `companies/${companyId}/employees/${empId}`,
        expect.objectContaining({ status: 'terminated' })
      );
    });
  });
});
