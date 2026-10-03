export * from '../../types/attendance';
export * from '../../services/attendance/attendance.types';

export interface CheckInFilterState {
  readonly search: string;
  readonly status: string;
  readonly workMode: string;
  readonly department: string;
  readonly employeeId?: string;
  readonly date?: string;
  readonly month?: string;
  readonly startDate?: string;
  readonly endDate?: string;
}


export interface WorkLogFilterState {
  readonly search: string;
  readonly project: string;
  readonly category: string;
  readonly department: string;
  readonly isBillable: string;
}

export interface TimesheetFilterState {
  readonly search: string;
  readonly status: string;
  readonly department: string;
}
