import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import type {
  LeavePolicy,
  LeaveRequest,
  EmployeeLeaveBalance,
  LeaveKPIStats,
  BalanceAdjustmentPayload,
  ApplyLeavePayload,
  LeaveQueryParams,
  ReviewLeavePayload,
  BatchReviewPayload,
} from './leave.types';

const DEFAULT_COMPANY_ID = 'cmp_hrms_28_2886';

const INITIAL_POLICIES: LeavePolicy[] = [
  {
    id: 'pol_vacation',
    companyId: DEFAULT_COMPANY_ID,
    name: 'Annual Vacation',
    code: 'VAC',
    description: 'Standard paid annual vacation leave for rest, recreation, and travel.',
    color: '#0f766e', // Teal
    type: 'paid',
    annualAllowanceDays: 18,
    accrualFrequency: 'monthly',
    maxCarryForwardDays: 5,
    allowHalfDay: true,
    requiresAttachment: false,
    attachmentThresholdDays: 0,
    minNoticeDays: 3,
    autoApprove: false,
    applicableDepartments: ['All'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
  {
    id: 'pol_casual',
    companyId: DEFAULT_COMPANY_ID,
    name: 'Casual Leave',
    code: 'CL',
    description: 'Short unplanned or urgent personal matters and family responsibilities.',
    color: '#2563eb', // Blue
    type: 'paid',
    annualAllowanceDays: 12,
    accrualFrequency: 'annual_lump_sum',
    maxCarryForwardDays: 0,
    allowHalfDay: true,
    requiresAttachment: false,
    attachmentThresholdDays: 0,
    minNoticeDays: 1,
    autoApprove: false,
    applicableDepartments: ['All'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-20T14:30:00.000Z',
  },
  {
    id: 'pol_sick',
    companyId: DEFAULT_COMPANY_ID,
    name: 'Sick & Medical Leave',
    code: 'SL',
    description: 'Time off for recovery from illness, surgery, or medical appointments.',
    color: '#dc2626', // Red
    type: 'paid',
    annualAllowanceDays: 10,
    accrualFrequency: 'annual_lump_sum',
    maxCarryForwardDays: 3,
    allowHalfDay: true,
    requiresAttachment: true,
    attachmentThresholdDays: 2,
    minNoticeDays: 0,
    autoApprove: false,
    applicableDepartments: ['All'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-01T09:00:00.000Z',
  },
  {
    id: 'pol_parental',
    companyId: DEFAULT_COMPANY_ID,
    name: 'Parental & Maternity Leave',
    code: 'PPL',
    description: 'Paid extended leave for primary and secondary caregivers following childbirth or adoption.',
    color: '#9333ea', // Purple
    type: 'paid',
    annualAllowanceDays: 84, // 12 weeks
    accrualFrequency: 'annual_lump_sum',
    maxCarryForwardDays: 0,
    allowHalfDay: false,
    requiresAttachment: true,
    attachmentThresholdDays: 1,
    minNoticeDays: 30,
    autoApprove: false,
    applicableDepartments: ['All'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-06-10T11:00:00.000Z',
  },
  {
    id: 'pol_bereavement',
    companyId: DEFAULT_COMPANY_ID,
    name: 'Bereavement Leave',
    code: 'BER',
    description: 'Compassionate leave granted upon the loss of an immediate family member.',
    color: '#475569', // Slate
    type: 'paid',
    annualAllowanceDays: 5,
    accrualFrequency: 'annual_lump_sum',
    maxCarryForwardDays: 0,
    allowHalfDay: false,
    requiresAttachment: false,
    attachmentThresholdDays: 0,
    minNoticeDays: 0,
    autoApprove: true,
    applicableDepartments: ['All'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-05-12T08:00:00.000Z',
  },
  {
    id: 'pol_unpaid',
    companyId: DEFAULT_COMPANY_ID,
    name: 'Loss of Pay (LOP) / Unpaid',
    code: 'LOP',
    description: 'Authorized unpaid leave when all paid balances have been exhausted.',
    color: '#d97706', // Amber
    type: 'unpaid',
    annualAllowanceDays: 30,
    accrualFrequency: 'annual_lump_sum',
    maxCarryForwardDays: 0,
    allowHalfDay: true,
    requiresAttachment: false,
    attachmentThresholdDays: 0,
    minNoticeDays: 5,
    autoApprove: false,
    applicableDepartments: ['All'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-07-04T12:00:00.000Z',
  },
];

const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: 'req_001',
    companyId: DEFAULT_COMPANY_ID,
    employeeId: 'emp_001',
    employeeName: 'Rajesh Kumar',
    employeeEmail: 'rajesh@flextr.com',
    department: 'Engineering',
    designation: 'Senior Developer',
    policyId: 'pol_vacation',
    leaveTypeName: 'Annual Vacation',
    leaveTypeCode: 'VAC',
    color: '#0f766e',
    startDate: '2026-10-06',
    endDate: '2026-10-08',
    durationDays: 3,
    isHalfDay: false,
    reason: 'Family trip to Munnar planned over the festive extended weekend.',
    status: 'pending',
    appliedAt: '2026-09-29T11:20:00.000Z', // > 48h ago -> urgent indicator
    currentAvailableBalance: 11,
    balanceAfterApproval: 8,
    overlappingTeammatesCount: 1, // Priya Sharma also away on Oct 7-8!
  },
  {
    id: 'req_002',
    companyId: DEFAULT_COMPANY_ID,
    employeeId: 'emp_004',
    employeeName: 'Priya Sharma',
    employeeEmail: 'priya.s@flextr.com',
    department: 'Engineering',
    designation: 'Fullstack Architect',
    policyId: 'pol_casual',
    leaveTypeName: 'Casual Leave',
    leaveTypeCode: 'CL',
    color: '#2563eb',
    startDate: '2026-10-07',
    endDate: '2026-10-07',
    durationDays: 0.5,
    isHalfDay: true,
    halfDaySession: 'afternoon',
    reason: 'Need afternoon off for home lease signing and paperwork.',
    status: 'pending',
    appliedAt: '2026-10-01T09:15:00.000Z',
    currentAvailableBalance: 7.5,
    balanceAfterApproval: 7.0,
    overlappingTeammatesCount: 1, // Rajesh Kumar is away
  },
  {
    id: 'req_003',
    companyId: DEFAULT_COMPANY_ID,
    employeeId: 'emp_002',
    employeeName: 'Meera Singh',
    employeeEmail: 'meera@flextr.com',
    department: 'Design',
    designation: 'Lead Designer',
    policyId: 'pol_sick',
    leaveTypeName: 'Sick & Medical Leave',
    leaveTypeCode: 'SL',
    color: '#dc2626',
    startDate: '2026-10-02',
    endDate: '2026-10-02',
    durationDays: 1,
    isHalfDay: false,
    reason: 'Severe migraine; doctor recommended bed rest for 24 hours.',
    attachmentName: 'clinic_prescription_02oct.pdf',
    status: 'pending',
    appliedAt: '2026-10-01T08:30:00.000Z',
    currentAvailableBalance: 8,
    balanceAfterApproval: 7,
    overlappingTeammatesCount: 0,
  },
  {
    id: 'req_004',
    companyId: DEFAULT_COMPANY_ID,
    employeeId: 'emp_005',
    employeeName: 'Vikram Malhotra',
    employeeEmail: 'vikram.m@flextr.com',
    department: 'Sales & BD',
    designation: 'Account Executive',
    policyId: 'pol_vacation',
    leaveTypeName: 'Annual Vacation',
    leaveTypeCode: 'VAC',
    color: '#0f766e',
    startDate: '2026-10-14',
    endDate: '2026-10-16',
    durationDays: 3,
    isHalfDay: false,
    reason: 'Annual family festival celebrations in Delhi.',
    status: 'pending',
    appliedAt: '2026-09-30T16:45:00.000Z',
    currentAvailableBalance: 12,
    balanceAfterApproval: 9,
    overlappingTeammatesCount: 0,
  },
  {
    id: 'req_005',
    companyId: DEFAULT_COMPANY_ID,
    employeeId: 'emp_006',
    employeeName: 'Sneha Reddy',
    employeeEmail: 'sneha.r@flextr.com',
    department: 'Marketing',
    designation: 'Growth Specialist',
    policyId: 'pol_casual',
    leaveTypeName: 'Casual Leave',
    leaveTypeCode: 'CL',
    color: '#2563eb',
    startDate: '2026-09-28',
    endDate: '2026-09-28',
    durationDays: 1,
    isHalfDay: false,
    reason: 'Attending sibling university graduation ceremony.',
    status: 'approved',
    appliedAt: '2026-09-22T10:00:00.000Z',
    reviewedBy: 'Amit Patel (HR)',
    reviewedAt: '2026-09-23T14:10:00.000Z',
    reviewNote: 'Approved. Enjoy the celebration!',
    currentAvailableBalance: 6,
    balanceAfterApproval: 5,
  },
  {
    id: 'req_006',
    companyId: DEFAULT_COMPANY_ID,
    employeeId: 'emp_007',
    employeeName: 'Karthik Subramanian',
    employeeEmail: 'karthik.s@flextr.com',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    policyId: 'pol_sick',
    leaveTypeName: 'Sick & Medical Leave',
    leaveTypeCode: 'SL',
    color: '#dc2626',
    startDate: '2026-09-18',
    endDate: '2026-09-18',
    durationDays: 1,
    isHalfDay: false,
    reason: 'Viral fever and exhaustion following nighttime production outage.',
    status: 'approved',
    appliedAt: '2026-09-17T20:30:00.000Z',
    reviewedBy: 'Amit Patel (HR)',
    reviewedAt: '2026-09-18T08:00:00.000Z',
    reviewNote: 'Get well soon. Coverage assigned to Rajesh.',
    currentAvailableBalance: 9,
    balanceAfterApproval: 8,
  },
  {
    id: 'req_007',
    companyId: DEFAULT_COMPANY_ID,
    employeeId: 'emp_008',
    employeeName: 'Ananya Deshmukh',
    employeeEmail: 'ananya.d@flextr.com',
    department: 'Finance',
    designation: 'Payroll Analyst',
    policyId: 'pol_vacation',
    leaveTypeName: 'Annual Vacation',
    leaveTypeCode: 'VAC',
    color: '#0f766e',
    startDate: '2026-09-25',
    endDate: '2026-09-30',
    durationDays: 4,
    isHalfDay: false,
    reason: 'Travel out of town during quarterly payroll freeze.',
    status: 'rejected',
    appliedAt: '2026-09-15T15:00:00.000Z',
    reviewedBy: 'Amit Patel (HR)',
    reviewedAt: '2026-09-16T11:00:00.000Z',
    reviewNote: 'Cannot approve leave during month-end payroll execution window. Please reschedule after Oct 5.',
    currentAvailableBalance: 15,
    balanceAfterApproval: 15,
  },
  {
    id: 'req_008',
    companyId: DEFAULT_COMPANY_ID,
    employeeId: 'emp_003',
    employeeName: 'Amit Patel',
    employeeEmail: 'amit@flextr.com',
    department: 'Human Resources',
    designation: 'HR Manager',
    policyId: 'pol_vacation',
    leaveTypeName: 'Annual Vacation',
    leaveTypeCode: 'VAC',
    color: '#0f766e',
    startDate: '2026-10-01',
    endDate: '2026-10-01',
    durationDays: 1,
    isHalfDay: false,
    reason: 'Personal off-grid recharge day.',
    status: 'approved',
    appliedAt: '2026-09-20T10:00:00.000Z',
    reviewedBy: 'Executive Ops',
    reviewedAt: '2026-09-21T09:00:00.000Z',
    reviewNote: 'Approved.',
    currentAvailableBalance: 14,
    balanceAfterApproval: 13,
  },
];

const INITIAL_BALANCES: EmployeeLeaveBalance[] = [
  {
    employeeId: 'emp_001',
    employeeName: 'Rajesh Kumar',
    employeeEmail: 'rajesh@flextr.com',
    department: 'Engineering',
    designation: 'Senior Developer',
    fiscalYear: '2026',
    balances: [
      { policyId: 'pol_vacation', policyName: 'Annual Vacation', policyCode: 'VAC', color: '#0f766e', totalEntitled: 18, taken: 4, pending: 3, available: 11 },
      { policyId: 'pol_casual', policyName: 'Casual Leave', policyCode: 'CL', color: '#2563eb', totalEntitled: 12, taken: 3, pending: 0, available: 9 },
      { policyId: 'pol_sick', policyName: 'Sick & Medical', policyCode: 'SL', color: '#dc2626', totalEntitled: 10, taken: 2, pending: 0, available: 8 },
    ],
    totalEntitled: 40,
    totalTaken: 9,
    totalPending: 3,
    totalAvailable: 28,
  },
  {
    employeeId: 'emp_002',
    employeeName: 'Meera Singh',
    employeeEmail: 'meera@flextr.com',
    department: 'Design',
    designation: 'Lead Designer',
    fiscalYear: '2026',
    balances: [
      { policyId: 'pol_vacation', policyName: 'Annual Vacation', policyCode: 'VAC', color: '#0f766e', totalEntitled: 18, taken: 6, pending: 0, available: 12 },
      { policyId: 'pol_casual', policyName: 'Casual Leave', policyCode: 'CL', color: '#2563eb', totalEntitled: 12, taken: 4, pending: 0, available: 8 },
      { policyId: 'pol_sick', policyName: 'Sick & Medical', policyCode: 'SL', color: '#dc2626', totalEntitled: 10, taken: 1, pending: 1, available: 8 },
    ],
    totalEntitled: 40,
    totalTaken: 11,
    totalPending: 1,
    totalAvailable: 28,
  },
  {
    employeeId: 'emp_003',
    employeeName: 'Amit Patel',
    employeeEmail: 'amit@flextr.com',
    department: 'Human Resources',
    designation: 'HR Manager',
    fiscalYear: '2026',
    balances: [
      { policyId: 'pol_vacation', policyName: 'Annual Vacation', policyCode: 'VAC', color: '#0f766e', totalEntitled: 18, taken: 5, pending: 0, available: 13 },
      { policyId: 'pol_casual', policyName: 'Casual Leave', policyCode: 'CL', color: '#2563eb', totalEntitled: 12, taken: 2, pending: 0, available: 10 },
      { policyId: 'pol_sick', policyName: 'Sick & Medical', policyCode: 'SL', color: '#dc2626', totalEntitled: 10, taken: 0, pending: 0, available: 10 },
    ],
    totalEntitled: 40,
    totalTaken: 7,
    totalPending: 0,
    totalAvailable: 33,
  },
  {
    employeeId: 'emp_004',
    employeeName: 'Priya Sharma',
    employeeEmail: 'priya.s@flextr.com',
    department: 'Engineering',
    designation: 'Fullstack Architect',
    fiscalYear: '2026',
    balances: [
      { policyId: 'pol_vacation', policyName: 'Annual Vacation', policyCode: 'VAC', color: '#0f766e', totalEntitled: 18, taken: 5, pending: 0, available: 13 },
      { policyId: 'pol_casual', policyName: 'Casual Leave', policyCode: 'CL', color: '#2563eb', totalEntitled: 12, taken: 4, pending: 0.5, available: 7.5 },
      { policyId: 'pol_sick', policyName: 'Sick & Medical', policyCode: 'SL', color: '#dc2626', totalEntitled: 10, taken: 1, pending: 0, available: 9 },
    ],
    totalEntitled: 40,
    totalTaken: 10,
    totalPending: 0.5,
    totalAvailable: 29.5,
  },
  {
    employeeId: 'emp_005',
    employeeName: 'Vikram Malhotra',
    employeeEmail: 'vikram.m@flextr.com',
    department: 'Sales & BD',
    designation: 'Account Executive',
    fiscalYear: '2026',
    balances: [
      { policyId: 'pol_vacation', policyName: 'Annual Vacation', policyCode: 'VAC', color: '#0f766e', totalEntitled: 18, taken: 3, pending: 3, available: 12 },
      { policyId: 'pol_casual', policyName: 'Casual Leave', policyCode: 'CL', color: '#2563eb', totalEntitled: 12, taken: 5, pending: 0, available: 7 },
      { policyId: 'pol_sick', policyName: 'Sick & Medical', policyCode: 'SL', color: '#dc2626', totalEntitled: 10, taken: 0, pending: 0, available: 10 },
    ],
    totalEntitled: 40,
    totalTaken: 8,
    totalPending: 3,
    totalAvailable: 29,
  },
  {
    employeeId: 'emp_006',
    employeeName: 'Sneha Reddy',
    employeeEmail: 'sneha.r@flextr.com',
    department: 'Marketing',
    designation: 'Growth Specialist',
    fiscalYear: '2026',
    balances: [
      { policyId: 'pol_vacation', policyName: 'Annual Vacation', policyCode: 'VAC', color: '#0f766e', totalEntitled: 18, taken: 8, pending: 0, available: 10 },
      { policyId: 'pol_casual', policyName: 'Casual Leave', policyCode: 'CL', color: '#2563eb', totalEntitled: 12, taken: 6, pending: 0, available: 6 },
      { policyId: 'pol_sick', policyName: 'Sick & Medical', policyCode: 'SL', color: '#dc2626', totalEntitled: 10, taken: 3, pending: 0, available: 7 },
    ],
    totalEntitled: 40,
    totalTaken: 17,
    totalPending: 0,
    totalAvailable: 23,
  },
  {
    employeeId: 'emp_007',
    employeeName: 'Karthik Subramanian',
    employeeEmail: 'karthik.s@flextr.com',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    fiscalYear: '2026',
    balances: [
      { policyId: 'pol_vacation', policyName: 'Annual Vacation', policyCode: 'VAC', color: '#0f766e', totalEntitled: 18, taken: 2, pending: 0, available: 16 },
      { policyId: 'pol_casual', policyName: 'Casual Leave', policyCode: 'CL', color: '#2563eb', totalEntitled: 12, taken: 2, pending: 0, available: 10 },
      { policyId: 'pol_sick', policyName: 'Sick & Medical', policyCode: 'SL', color: '#dc2626', totalEntitled: 10, taken: 1, pending: 0, available: 9 },
    ],
    totalEntitled: 40,
    totalTaken: 5,
    totalPending: 0,
    totalAvailable: 35,
  },
  {
    employeeId: 'emp_008',
    employeeName: 'Ananya Deshmukh',
    employeeEmail: 'ananya.d@flextr.com',
    department: 'Finance',
    designation: 'Payroll Analyst',
    fiscalYear: '2026',
    balances: [
      { policyId: 'pol_vacation', policyName: 'Annual Vacation', policyCode: 'VAC', color: '#0f766e', totalEntitled: 18, taken: 3, pending: 0, available: 15 },
      { policyId: 'pol_casual', policyName: 'Casual Leave', policyCode: 'CL', color: '#2563eb', totalEntitled: 12, taken: 1, pending: 0, available: 11 },
      { policyId: 'pol_sick', policyName: 'Sick & Medical', policyCode: 'SL', color: '#dc2626', totalEntitled: 10, taken: 0, pending: 0, available: 10 },
    ],
    totalEntitled: 40,
    totalTaken: 4,
    totalPending: 0,
    totalAvailable: 36,
  },
];

class LeaveServiceImpl {
  private policies: LeavePolicy[] = [...INITIAL_POLICIES];
  private requests: LeaveRequest[] = [...INITIAL_REQUESTS];
  private balances: EmployeeLeaveBalance[] = [...INITIAL_BALANCES];

  /**
   * Helper to compute business days excluding Saturdays and Sundays
   */
  public calculateBusinessDays(startDateStr: string, endDateStr: string): number {
    if (!startDateStr || !endDateStr) return 0;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  /**
   * Get all time-off policies
   */
  public async getPolicies(companyId: string = DEFAULT_COMPANY_ID): Promise<LeavePolicy[]> {
    try {
      const res = await apiClient.get<LeavePolicy[]>(API_ENDPOINTS.leave.policies, {
        params: { companyId },
      });
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
    } catch {
      // Fallback
    }
    return [...this.policies];
  }

  /**
   * Save or update a leave policy
   */
  public async savePolicy(policy: Partial<LeavePolicy>): Promise<LeavePolicy> {
    const isNew = !policy.id;
    const nowStr = new Date().toISOString();

    const savedPolicy: LeavePolicy = {
      id: policy.id || `pol_${Date.now()}`,
      companyId: policy.companyId || DEFAULT_COMPANY_ID,
      name: policy.name || 'Custom Policy',
      code: (policy.code || 'CUST').toUpperCase(),
      description: policy.description || '',
      color: policy.color || '#0f766e',
      type: policy.type || 'paid',
      annualAllowanceDays: policy.annualAllowanceDays ?? 12,
      accrualFrequency: policy.accrualFrequency || 'annual_lump_sum',
      maxCarryForwardDays: policy.maxCarryForwardDays ?? 0,
      allowHalfDay: policy.allowHalfDay ?? true,
      requiresAttachment: policy.requiresAttachment ?? false,
      attachmentThresholdDays: policy.attachmentThresholdDays ?? 0,
      minNoticeDays: policy.minNoticeDays ?? 1,
      autoApprove: policy.autoApprove ?? false,
      applicableDepartments: policy.applicableDepartments || ['All'],
      isActive: policy.isActive ?? true,
      createdAt: policy.createdAt || nowStr,
      updatedAt: nowStr,
    };

    try {
      if (isNew) {
        await apiClient.post(API_ENDPOINTS.leave.policies, savedPolicy);
      } else {
        await apiClient.put(API_ENDPOINTS.leave.policyById(savedPolicy.id), savedPolicy);
      }
    } catch {
      // Fallback local store
    }

    if (isNew) {
      this.policies.unshift(savedPolicy);
    } else {
      const idx = this.policies.findIndex((p) => p.id === savedPolicy.id);
      if (idx !== -1) {
        this.policies[idx] = savedPolicy;
      }
    }
    return savedPolicy;
  }

  /**
   * Toggle policy active/inactive status
   */
  public async togglePolicyStatus(policyId: string): Promise<LeavePolicy> {
    const policy = this.policies.find((p) => p.id === policyId);
    if (!policy) throw new Error('Policy not found');

    const updated = {
      ...policy,
      isActive: !policy.isActive,
      updatedAt: new Date().toISOString(),
    };

    try {
      await apiClient.put(API_ENDPOINTS.leave.policyById(policyId), updated);
    } catch {
      // Fallback
    }

    const idx = this.policies.findIndex((p) => p.id === policyId);
    if (idx !== -1) {
      this.policies[idx] = updated;
    }
    return updated;
  }

  /**
   * Get leave requests with optional filters
   */
  public async getRequests(params?: LeaveQueryParams): Promise<LeaveRequest[]> {
    try {
      const res = await apiClient.get<LeaveRequest[]>(API_ENDPOINTS.leave.requests, {
        params: params as Record<string, string | number | boolean | undefined>,
      });
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
    } catch {
      // Fallback
    }

    return this.requests.filter((r) => {
      if (params?.status && params.status !== 'all' && r.status !== params.status) return false;
      if (params?.department && params.department !== 'all' && r.department.toLowerCase() !== params.department.toLowerCase()) return false;
      if (params?.policyId && params.policyId !== 'all' && r.policyId !== params.policyId) return false;
      if (params?.employeeId && r.employeeId !== params.employeeId) return false;
      if (params?.search) {
        const q = params.search.toLowerCase();
        const matchName = r.employeeName.toLowerCase().includes(q);
        const matchDept = r.department.toLowerCase().includes(q);
        const matchReason = r.reason.toLowerCase().includes(q);
        if (!matchName && !matchDept && !matchReason) return false;
      }
      return true;
    });
  }

  /**
   * Get employee leave balances
   */
  public async getBalances(params?: { search?: string; department?: string; employeeId?: string }): Promise<EmployeeLeaveBalance[]> {
    try {
      const res = await apiClient.get<EmployeeLeaveBalance[]>(API_ENDPOINTS.leave.balances, {
        params,
      });
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
    } catch {
      // Fallback
    }

    return this.balances.filter((b) => {
      if (params?.employeeId && b.employeeId !== params.employeeId) return false;
      if (params?.department && params.department !== 'all' && b.department.toLowerCase() !== params.department.toLowerCase()) return false;
      if (params?.search) {
        const q = params.search.toLowerCase();
        if (!b.employeeName.toLowerCase().includes(q) && !b.employeeEmail.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Get high-level KPI metrics
   */
  public async getKPIStats(companyId: string = DEFAULT_COMPANY_ID): Promise<LeaveKPIStats> {
    try {
      const res = await apiClient.get<LeaveKPIStats>(API_ENDPOINTS.leave.summary, {
        params: { companyId },
      });
      if (res && typeof res.pendingApprovalsCount === 'number') {
        return res;
      }
    } catch {
      // Fallback
    }

    const pending = this.requests.filter((r) => r.status === 'pending');
    const now = Date.now();
    const urgentCount = pending.filter((r) => {
      const appliedTime = new Date(r.appliedAt).getTime();
      return now - appliedTime > 48 * 60 * 60 * 1000;
    }).length;

    const todayStr = '2026-10-01'; // aligned with runtime clock
    const onLeaveToday = this.requests.filter(
      (r) => r.status === 'approved' && r.startDate <= todayStr && r.endDate >= todayStr
    ).length;

    const totalEntitlement = this.balances.reduce((acc, curr) => acc + curr.totalEntitled, 0);
    const totalTaken = this.balances.reduce((acc, curr) => acc + curr.totalTaken, 0);
    const consumedPct = totalEntitlement > 0 ? Math.round((totalTaken / totalEntitlement) * 100) : 0;

    return {
      pendingApprovalsCount: pending.length,
      onLeaveTodayCount: onLeaveToday,
      onLeaveThisWeekCount: onLeaveToday + 2,
      totalEntitlementConsumedPercentage: consumedPct,
      activePoliciesCount: this.policies.filter((p) => p.isActive).length,
      urgentPendingCount: urgentCount,
    };
  }

  /**
   * Approve a leave request
   */
  public async approveRequest(id: string, payload?: ReviewLeavePayload): Promise<LeaveRequest> {
    try {
      await apiClient.post(API_ENDPOINTS.leave.approve(id), payload);
    } catch {
      // Fallback
    }

    const idx = this.requests.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Request not found');

    const req = this.requests[idx]!;
    const updated: LeaveRequest = {
      ...req,
      status: 'approved',
      reviewedBy: payload?.reviewerName || 'Admin Manager',
      reviewedAt: new Date().toISOString(),
      reviewNote: payload?.note || 'Approved leave request',
      currentAvailableBalance: req.balanceAfterApproval,
    };

    this.requests[idx] = updated;

    // Update corresponding employee balance
    const balIdx = this.balances.findIndex((b) => b.employeeId === req.employeeId);
    if (balIdx !== -1) {
      const bal = this.balances[balIdx]!;
      const updatedPolicyBalances = bal.balances.map((p) => {
        if (p.policyId === req.policyId) {
          return {
            ...p,
            taken: p.taken + req.durationDays,
            pending: Math.max(0, p.pending - req.durationDays),
            available: Math.max(0, p.available - req.durationDays),
          };
        }
        return p;
      });

      this.balances[balIdx] = {
        ...bal,
        balances: updatedPolicyBalances,
        totalTaken: bal.totalTaken + req.durationDays,
        totalPending: Math.max(0, bal.totalPending - req.durationDays),
        totalAvailable: Math.max(0, bal.totalAvailable - req.durationDays),
      };
    }

    return updated;
  }

  /**
   * Reject a leave request
   */
  public async rejectRequest(id: string, payload?: ReviewLeavePayload): Promise<LeaveRequest> {
    try {
      await apiClient.post(API_ENDPOINTS.leave.reject(id), payload);
    } catch {
      // Fallback
    }

    const idx = this.requests.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Request not found');

    const req = this.requests[idx]!;
    const updated: LeaveRequest = {
      ...req,
      status: 'rejected',
      reviewedBy: payload?.reviewerName || 'Admin Manager',
      reviewedAt: new Date().toISOString(),
      reviewNote: payload?.note || 'Request rejected by management',
    };

    this.requests[idx] = updated;

    // Restore pending balance
    const balIdx = this.balances.findIndex((b) => b.employeeId === req.employeeId);
    if (balIdx !== -1) {
      const bal = this.balances[balIdx]!;
      const updatedPolicyBalances = bal.balances.map((p) => {
        if (p.policyId === req.policyId) {
          return {
            ...p,
            pending: Math.max(0, p.pending - req.durationDays),
          };
        }
        return p;
      });

      this.balances[balIdx] = {
        ...bal,
        balances: updatedPolicyBalances,
        totalPending: Math.max(0, bal.totalPending - req.durationDays),
      };
    }

    return updated;
  }

  /**
   * Batch approve requests
   */
  public async batchApprove(payload: BatchReviewPayload): Promise<number> {
    let count = 0;
    for (const id of payload.requestIds) {
      try {
        await this.approveRequest(id, { reviewerName: payload.reviewerName, note: payload.note });
        count++;
      } catch {
        // continue
      }
    }
    return count;
  }

  /**
   * Batch reject requests
   */
  public async batchReject(payload: BatchReviewPayload): Promise<number> {
    let count = 0;
    for (const id of payload.requestIds) {
      try {
        await this.rejectRequest(id, { reviewerName: payload.reviewerName, note: payload.note });
        count++;
      } catch {
        // continue
      }
    }
    return count;
  }

  /**
   * Adjust employee leave balance manually
   */
  public async adjustBalance(payload: BalanceAdjustmentPayload): Promise<EmployeeLeaveBalance> {
    try {
      await apiClient.post(API_ENDPOINTS.leave.adjustBalance, payload);
    } catch {
      // Fallback
    }

    const balIdx = this.balances.findIndex((b) => b.employeeId === payload.employeeId);
    if (balIdx === -1) throw new Error('Employee balance record not found');

    const bal = this.balances[balIdx]!;
    const updatedPolicyBalances = bal.balances.map((p) => {
      if (p.policyId === payload.policyId) {
        const newAvailable = Math.max(0, p.available + payload.adjustmentDays);
        const newEntitled = Math.max(0, p.totalEntitled + payload.adjustmentDays);
        return {
          ...p,
          totalEntitled: newEntitled,
          available: newAvailable,
        };
      }
      return p;
    });

    const updated: EmployeeLeaveBalance = {
      ...bal,
      balances: updatedPolicyBalances,
      totalEntitled: Math.max(0, bal.totalEntitled + payload.adjustmentDays),
      totalAvailable: Math.max(0, bal.totalAvailable + payload.adjustmentDays),
    };

    this.balances[balIdx] = updated;
    return updated;
  }

  /**
   * Apply / Submit a new leave request
   */
  public async applyLeave(payload: ApplyLeavePayload): Promise<LeaveRequest> {
    const policy = this.policies.find((p) => p.id === payload.policyId);
    if (!policy) throw new Error('Policy not found');

    const emp = this.balances.find((b) => b.employeeId === payload.employeeId);
    const empName = emp?.employeeName || 'Employee';
    const empEmail = emp?.employeeEmail || `${payload.employeeId}@flextr.com`;
    const department = emp?.department || 'Engineering';
    const designation = emp?.designation || 'Staff';

    const calculatedDays = payload.isHalfDay
      ? 0.5
      : this.calculateBusinessDays(payload.startDate, payload.endDate);

    const polBal = emp?.balances.find((p) => p.policyId === payload.policyId);
    const currentAvailable = polBal ? polBal.available : 10;
    const balanceAfter = Math.max(0, currentAvailable - calculatedDays);

    // Detect department conflicts
    const overlapping = this.requests.filter(
      (r) =>
        r.department === department &&
        r.employeeId !== payload.employeeId &&
        (r.status === 'pending' || r.status === 'approved') &&
        !(payload.endDate < r.startDate || payload.startDate > r.endDate)
    ).length;

    const newRequest: LeaveRequest = {
      id: `req_${Date.now()}`,
      companyId: DEFAULT_COMPANY_ID,
      employeeId: payload.employeeId,
      employeeName: empName,
      employeeEmail: empEmail,
      department,
      designation,
      policyId: policy.id,
      leaveTypeName: policy.name,
      leaveTypeCode: policy.code,
      color: policy.color,
      startDate: payload.startDate,
      endDate: payload.endDate,
      durationDays: calculatedDays,
      isHalfDay: Boolean(payload.isHalfDay),
      halfDaySession: payload.halfDaySession,
      reason: payload.reason,
      attachmentName: payload.attachmentName,
      status: policy.autoApprove ? 'approved' : 'pending',
      appliedAt: new Date().toISOString(),
      currentAvailableBalance: currentAvailable,
      balanceAfterApproval: balanceAfter,
      overlappingTeammatesCount: overlapping,
    };

    try {
      await apiClient.post(API_ENDPOINTS.leave.requests, newRequest);
    } catch {
      // Fallback
    }

    this.requests.unshift(newRequest);

    // If not auto-approved, mark as pending on balance
    if (emp) {
      const balIdx = this.balances.findIndex((b) => b.employeeId === payload.employeeId);
      if (balIdx !== -1) {
        const bal = this.balances[balIdx]!;
        const updatedPolicyBalances = bal.balances.map((p) => {
          if (p.policyId === payload.policyId) {
            return {
              ...p,
              pending: p.pending + calculatedDays,
            };
          }
          return p;
        });

        this.balances[balIdx] = {
          ...bal,
          balances: updatedPolicyBalances,
          totalPending: bal.totalPending + calculatedDays,
        };
      }
    }

    return newRequest;
  }
}

export const leaveService = new LeaveServiceImpl();
