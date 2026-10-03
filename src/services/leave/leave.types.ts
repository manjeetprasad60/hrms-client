import type {
  LeavePolicy,
  LeaveRequest,
  EmployeeLeaveBalance,
  LeaveKPIStats,
  BalanceAdjustmentPayload,
  ApplyLeavePayload,
  LeaveFilterState,
} from '../../types/leave';

export type {
  LeavePolicy,
  LeaveRequest,
  EmployeeLeaveBalance,
  LeaveKPIStats,
  BalanceAdjustmentPayload,
  ApplyLeavePayload,
  LeaveFilterState,
};

export interface LeaveQueryParams {
  companyId?: string;
  employeeId?: string;
  department?: string;
  status?: string;
  policyId?: string;
  startDate?: string;
  endDate?: string;
  month?: string;
  search?: string;
}

export interface ReviewLeavePayload {
  companyId?: string;
  reviewerName?: string;
  note?: string;
}

export interface BatchReviewPayload {
  requestIds: readonly string[];
  reviewerName?: string;
  note?: string;
}
