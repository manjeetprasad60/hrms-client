export * from '../../types/leave';
export * from '../../services/leave/leave.types';

export type LeaveTabKey = 'approvals' | 'balances' | 'policies' | 'calendar' | 'history';

export interface LeaveFilterState {
  readonly search: string;
  readonly status: string;
  readonly department: string;
  readonly policyId: string;
  readonly month?: string;
  readonly startDate?: string;
  readonly endDate?: string;
}
