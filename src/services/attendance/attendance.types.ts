export * from '../../types/attendance';

export interface AttendanceQueryParams {
  readonly companyId: string;
  readonly employeeId?: string;
  readonly date?: string; // YYYY-MM-DD
  readonly month?: string; // YYYY-MM or MM
  readonly year?: string; // YYYY
  readonly status?: string; // present, late, half_day, absent, on_leave
  readonly startDate?: string; // YYYY-MM-DD
  readonly endDate?: string; // YYYY-MM-DD
  readonly workMode?: string; // office, remote, field, hybrid
}

export interface AttendanceRecordResponse {
  readonly id: string;
  readonly companyId: string;
  readonly employeeId: string;
  readonly employeeName?: string;
  readonly employeeEmail?: string;
  readonly department?: string;
  readonly designation?: string;
  readonly avatarUrl?: string;
  readonly date: string;
  readonly clockIn: string;
  readonly clockOut?: string | null;
  readonly workMode?: string;
  readonly location?: string;
  readonly ipAddress?: string;
  readonly deviceInfo?: string;
  readonly status?: string;
  readonly workDurationHours?: number;
  readonly breakDurationMinutes?: number;
  readonly overtimeHours?: number;
  readonly notes?: string;
  readonly verified?: boolean;
  readonly verificationMethod?: string;
  readonly duration?: {
    readonly formattedWorkHours?: string;
    readonly netWorkMinutes?: number;
    readonly totalWorkHoursDecimal?: number;
  };
  readonly coordinates?: {
    readonly latitude?: number;
    readonly longitude?: number;
    readonly accuracy?: number;
  };
  readonly createdAt?: number;
  readonly updatedAt?: number;
}

export interface AttendanceSummaryResponse {
  readonly totalRecords: number;
  readonly present: number;
  readonly absent: number;
  readonly late: number;
  readonly halfDay: number;
  readonly onLeave: number;
  readonly workModeBreakdown?: {
    readonly office?: number;
    readonly remote?: number;
    readonly hybrid?: number;
    readonly field?: number;
  };
  readonly totalWorkMinutes?: number;
  readonly averageWorkMinutes?: number;
  readonly averageWorkHoursFormatted?: string;
}

export interface ClockInPayload {
  readonly companyId?: string;
  readonly employeeId: string;
  readonly employeeName: string;
  readonly department: string;
  readonly workMode: 'office' | 'remote' | 'field' | 'hybrid';
  readonly location: string;
  readonly notes?: string;
}

export interface ClockOutPayload {
  readonly id?: string;
  readonly companyId?: string;
  readonly employeeId?: string;
  readonly breakDurationMinutes?: number;
  readonly notes?: string;
}

export interface ManualAdjustmentPayload {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly department: string;
  readonly date: string;
  readonly clockIn: string;
  readonly clockOut: string;
  readonly workMode: 'office' | 'remote' | 'field' | 'hybrid';
  readonly reason: string;
  readonly status: 'present' | 'late' | 'half_day';
}

export interface CreateWorkLogPayload {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly department: string;
  readonly date: string;
  readonly project: string;
  readonly taskTitle: string;
  readonly category: 'development' | 'meeting' | 'design' | 'support' | 'admin' | 'review' | 'research';
  readonly hours: number;
  readonly startTime: string;
  readonly endTime: string;
  readonly isBillable: boolean;
  readonly description: string;
}

