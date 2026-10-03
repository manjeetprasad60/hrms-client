import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { employeeService } from '../employee/employeeService';
import type {
  CheckInPunch,
  WorkLog,
  TimesheetRecord,
  AttendanceKPIStats,
  ClockInPayload,
  ClockOutPayload,
  ManualAdjustmentPayload,
  CreateWorkLogPayload,
  TimesheetStatus,
  AttendanceQueryParams,
  AttendanceRecordResponse,
  AttendanceSummaryResponse,
  AttendanceStatus,
  WorkMode,
} from './attendance.types';

export const DEFAULT_COMPANY_ID = 'cmp_hrms_28_2886';


const INITIAL_CHECK_INS: CheckInPunch[] = [
  {
    id: 'chk_001',
    employeeId: 'emp_001',
    employeeName: 'Rajesh Kumar',
    employeeEmail: 'rajesh@flextr.com',
    department: 'Engineering',
    designation: 'Senior Developer',
    date: '2026-09-30',
    clockIn: '08:58 AM',
    clockOut: null,
    workMode: 'office',
    location: 'Bangalore HQ - Floor 4',
    ipAddress: '192.168.1.104',
    deviceInfo: 'Biometric Terminal B4 (Face ID)',
    status: 'present',
    workDurationHours: 6.8,
    breakDurationMinutes: 45,
    overtimeHours: 0,
    verified: true,
    notes: 'Regular on-time arrival',
  },
  {
    id: 'chk_002',
    employeeId: 'emp_002',
    employeeName: 'Meera Singh',
    employeeEmail: 'meera@flextr.com',
    department: 'Design',
    designation: 'Lead Designer',
    date: '2026-09-30',
    clockIn: '09:42 AM',
    clockOut: null,
    workMode: 'remote',
    location: 'Remote - Bangalore North',
    ipAddress: '49.207.210.15',
    deviceInfo: 'Web Portal / Chrome 128 (macOS)',
    status: 'late',
    workDurationHours: 5.9,
    breakDurationMinutes: 30,
    overtimeHours: 0,
    verified: true,
    notes: 'Late check-in due to ISP maintenance',
  },
  {
    id: 'chk_003',
    employeeId: 'emp_003',
    employeeName: 'Amit Patel',
    employeeEmail: 'amit@flextr.com',
    department: 'Human Resources',
    designation: 'HR Manager',
    date: '2026-09-30',
    clockIn: '08:50 AM',
    clockOut: '05:30 PM',
    workMode: 'office',
    location: 'Bangalore HQ - Executive Wing',
    ipAddress: '192.168.1.22',
    deviceInfo: 'RFID Badge Scanner E1',
    status: 'present',
    workDurationHours: 8.2,
    breakDurationMinutes: 50,
    overtimeHours: 0.2,
    verified: true,
  },
  {
    id: 'chk_004',
    employeeId: 'emp_004',
    employeeName: 'Priya Sharma',
    employeeEmail: 'priya.s@flextr.com',
    department: 'Engineering',
    designation: 'Fullstack Architect',
    date: '2026-09-30',
    clockIn: '08:45 AM',
    clockOut: null,
    workMode: 'remote',
    location: 'Remote - Pune Hub',
    ipAddress: '14.139.121.5',
    deviceInfo: 'HRIS Mobile App / iOS 18.2',
    status: 'present',
    workDurationHours: 7.2,
    breakDurationMinutes: 40,
    overtimeHours: 0,
    verified: true,
    notes: 'Geofence GPS verified (30m accuracy)',
  },
  {
    id: 'chk_005',
    employeeId: 'emp_005',
    employeeName: 'Vikram Malhotra',
    employeeEmail: 'vikram.m@flextr.com',
    department: 'Sales & BD',
    designation: 'Account Executive',
    date: '2026-09-30',
    clockIn: '10:15 AM',
    clockOut: null,
    workMode: 'field',
    location: 'Client HQ - Mumbai BKC',
    ipAddress: '157.34.88.92',
    deviceInfo: 'HRIS Mobile App / Android 15',
    status: 'late',
    workDurationHours: 5.2,
    breakDurationMinutes: 20,
    overtimeHours: 0,
    verified: true,
    notes: 'Client on-site morning meeting',
  },
  {
    id: 'chk_006',
    employeeId: 'emp_006',
    employeeName: 'Sneha Reddy',
    employeeEmail: 'sneha.r@flextr.com',
    department: 'Marketing',
    designation: 'Growth Specialist',
    date: '2026-09-30',
    clockIn: '09:00 AM',
    clockOut: '01:30 PM',
    workMode: 'hybrid',
    location: 'Bangalore HQ - Floor 2',
    ipAddress: '192.168.1.18',
    deviceInfo: 'Biometric Terminal B2',
    status: 'half_day',
    workDurationHours: 4.5,
    breakDurationMinutes: 15,
    overtimeHours: 0,
    verified: true,
    notes: 'Approved medical half-day leave for afternoon',
  },
  {
    id: 'chk_007',
    employeeId: 'emp_007',
    employeeName: 'Karthik Subramanian',
    employeeEmail: 'karthik.s@flextr.com',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    date: '2026-09-30',
    clockIn: '07:30 AM',
    clockOut: '04:30 PM',
    workMode: 'office',
    location: 'Bangalore HQ - Server Wing',
    ipAddress: '192.168.1.8',
    deviceInfo: 'Keycard Access K1',
    status: 'present',
    workDurationHours: 8.5,
    breakDurationMinutes: 60,
    overtimeHours: 0.5,
    verified: true,
    notes: 'Morning server maintenance window',
  },
  {
    id: 'chk_008',
    employeeId: 'emp_008',
    employeeName: 'Ananya Deshmukh',
    employeeEmail: 'ananya.d@flextr.com',
    department: 'Finance',
    designation: 'Payroll Analyst',
    date: '2026-09-30',
    clockIn: '—',
    clockOut: null,
    workMode: 'office',
    location: 'Unreported',
    status: 'absent',
    workDurationHours: 0,
    breakDurationMinutes: 0,
    overtimeHours: 0,
    verified: false,
    notes: 'No punch recorded — Pending HR notification',
  },
];

const INITIAL_WORK_LOGS: WorkLog[] = [
  {
    id: 'wlog_001',
    employeeId: 'emp_001',
    employeeName: 'Rajesh Kumar',
    department: 'Engineering',
    date: '2026-09-30',
    project: 'HRIS Client Portal 2.0',
    taskTitle: 'Refactor Time & Attendance state pipeline',
    category: 'development',
    hours: 4.5,
    startTime: '09:30 AM',
    endTime: '02:00 PM',
    isBillable: true,
    description: 'Implemented modular domain types and reactive state updates for check-in filters.',
    status: 'verified',
  },
  {
    id: 'wlog_002',
    employeeId: 'emp_001',
    employeeName: 'Rajesh Kumar',
    department: 'Engineering',
    date: '2026-09-30',
    project: 'HRIS Client Portal 2.0',
    taskTitle: 'Code review for PR #142 (RBAC permissions)',
    category: 'review',
    hours: 2.0,
    startTime: '02:30 PM',
    endTime: '04:30 PM',
    isBillable: true,
    description: 'Conducted audit on permission checking hooks and security gateways.',
    status: 'verified',
  },
  {
    id: 'wlog_003',
    employeeId: 'emp_002',
    employeeName: 'Meera Singh',
    department: 'Design',
    date: '2026-09-30',
    project: 'Design System Unification',
    taskTitle: 'Timesheet matrix responsive wireframes',
    category: 'design',
    hours: 5.0,
    startTime: '10:00 AM',
    endTime: '03:00 PM',
    isBillable: true,
    description: 'Created Figma layouts for 7-day timesheet grid with status tags and overtime calculations.',
    status: 'verified',
  },
  {
    id: 'wlog_004',
    employeeId: 'emp_004',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    date: '2026-09-30',
    project: 'Core API Gateway',
    taskTitle: 'Firebase realtime sync & webhook retry logic',
    category: 'development',
    hours: 6.0,
    startTime: '09:00 AM',
    endTime: '03:00 PM',
    isBillable: true,
    description: 'Added exponential backoff to biometric webhook endpoint.',
    status: 'verified',
  },
  {
    id: 'wlog_005',
    employeeId: 'emp_005',
    employeeName: 'Vikram Malhotra',
    department: 'Sales & BD',
    date: '2026-09-30',
    project: 'Enterprise Expansion Q4',
    taskTitle: 'On-site Demo & Security Questionnaire Review',
    category: 'meeting',
    hours: 4.5,
    startTime: '10:30 AM',
    endTime: '03:00 PM',
    isBillable: false,
    description: 'Met with client VP of People Ops in Mumbai to review HRIS compliance standards.',
    status: 'logged',
  },
  {
    id: 'wlog_006',
    employeeId: 'emp_007',
    employeeName: 'Karthik Subramanian',
    department: 'Engineering',
    date: '2026-09-30',
    project: 'Infrastructure Modernization',
    taskTitle: 'Kubernetes cluster security patch rollout',
    category: 'support',
    hours: 7.5,
    startTime: '08:00 AM',
    endTime: '03:30 PM',
    isBillable: false,
    description: 'Upgraded worker node AMIs and configured zero-downtime certificate renewal.',
    status: 'verified',
  },
];

const INITIAL_TIMESHEETS: TimesheetRecord[] = [
  {
    id: 'ts_001',
    employeeId: 'emp_001',
    employeeName: 'Rajesh Kumar',
    department: 'Engineering',
    periodStart: '2026-09-21',
    periodEnd: '2026-09-27',
    periodLabel: 'Sep 21 – Sep 27, 2026',
    regularHours: 40.0,
    overtimeHours: 4.5,
    leaveHours: 0,
    totalHours: 44.5,
    daysPresent: 5,
    status: 'submitted',
    submittedAt: '2026-09-28 09:15 AM',
    dailyBreakdown: [
      { day: 'Mon', date: '2026-09-21', regularHours: 8.0, overtimeHours: 1.0, status: 'present', tasksSummary: 'Attendance module sprint kickoff' },
      { day: 'Tue', date: '2026-09-22', regularHours: 8.0, overtimeHours: 0.5, status: 'present', tasksSummary: 'API client integration' },
      { day: 'Wed', date: '2026-09-23', regularHours: 8.0, overtimeHours: 1.5, status: 'present', tasksSummary: 'State management and bug fixes' },
      { day: 'Thu', date: '2026-09-24', regularHours: 8.0, overtimeHours: 0.5, status: 'present', tasksSummary: 'Biometric sync validation' },
      { day: 'Fri', date: '2026-09-25', regularHours: 8.0, overtimeHours: 1.0, status: 'present', tasksSummary: 'Sprint demo & documentation' },
      { day: 'Sat', date: '2026-09-26', regularHours: 0, overtimeHours: 0, status: 'weekend' },
      { day: 'Sun', date: '2026-09-27', regularHours: 0, overtimeHours: 0, status: 'weekend' },
    ],
  },
  {
    id: 'ts_002',
    employeeId: 'emp_002',
    employeeName: 'Meera Singh',
    department: 'Design',
    periodStart: '2026-09-21',
    periodEnd: '2026-09-27',
    periodLabel: 'Sep 21 – Sep 27, 2026',
    regularHours: 32.0,
    overtimeHours: 0,
    leaveHours: 8.0,
    totalHours: 40.0,
    daysPresent: 4,
    status: 'approved',
    submittedAt: '2026-09-28 10:00 AM',
    reviewedBy: 'Amit Patel (HR)',
    reviewedAt: '2026-09-28 04:30 PM',
    reviewNotes: '1 day sick leave verified against medical receipt.',
    dailyBreakdown: [
      { day: 'Mon', date: '2026-09-21', regularHours: 8.0, overtimeHours: 0, status: 'present', tasksSummary: 'Design token audit' },
      { day: 'Tue', date: '2026-09-22', regularHours: 8.0, overtimeHours: 0, status: 'present', tasksSummary: 'Table component polish' },
      { day: 'Wed', date: '2026-09-23', regularHours: 0, overtimeHours: 0, status: 'leave', tasksSummary: 'Paid Sick Leave' },
      { day: 'Thu', date: '2026-09-24', regularHours: 8.0, overtimeHours: 0, status: 'present', tasksSummary: 'Design review with engineering' },
      { day: 'Fri', date: '2026-09-25', regularHours: 8.0, overtimeHours: 0, status: 'present', tasksSummary: 'Mobile responsive mocks' },
      { day: 'Sat', date: '2026-09-26', regularHours: 0, overtimeHours: 0, status: 'weekend' },
      { day: 'Sun', date: '2026-09-27', regularHours: 0, overtimeHours: 0, status: 'weekend' },
    ],
  },
  {
    id: 'ts_003',
    employeeId: 'emp_003',
    employeeName: 'Amit Patel',
    department: 'Human Resources',
    periodStart: '2026-09-21',
    periodEnd: '2026-09-27',
    periodLabel: 'Sep 21 – Sep 27, 2026',
    regularHours: 40.0,
    overtimeHours: 1.5,
    leaveHours: 0,
    totalHours: 41.5,
    daysPresent: 5,
    status: 'approved',
    submittedAt: '2026-09-27 06:00 PM',
    reviewedBy: 'System Auto-Audit',
    reviewedAt: '2026-09-28 08:00 AM',
    reviewNotes: 'Standard 40h workweek compliant.',
    dailyBreakdown: [
      { day: 'Mon', date: '2026-09-21', regularHours: 8.0, overtimeHours: 0, status: 'present', tasksSummary: 'HR Onboarding sessions' },
      { day: 'Tue', date: '2026-09-22', regularHours: 8.0, overtimeHours: 0.5, status: 'present', tasksSummary: 'Benefits enrollment check' },
      { day: 'Wed', date: '2026-09-23', regularHours: 8.0, overtimeHours: 0, status: 'present', tasksSummary: 'Candidate interviews' },
      { day: 'Thu', date: '2026-09-24', regularHours: 8.0, overtimeHours: 1.0, status: 'present', tasksSummary: 'Compliance reporting' },
      { day: 'Fri', date: '2026-09-25', regularHours: 8.0, overtimeHours: 0, status: 'present', tasksSummary: 'Payroll preparation' },
      { day: 'Sat', date: '2026-09-26', regularHours: 0, overtimeHours: 0, status: 'weekend' },
      { day: 'Sun', date: '2026-09-27', regularHours: 0, overtimeHours: 0, status: 'weekend' },
    ],
  },
  {
    id: 'ts_004',
    employeeId: 'emp_004',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    periodStart: '2026-09-21',
    periodEnd: '2026-09-27',
    periodLabel: 'Sep 21 – Sep 27, 2026',
    regularHours: 40.0,
    overtimeHours: 6.0,
    leaveHours: 0,
    totalHours: 46.0,
    daysPresent: 5,
    status: 'submitted',
    submittedAt: '2026-09-28 11:30 AM',
    dailyBreakdown: [
      { day: 'Mon', date: '2026-09-21', regularHours: 8.0, overtimeHours: 1.5, status: 'present', tasksSummary: 'Database schema migration' },
      { day: 'Tue', date: '2026-09-22', regularHours: 8.0, overtimeHours: 1.0, status: 'present', tasksSummary: 'API client endpoints' },
      { day: 'Wed', date: '2026-09-23', regularHours: 8.0, overtimeHours: 2.0, status: 'present', tasksSummary: 'Production release deployment' },
      { day: 'Thu', date: '2026-09-24', regularHours: 8.0, overtimeHours: 0.5, status: 'present', tasksSummary: 'Telemetry monitoring' },
      { day: 'Fri', date: '2026-09-25', regularHours: 8.0, overtimeHours: 1.0, status: 'present', tasksSummary: 'Incident postmortem documentation' },
      { day: 'Sat', date: '2026-09-26', regularHours: 0, overtimeHours: 0, status: 'weekend' },
      { day: 'Sun', date: '2026-09-27', regularHours: 0, overtimeHours: 0, status: 'weekend' },
    ],
  },
  {
    id: 'ts_005',
    employeeId: 'emp_005',
    employeeName: 'Vikram Malhotra',
    department: 'Sales & BD',
    periodStart: '2026-09-21',
    periodEnd: '2026-09-27',
    periodLabel: 'Sep 21 – Sep 27, 2026',
    regularHours: 36.0,
    overtimeHours: 2.0,
    leaveHours: 4.0,
    totalHours: 42.0,
    daysPresent: 5,
    status: 'submitted',
    submittedAt: '2026-09-28 02:45 PM',
    dailyBreakdown: [
      { day: 'Mon', date: '2026-09-21', regularHours: 8.0, overtimeHours: 0, status: 'present', tasksSummary: 'Enterprise outbound pitch' },
      { day: 'Tue', date: '2026-09-22', regularHours: 8.0, overtimeHours: 1.0, status: 'present', tasksSummary: 'Client visits - Gurgaon' },
      { day: 'Wed', date: '2026-09-23', regularHours: 4.0, overtimeHours: 0, status: 'half_day' as unknown as 'present', tasksSummary: 'Half-day field travel' },
      { day: 'Thu', date: '2026-09-24', regularHours: 8.0, overtimeHours: 1.0, status: 'present', tasksSummary: 'Proposal drafting' },
      { day: 'Fri', date: '2026-09-25', regularHours: 8.0, overtimeHours: 0, status: 'present', tasksSummary: 'Weekly sales pipeline sync' },
      { day: 'Sat', date: '2026-09-26', regularHours: 0, overtimeHours: 0, status: 'weekend' },
      { day: 'Sun', date: '2026-09-27', regularHours: 0, overtimeHours: 0, status: 'weekend' },
    ],
  },
  {
    id: 'ts_006',
    employeeId: 'emp_007',
    employeeName: 'Karthik Subramanian',
    department: 'Engineering',
    periodStart: '2026-09-21',
    periodEnd: '2026-09-27',
    periodLabel: 'Sep 21 – Sep 27, 2026',
    regularHours: 40.0,
    overtimeHours: 5.5,
    leaveHours: 0,
    totalHours: 45.5,
    daysPresent: 5,
    status: 'draft',
    dailyBreakdown: [
      { day: 'Mon', date: '2026-09-21', regularHours: 8.0, overtimeHours: 1.0, status: 'present', tasksSummary: 'CI/CD pipeline optimization' },
      { day: 'Tue', date: '2026-09-22', regularHours: 8.0, overtimeHours: 1.5, status: 'present', tasksSummary: 'Cloud cost breakdown analysis' },
      { day: 'Wed', date: '2026-09-23', regularHours: 8.0, overtimeHours: 1.0, status: 'present', tasksSummary: 'Disaster recovery drill' },
      { day: 'Thu', date: '2026-09-24', regularHours: 8.0, overtimeHours: 1.0, status: 'present', tasksSummary: 'Log aggregation tuning' },
      { day: 'Fri', date: '2026-09-25', regularHours: 8.0, overtimeHours: 1.0, status: 'present', tasksSummary: 'Infrastructure documentation' },
      { day: 'Sat', date: '2026-09-26', regularHours: 0, overtimeHours: 0, status: 'weekend' },
      { day: 'Sun', date: '2026-09-27', regularHours: 0, overtimeHours: 0, status: 'weekend' },
    ],
  },
];

const KNOWN_EMPLOYEES: Record<string, { employeeName: string; employeeEmail: string; department: string; designation?: string }> = {
  emp_001: { employeeName: 'Rajesh Kumar', employeeEmail: 'rajesh@flextr.com', department: 'Engineering', designation: 'Senior Developer' },
  emp_002: { employeeName: 'Meera Singh', employeeEmail: 'meera@flextr.com', department: 'Design', designation: 'Lead Designer' },
  emp_003: { employeeName: 'Amit Patel', employeeEmail: 'amit@flextr.com', department: 'Human Resources', designation: 'HR Manager' },
  emp_004: { employeeName: 'Priya Sharma', employeeEmail: 'priya.s@flextr.com', department: 'Engineering', designation: 'Fullstack Architect' },
  emp_005: { employeeName: 'Vikram Malhotra', employeeEmail: 'vikram.m@flextr.com', department: 'Sales & BD', designation: 'Account Executive' },
  emp_006: { employeeName: 'Sneha Reddy', employeeEmail: 'sneha.r@flextr.com', department: 'Marketing', designation: 'Growth Specialist' },
  emp_007: { employeeName: 'Karthik Subramanian', employeeEmail: 'karthik.s@flextr.com', department: 'Engineering', designation: 'DevOps Engineer' },
  emp_008: { employeeName: 'Ananya Deshmukh', employeeEmail: 'ananya.d@flextr.com', department: 'Finance', designation: 'Payroll Analyst' },
};

class AttendanceServiceImpl {
  private checkIns: CheckInPunch[] = [...INITIAL_CHECK_INS];
  private workLogs: WorkLog[] = [...INITIAL_WORK_LOGS];
  private timesheets: TimesheetRecord[] = [...INITIAL_TIMESHEETS];

  private mapRecordToPunch(r: AttendanceRecordResponse): CheckInPunch {
    const known = KNOWN_EMPLOYEES[r.employeeId];
    const durationHours =
      r.duration?.totalWorkHoursDecimal !== undefined
        ? r.duration.totalWorkHoursDecimal
        : r.workDurationHours !== undefined
        ? r.workDurationHours
        : 0;

    return {
      id: r.id,
      employeeId: r.employeeId,
      employeeName: r.employeeName || known?.employeeName || `Employee (${r.employeeId})`,
      employeeEmail: r.employeeEmail || known?.employeeEmail || `${r.employeeId}@flextr.com`,
      department: r.department || known?.department || 'Engineering',
      designation: r.designation || known?.designation || '',
      avatarUrl: r.avatarUrl,
      date: r.date,
      clockIn: r.clockIn || '—',
      clockOut: r.clockOut ?? null,
      workMode: (r.workMode as WorkMode) || 'office',
      location: r.location || 'Bangalore HQ',
      ipAddress: r.ipAddress,
      deviceInfo: r.deviceInfo,
      status: (r.status as AttendanceStatus) || 'present',
      workDurationHours: Number(durationHours.toFixed(1)),
      breakDurationMinutes: r.breakDurationMinutes ?? 0,
      overtimeHours: r.overtimeHours ?? 0,
      verified: r.verified !== undefined ? Boolean(r.verified) : true,
      notes: r.notes,
    };
  }

  private filterLocalCheckIns(params: AttendanceQueryParams): CheckInPunch[] {
    return this.checkIns.filter((rec) => {
      if (params.employeeId && rec.employeeId !== params.employeeId) return false;
      if (params.date && rec.date !== params.date) return false;
      if (params.status && rec.status.toLowerCase() !== params.status.toLowerCase()) return false;
      if (params.workMode && rec.workMode.toLowerCase() !== params.workMode.toLowerCase()) return false;
      if (params.startDate && rec.date < params.startDate) return false;
      if (params.endDate && rec.date > params.endDate) return false;
      if (params.month) {
        if (params.month.includes('-')) {
          if (!rec.date.startsWith(params.month)) return false;
        } else {
          const formattedMonth = String(params.month).padStart(2, '0');
          const recMonth = rec.date.split('-')[1];
          if (recMonth !== formattedMonth) return false;
        }
      }
      return true;
    });
  }

  /**
   * Universal flexible GET API for attendance
   * Supports: companyId, employeeId, date, month, status, startDate, endDate, workMode
   */
  public async getAttendance(params: AttendanceQueryParams): Promise<CheckInPunch[]> {
    if (!params.companyId) {
      throw new Error('companyId is required');
    }

    const queryParams: Record<string, string | number | boolean | undefined> = {
      companyId: params.companyId,
    };
    if (params.employeeId) queryParams.employeeId = params.employeeId;
    if (params.date) queryParams.date = params.date;
    if (params.month) queryParams.month = params.month;
    if (params.year) queryParams.year = params.year;
    if (params.status) queryParams.status = params.status;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.workMode) queryParams.workMode = params.workMode;

    try {
      const res = await apiClient.get<AttendanceRecordResponse[] | Record<string, AttendanceRecordResponse>>(
        API_ENDPOINTS.attendance.base,
        { params: queryParams }
      );

      let list: AttendanceRecordResponse[] = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res && typeof res === 'object') {
        list = Object.values(res);
      }

      if (list.length > 0) {
        return list.map((record) => this.mapRecordToPunch(record));
      }
      return [];
    } catch (error) {
      console.warn('[attendanceService.getAttendance] API request failed; falling back to local store', error);
      return this.filterLocalCheckIns(params);
    }
  }

  /**
   * 1. Get all attendance for a company
   * curl -X GET "http://localhost:5001/api/attendance?companyId=cmp_hrms_28_2886"
   */
  public async getAllForCompany(companyId: string): Promise<CheckInPunch[]> {
    return this.getAttendance({ companyId });
  }

  /**
   * 2. Filter by employee and specific date
   * curl -X GET "http://localhost:5001/api/attendance?companyId=cmp_hrms_28_2886&employeeId=emp_001&date=2026-09-30"
   */
  public async getByEmployeeAndDate(
    companyId: string,
    employeeId: string,
    date: string
  ): Promise<CheckInPunch[]> {
    return this.getAttendance({ companyId, employeeId, date });
  }

  /**
   * 3. Filter by month (YYYY-MM) and status
   * curl -X GET "http://localhost:5001/api/attendance?companyId=cmp_hrms_28_2886&month=2026-09&status=present"
   */
  public async getByMonthAndStatus(
    companyId: string,
    month: string,
    status?: AttendanceStatus | string
  ): Promise<CheckInPunch[]> {
    return this.getAttendance({ companyId, month, status });
  }

  /**
   * 4. Filter by date range (startDate & endDate)
   * curl -X GET "http://localhost:5001/api/attendance?companyId=cmp_hrms_28_2886&startDate=2026-09-01&endDate=2026-09-30"
   */
  public async getByDateRange(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<CheckInPunch[]> {
    return this.getAttendance({ companyId, startDate, endDate });
  }

  /**
   * 5. Extract unique employee list from attendance records (GET /api/attendance)
   * curl -X GET "http://localhost:5001/api/attendance?companyId=cmp_hrms_28_2886"
   */
  public async getEmployeesFromAttendance(
    companyId: string = DEFAULT_COMPANY_ID
  ): Promise<Array<{ id: string; name: string; department: string; designation?: string }>> {
    const records = await this.getAttendance({ companyId });
    const empMap = new Map<string, { id: string; name: string; department: string; designation?: string }>();

    for (const record of records) {
      if (record.employeeId && !empMap.has(record.employeeId)) {
        empMap.set(record.employeeId, {
          id: record.employeeId,
          name: record.employeeName || record.employeeId,
          department: record.department || 'General',
          designation: record.designation,
        });
      }
    }

    if (empMap.size === 0) {
      try {
        const directoryEmployees = await employeeService.getEmployees(companyId);
        for (const emp of directoryEmployees) {
          const empId = emp.id || emp.employeeId;
          if (empId && !empMap.has(empId)) {
            const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || empId;
            empMap.set(empId, {
              id: empId,
              name,
              department: emp.department || 'General',
              designation: emp.designation,
            });
          }
        }
      } catch {
        // Fallback non-blocking
      }
    }

    return Array.from(empMap.values());
  }

  /**
   * Get attendance by ID
   * GET /api/attendance/:id
   */
  public async getAttendanceById(id: string): Promise<CheckInPunch | null> {
    try {
      const res = await apiClient.get<AttendanceRecordResponse>(API_ENDPOINTS.attendance.byId(id));
      if (res && res.id) {
        return this.mapRecordToPunch(res);
      }
    } catch {
      // Fallback
    }
    const local = this.checkIns.find((c) => c.id === id);
    return local || null;
  }

  /**
   * Backwards-compatible check-ins accessor.
   * Can be called with no args, companyId, or AttendanceQueryParams.
   */
  public async getCheckIns(
    paramsOrCompanyId?: string | AttendanceQueryParams,
    maybeFilters?: Partial<AttendanceQueryParams>
  ): Promise<CheckInPunch[]> {
    let params: AttendanceQueryParams;
    if (typeof paramsOrCompanyId === 'string') {
      params = { companyId: paramsOrCompanyId, ...maybeFilters };
    } else if (paramsOrCompanyId && typeof paramsOrCompanyId === 'object') {
      params = paramsOrCompanyId;
    } else {
      params = { companyId: DEFAULT_COMPANY_ID };
    }

    try {
      const records = await this.getAttendance(params);
      if (records.length > 0) {
        return records;
      }
    } catch {
      // Fallback below
    }

    return this.filterLocalCheckIns(params);
  }

  public async getWorkLogs(): Promise<WorkLog[]> {
    return [...this.workLogs];
  }

  public async getTimesheets(): Promise<TimesheetRecord[]> {
    return [...this.timesheets];
  }

  public async getKPIStats(companyId: string = DEFAULT_COMPANY_ID): Promise<AttendanceKPIStats> {
    try {
      const summary = await apiClient.get<AttendanceSummaryResponse>(API_ENDPOINTS.attendance.summary, {
        params: { companyId },
      });

      if (summary && typeof summary === 'object' && summary.totalRecords !== undefined) {
        const totalPresent = (summary.present || 0) + (summary.late || 0) + (summary.halfDay || 0);
        const totalExpected = summary.totalRecords || totalPresent || this.checkIns.length;
        const onTimePercentage = totalExpected > 0 ? Math.round(((summary.present || 0) / totalExpected) * 100) : 100;
        const remoteWorkers = summary.workModeBreakdown?.remote || 0;
        const pendingTimesheets = this.timesheets.filter((t) => t.status === 'submitted').length;
        const overtimeHoursWeek = this.timesheets.reduce((acc, curr) => acc + curr.overtimeHours, 0);
        const avgWorkHoursPerDay =
          summary.averageWorkMinutes ? Number((summary.averageWorkMinutes / 60).toFixed(1)) : 8.0;

        return {
          presentToday: totalPresent,
          totalExpected,
          onTimePercentage,
          lateArrivals: summary.late || 0,
          remoteWorkers,
          pendingTimesheets,
          overtimeHoursWeek,
          avgWorkHoursPerDay,
        };
      }
    } catch {
      // Fallback below
    }

    const presentCount = this.checkIns.filter((c) => c.status === 'present').length;
    const lateCount = this.checkIns.filter((c) => c.status === 'late').length;
    const totalPresent = presentCount + lateCount;
    const totalExpected = this.checkIns.length;
    const onTimePercentage = totalExpected > 0 ? Math.round((presentCount / totalExpected) * 100) : 100;
    const remoteWorkers = this.checkIns.filter((c) => c.workMode === 'remote').length;
    const pendingTimesheets = this.timesheets.filter((t) => t.status === 'submitted').length;
    const overtimeHoursWeek = this.timesheets.reduce((acc, curr) => acc + curr.overtimeHours, 0);

    const totalHoursWorked = this.checkIns.reduce((acc, c) => acc + c.workDurationHours, 0);
    const avgWorkHoursPerDay = totalPresent > 0 ? Number((totalHoursWorked / totalPresent).toFixed(1)) : 8.0;

    return {
      presentToday: totalPresent,
      totalExpected,
      onTimePercentage,
      lateArrivals: lateCount,
      remoteWorkers,
      pendingTimesheets,
      overtimeHoursWeek,
      avgWorkHoursPerDay,
    };
  }

  public async clockIn(payload: ClockInPayload): Promise<CheckInPunch> {
    const companyId = payload.companyId || DEFAULT_COMPANY_ID;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
    const dateStr = now.toISOString().slice(0, 10);

    let createdRecord: CheckInPunch | null = null;
    try {
      const res = await apiClient.post<AttendanceRecordResponse>(API_ENDPOINTS.attendance.base, {
        ...payload,
        companyId,
        date: dateStr,
        clockIn: timeStr,
        status: isLate ? 'late' : 'present',
      });
      if (res && res.id) {
        createdRecord = this.mapRecordToPunch(res);
      }
    } catch (err) {
      console.warn('[attendanceService.clockIn] API clock in failed; fallback to local punch:', err);
    }

    const newPunch: CheckInPunch = createdRecord || {
      id: `chk_${Date.now()}`,
      employeeId: payload.employeeId,
      employeeName: payload.employeeName,
      employeeEmail: `${payload.employeeName.toLowerCase().replace(/\s+/g, '.')}@flextr.com`,
      department: payload.department,
      date: dateStr,
      clockIn: timeStr,
      clockOut: null,
      workMode: payload.workMode,
      location: payload.location,
      ipAddress: '127.0.0.1 (Web Portal)',
      deviceInfo: 'Web Client Portal / Chrome',
      status: isLate ? 'late' : 'present',
      workDurationHours: 0.1,
      breakDurationMinutes: 0,
      overtimeHours: 0,
      verified: true,
      notes: payload.notes || 'Self-service Web Punch',
    };

    const existingIndex = this.checkIns.findIndex((c) => c.employeeId === payload.employeeId);
    if (existingIndex >= 0) {
      this.checkIns[existingIndex] = newPunch;
    } else {
      this.checkIns.unshift(newPunch);
    }

    return newPunch;
  }

  public async clockOut(
    punchId: string,
    options?: ClockOutPayload
  ): Promise<CheckInPunch> {
    const companyId = options?.companyId || DEFAULT_COMPANY_ID;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    try {
      await apiClient.post(API_ENDPOINTS.attendance.clockOut, {
        id: punchId,
        companyId,
        employeeId: options?.employeeId,
        clockOut: timeStr,
        breakDurationMinutes: options?.breakDurationMinutes,
        notes: options?.notes,
      });
    } catch (err) {
      console.warn('[attendanceService.clockOut] API clock out failed; updating local record:', err);
    }

    const index = this.checkIns.findIndex((c) => c.id === punchId);
    if (index !== -1) {
      const punch = this.checkIns[index];
      if (punch) {
        const updated: CheckInPunch = {
          ...punch,
          clockOut: timeStr,
          workDurationHours: Math.max(punch.workDurationHours, 8.0),
        };
        this.checkIns[index] = updated;
        return updated;
      }
    }

    return {
      id: punchId,
      employeeId: options?.employeeId || '',
      employeeName: '',
      employeeEmail: '',
      department: '',
      date: now.toISOString().slice(0, 10),
      clockIn: '09:00 AM',
      clockOut: timeStr,
      workMode: 'office',
      location: 'Office',
      status: 'present',
      workDurationHours: 8.0,
      breakDurationMinutes: 0,
      overtimeHours: 0,
      verified: true,
    };
  }


  public async addManualAdjustment(payload: ManualAdjustmentPayload & { companyId?: string }): Promise<CheckInPunch> {
    const companyId = payload.companyId || DEFAULT_COMPANY_ID;
    let createdRecord: CheckInPunch | null = null;
    try {
      const res = await apiClient.post<AttendanceRecordResponse>(API_ENDPOINTS.attendance.base, {
        companyId,
        employeeId: payload.employeeId,
        date: payload.date,
        clockIn: payload.clockIn,
        clockOut: payload.clockOut,
        workMode: payload.workMode,
        status: payload.status,
        notes: `Reason: ${payload.reason}`,
        location: 'Manual Adjustment (HR Approved)',
        deviceInfo: 'Client Admin Portal (Manual Entry)',
        breakDurationMinutes: 45,
      });
      if (res && res.id) {
        createdRecord = this.mapRecordToPunch(res);
      }
    } catch (err) {
      console.warn('[attendanceService.addManualAdjustment] API sync notice; saved locally:', err);
    }

    const newPunch: CheckInPunch = createdRecord || {
      id: `chk_adj_${Date.now()}`,
      employeeId: payload.employeeId,
      employeeName: payload.employeeName,
      employeeEmail: `${payload.employeeName.toLowerCase().replace(/\s+/g, '.')}@flextr.com`,
      department: payload.department,
      date: payload.date,
      clockIn: payload.clockIn,
      clockOut: payload.clockOut,
      workMode: payload.workMode,
      location: 'Manual Adjustment (HR Approved)',
      deviceInfo: 'Client Admin Portal (Manual Entry)',
      status: payload.status,
      workDurationHours: 8.0,
      breakDurationMinutes: 45,
      overtimeHours: 0,
      verified: true,
      notes: `Reason: ${payload.reason}`,
    };

    this.checkIns.unshift(newPunch);
    return newPunch;
  }

  public async addWorkLog(payload: CreateWorkLogPayload): Promise<WorkLog> {
    const newLog: WorkLog = {
      id: `wlog_${Date.now()}`,
      employeeId: payload.employeeId,
      employeeName: payload.employeeName,
      department: payload.department,
      date: payload.date,
      project: payload.project,
      taskTitle: payload.taskTitle,
      category: payload.category,
      hours: payload.hours,
      startTime: payload.startTime,
      endTime: payload.endTime,
      isBillable: payload.isBillable,
      description: payload.description,
      status: 'logged',
    };

    this.workLogs.unshift(newLog);
    return newLog;
  }

  public async updateTimesheetStatus(
    timesheetId: string,
    status: TimesheetStatus,
    reviewNotes?: string
  ): Promise<TimesheetRecord> {
    const index = this.timesheets.findIndex((t) => t.id === timesheetId);
    if (index === -1) throw new Error('Timesheet not found');

    const ts = this.timesheets[index];
    if (!ts) throw new Error('Timesheet not found');

    const updated: TimesheetRecord = {
      ...ts,
      status,
      reviewedBy: 'Client Admin',
      reviewedAt: new Date().toLocaleString(),
      reviewNotes: reviewNotes || (status === 'approved' ? 'Approved by Admin' : 'Rejected - Check work breakdown'),
    };

    this.timesheets[index] = updated;
    return updated;
  }

  public async bulkApproveTimesheets(timesheetIds: string[]): Promise<number> {
    let count = 0;
    this.timesheets = this.timesheets.map((ts) => {
      if (timesheetIds.includes(ts.id) && ts.status === 'submitted') {
        count++;
        return {
          ...ts,
          status: 'approved',
          reviewedBy: 'Client Admin (Bulk)',
          reviewedAt: new Date().toLocaleString(),
          reviewNotes: 'Bulk Approved',
        };
      }
      return ts;
    });
    return count;
  }
}

export const attendanceService = new AttendanceServiceImpl();
