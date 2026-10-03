import { vi, describe, it, expect, beforeEach } from 'vitest';
import { attendanceService, DEFAULT_COMPANY_ID } from '../../services/attendance/attendanceService';
import { apiClient } from '../../services/api/apiClient';

vi.mock('../../services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('AttendanceService - GET APIs', () => {
  const companyId = 'cmp_hrms_28_2886';
  const mockApiResponse = [
    {
      id: 'att_emp_001_20260930_dae56b',
      companyId,
      employeeId: 'emp_001',
      date: '2026-09-30',
      clockIn: '08:58 AM',
      clockOut: '05:30 PM',
      workMode: 'office',
      location: 'Bangalore HQ - Floor 4',
      status: 'present',
      breakDurationMinutes: 45,
      duration: {
        formattedWorkHours: '7h 47m',
        netWorkMinutes: 467,
        totalWorkHoursDecimal: 7.78,
      },
      ipAddress: '192.168.1.104',
      deviceInfo: 'Biometric Terminal B4 (Face ID)',
      coordinates: {
        accuracy: 15,
        latitude: 12.9716,
        longitude: 77.5946,
      },
      verified: true,
      verificationMethod: 'biometric',
      notes: 'Completed daily tasks and sprint review',
      createdAt: 1790782632471,
      updatedAt: 1790782920784,
    },
    {
      id: 'att_emp_001_2026101_d25d50',
      companyId,
      employeeId: 'emp_001',
      date: '2026-10-01',
      clockIn: '08:58 AM',
      clockOut: null,
      workMode: 'office',
      location: 'Bangalore HQ - Floor 4',
      status: 'present',
      breakDurationMinutes: 0,
      ipAddress: '192.168.1.104',
      deviceInfo: 'Biometric Terminal B4 (Face ID)',
      verified: true,
      verificationMethod: 'biometric',
      notes: 'Regular on-time arrival',
      createdAt: 1790783034091,
      updatedAt: 1790783034091,
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('1. Get all for a company', () => {
    // curl -X GET "http://localhost:5001/api/attendance?companyId=cmp_hrms_28_2886"
    it('should call GET /attendance with companyId and map records properly', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const records = await attendanceService.getAllForCompany(companyId);

      expect(apiClient.get).toHaveBeenCalledWith('/attendance', {
        params: { companyId },
      });
      expect(records).toHaveLength(2);
      expect(records[0]!.id).toBe('att_emp_001_20260930_dae56b');
      expect(records[0]!.employeeId).toBe('emp_001');
      expect(records[0]!.employeeName).toBe('Rajesh Kumar');
      expect(records[0]!.workDurationHours).toBe(7.8);
      expect(records[0]!.status).toBe('present');
    });

    it('should work via getCheckIns with companyId argument', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const records = await attendanceService.getCheckIns(companyId);

      expect(apiClient.get).toHaveBeenCalledWith('/attendance', {
        params: { companyId },
      });
      expect(records).toHaveLength(2);
    });

    it('should extract unique employees from api/attendance via getEmployeesFromAttendance', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const employees = await attendanceService.getEmployeesFromAttendance(companyId);

      expect(apiClient.get).toHaveBeenCalledWith('/attendance', {
        params: { companyId },
      });
      expect(employees).toHaveLength(1);
      expect(employees[0]!.id).toBe('emp_001');
      expect(employees[0]!.name).toBe('Rajesh Kumar');
      expect(employees[0]!.department).toBe('Engineering');
    });
  });

  describe('2. Filter by employee and specific date', () => {
    // curl -X GET "http://localhost:5001/api/attendance?companyId=cmp_hrms_28_2886&employeeId=emp_001&date=2026-09-30"
    it('should call GET /attendance with companyId, employeeId, and date', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([mockApiResponse[0]]);

      const records = await attendanceService.getByEmployeeAndDate(companyId, 'emp_001', '2026-09-30');

      expect(apiClient.get).toHaveBeenCalledWith('/attendance', {
        params: {
          companyId,
          employeeId: 'emp_001',
          date: '2026-09-30',
        },
      });
      expect(records).toHaveLength(1);
      expect(records[0]!.date).toBe('2026-09-30');
      expect(records[0]!.employeeId).toBe('emp_001');
    });
  });

  describe('3. Filter by month (YYYY-MM) and status', () => {
    // curl -X GET "http://localhost:5001/api/attendance?companyId=cmp_hrms_28_2886&month=2026-09&status=present"
    it('should call GET /attendance with companyId, month, and status', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([mockApiResponse[0]]);

      const records = await attendanceService.getByMonthAndStatus(companyId, '2026-09', 'present');

      expect(apiClient.get).toHaveBeenCalledWith('/attendance', {
        params: {
          companyId,
          month: '2026-09',
          status: 'present',
        },
      });
      expect(records).toHaveLength(1);
      expect(records[0]!.date).toBe('2026-09-30');
      expect(records[0]!.status).toBe('present');
    });
  });

  describe('4. Filter by date range (startDate & endDate)', () => {
    // curl -X GET "http://localhost:5001/api/attendance?companyId=cmp_hrms_28_2886&startDate=2026-09-01&endDate=2026-09-30"
    it('should call GET /attendance with companyId, startDate, and endDate', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([mockApiResponse[0]]);

      const records = await attendanceService.getByDateRange(companyId, '2026-09-01', '2026-09-30');

      expect(apiClient.get).toHaveBeenCalledWith('/attendance', {
        params: {
          companyId,
          startDate: '2026-09-01',
          endDate: '2026-09-30',
        },
      });
      expect(records).toHaveLength(1);
      expect(records[0]!.date).toBe('2026-09-30');
    });
  });

  describe('Validation and Fallback handling', () => {
    it('should throw an error if companyId is missing in getAttendance', async () => {
      await expect(
        attendanceService.getAttendance({ companyId: '' })
      ).rejects.toThrow('companyId is required');
    });

    it('should fallback to local store if API call throws an error', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      const records = await attendanceService.getAttendance({
        companyId: DEFAULT_COMPANY_ID,
        date: '2026-09-30',
      });

      expect(records.length).toBeGreaterThan(0);
      expect(records.every((r) => r.date === '2026-09-30')).toBe(true);
    });
  });

  describe('Attendance Summary & Stats', () => {
    it('should fetch attendance summary from /attendance/summary', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        totalRecords: 10,
        present: 8,
        absent: 1,
        late: 1,
        halfDay: 0,
        onLeave: 0,
        workModeBreakdown: { office: 6, remote: 4 },
        averageWorkMinutes: 480,
      });

      const stats = await attendanceService.getKPIStats(companyId);

      expect(apiClient.get).toHaveBeenCalledWith('/attendance/summary', {
        params: { companyId },
      });
      expect(stats.totalExpected).toBe(10);
      expect(stats.presentToday).toBe(9); // present + late + halfDay
      expect(stats.remoteWorkers).toBe(4);
      expect(stats.avgWorkHoursPerDay).toBe(8.0);
    });
  });
});
