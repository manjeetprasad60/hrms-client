/**
 * Leave & Time-Off Domain Types
 *
 * Scoped to organization-level leave management:
 * - Time-off policies & accrual rules
 * - Employee entitlement and balance tracking
 * - Approval workflows and request audits
 */

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type AccrualFrequency = 'annual_lump_sum' | 'monthly' | 'quarterly';

export type PolicyType = 'paid' | 'unpaid';

export type HalfDaySession = 'morning' | 'afternoon';

export interface LeavePolicy {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly code: string;
  readonly description: string;
  readonly color: string;
  readonly type: PolicyType;
  readonly annualAllowanceDays: number;
  readonly accrualFrequency: AccrualFrequency;
  readonly maxCarryForwardDays: number;
  readonly allowHalfDay: boolean;
  readonly requiresAttachment: boolean;
  readonly attachmentThresholdDays: number;
  readonly minNoticeDays: number;
  readonly autoApprove: boolean;
  readonly applicableDepartments: readonly string[]; // ['All'] or specific department names
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface LeaveRequest {
  readonly id: string;
  readonly companyId: string;
  readonly employeeId: string;
  readonly employeeName: string;
  readonly employeeEmail: string;
  readonly department: string;
  readonly designation: string;
  readonly avatarUrl?: string;
  readonly policyId: string;
  readonly leaveTypeName: string;
  readonly leaveTypeCode: string;
  readonly color: string;
  readonly startDate: string; // YYYY-MM-DD
  readonly endDate: string; // YYYY-MM-DD
  readonly durationDays: number;
  readonly isHalfDay: boolean;
  readonly halfDaySession?: HalfDaySession;
  readonly reason: string;
  readonly attachmentName?: string;
  readonly attachmentUrl?: string;
  readonly status: LeaveStatus;
  readonly appliedAt: string;
  readonly reviewedBy?: string;
  readonly reviewedAt?: string;
  readonly reviewNote?: string;
  readonly currentAvailableBalance: number;
  readonly balanceAfterApproval: number;
  readonly overlappingTeammatesCount?: number;
}

export interface PolicyBalanceBreakdown {
  readonly policyId: string;
  readonly policyName: string;
  readonly policyCode: string;
  readonly color: string;
  readonly totalEntitled: number;
  readonly taken: number;
  readonly pending: number;
  readonly available: number;
}

export interface EmployeeLeaveBalance {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly employeeEmail: string;
  readonly department: string;
  readonly designation: string;
  readonly avatarUrl?: string;
  readonly fiscalYear: string;
  readonly balances: readonly PolicyBalanceBreakdown[];
  readonly totalEntitled: number;
  readonly totalTaken: number;
  readonly totalPending: number;
  readonly totalAvailable: number;
}

export interface LeaveKPIStats {
  readonly pendingApprovalsCount: number;
  readonly onLeaveTodayCount: number;
  readonly onLeaveThisWeekCount: number;
  readonly totalEntitlementConsumedPercentage: number;
  readonly activePoliciesCount: number;
  readonly urgentPendingCount: number; // pending > 48h
}

export type BalanceAdjustmentReason =
  | 'bonus_credit'
  | 'loss_of_pay'
  | 'manual_correction'
  | 'carryover_adjustment'
  | 'probation_entitlement'
  | 'other';

export interface BalanceAdjustmentPayload {
  readonly employeeId: string;
  readonly policyId: string;
  readonly adjustmentDays: number; // Positive (credit) or Negative (debit)
  readonly reason: BalanceAdjustmentReason;
  readonly note: string;
}

export interface ApplyLeavePayload {
  readonly employeeId: string;
  readonly policyId: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly isHalfDay?: boolean;
  readonly halfDaySession?: HalfDaySession;
  readonly reason: string;
  readonly attachmentName?: string;
}

export interface LeaveFilterState {
  readonly search: string;
  readonly status: string;
  readonly department: string;
  readonly policyId: string;
  readonly month?: string;
  readonly startDate?: string;
  readonly endDate?: string;
}
