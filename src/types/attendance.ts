/**
 * Time & Attendance Domain Types
 */

export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';
export type WorkMode = 'office' | 'remote' | 'field' | 'hybrid';
export type WorkLogCategory = 'development' | 'meeting' | 'design' | 'support' | 'admin' | 'review' | 'research';
export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface CheckInPunch {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeName: string;
  readonly employeeEmail: string;
  readonly department: string;
  readonly designation?: string;
  readonly avatarUrl?: string;
  readonly date: string; // YYYY-MM-DD
  readonly clockIn: string; // e.g. "09:05 AM"
  readonly clockOut: string | null; // e.g. "06:12 PM"
  readonly workMode: WorkMode;
  readonly location: string;
  readonly ipAddress?: string;
  readonly deviceInfo?: string;
  readonly status: AttendanceStatus;
  readonly workDurationHours: number;
  readonly breakDurationMinutes: number;
  readonly overtimeHours: number;
  readonly notes?: string;
  readonly verified: boolean;
}

export interface WorkLog {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeName: string;
  readonly department: string;
  readonly date: string;
  readonly project: string;
  readonly taskTitle: string;
  readonly category: WorkLogCategory;
  readonly hours: number;
  readonly startTime: string;
  readonly endTime: string;
  readonly isBillable: boolean;
  readonly description: string;
  readonly status: 'logged' | 'verified' | 'flagged';
}

export interface TimesheetDayBreakdown {
  readonly day: string; // Mon, Tue, etc.
  readonly date: string; // YYYY-MM-DD
  readonly regularHours: number;
  readonly overtimeHours: number;
  readonly status: 'present' | 'absent' | 'weekend' | 'holiday' | 'leave';
  readonly tasksSummary?: string;
}

export interface TimesheetRecord {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeName: string;
  readonly department: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly periodLabel: string;
  readonly regularHours: number;
  readonly overtimeHours: number;
  readonly leaveHours: number;
  readonly totalHours: number;
  readonly daysPresent: number;
  readonly status: TimesheetStatus;
  readonly submittedAt?: string;
  readonly reviewedBy?: string;
  readonly reviewedAt?: string;
  readonly reviewNotes?: string;
  readonly dailyBreakdown: readonly TimesheetDayBreakdown[];
}

export interface AttendanceKPIStats {
  readonly presentToday: number;
  readonly totalExpected: number;
  readonly onTimePercentage: number;
  readonly lateArrivals: number;
  readonly remoteWorkers: number;
  readonly pendingTimesheets: number;
  readonly overtimeHoursWeek: number;
  readonly avgWorkHoursPerDay: number;
}
