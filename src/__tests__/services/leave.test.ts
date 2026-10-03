import { describe, it, expect, beforeEach } from 'vitest';
import { leaveService } from '../../services/leave/leaveService';

describe('leaveService (Leave Management Business Logic)', () => {
  beforeEach(() => {
    // Reset or clean state if needed
  });

  describe('Business Days Calculation', () => {
    it('calculates weekdays properly excluding Saturday and Sunday', () => {
      // 2026-10-02 is Friday, 2026-10-05 is Monday
      // Friday (1), Sat (0), Sun (0), Mon (1) = 2 business days
      const days = leaveService.calculateBusinessDays('2026-10-02', '2026-10-05');
      expect(days).toBe(2);
    });

    it('returns 1 day for single weekday', () => {
      const days = leaveService.calculateBusinessDays('2026-10-06', '2026-10-06');
      expect(days).toBe(1);
    });

    it('returns 0 if start date is after end date', () => {
      const days = leaveService.calculateBusinessDays('2026-10-10', '2026-10-05');
      expect(days).toBe(0);
    });
  });

  describe('Leave Policies', () => {
    it('returns default configured time-off policies', async () => {
      const policies = await leaveService.getPolicies();
      expect(policies.length).toBeGreaterThanOrEqual(5);

      const vacation = policies.find((p) => p.code === 'VAC');
      expect(vacation).toBeDefined();
      expect(vacation?.type).toBe('paid');
      expect(vacation?.annualAllowanceDays).toBe(18);
    });

    it('toggles policy active status', async () => {
      const policies = await leaveService.getPolicies();
      const first = policies[0]!;
      const originalStatus = first.isActive;

      const updated = await leaveService.togglePolicyStatus(first.id);
      expect(updated.isActive).toBe(!originalStatus);

      // Revert back
      await leaveService.togglePolicyStatus(first.id);
    });

    it('creates and saves a new policy', async () => {
      const newPolicy = await leaveService.savePolicy({
        name: 'Wellness Day',
        code: 'WELL',
        annualAllowanceDays: 3,
        type: 'paid',
        accrualFrequency: 'annual_lump_sum',
      });

      expect(newPolicy.id).toBeDefined();
      expect(newPolicy.code).toBe('WELL');
      expect(newPolicy.annualAllowanceDays).toBe(3);
    });
  });

  describe('Leave Requests & Approvals Workflow', () => {
    it('fetches pending leave requests', async () => {
      const pending = await leaveService.getRequests({ status: 'pending' });
      expect(Array.isArray(pending)).toBe(true);
      expect(pending.every((r) => r.status === 'pending')).toBe(true);
    });

    it('submits a new leave request and reduces pending balance', async () => {
      const req = await leaveService.applyLeave({
        employeeId: 'emp_003',
        policyId: 'pol_casual',
        startDate: '2026-11-04',
        endDate: '2026-11-05',
        reason: 'Family event out of town',
      });

      expect(req.id).toBeDefined();
      expect(req.employeeId).toBe('emp_003');
      expect(req.durationDays).toBe(2);
      expect(req.status).toBe('pending');
    });

    it('approves a leave request', async () => {
      const pending = await leaveService.getRequests({ status: 'pending' });
      const target = pending[0]!;

      const approved = await leaveService.approveRequest(target.id, {
        reviewerName: 'HR Test Runner',
        note: 'Approved for test verification',
      });

      expect(approved.status).toBe('approved');
      expect(approved.reviewedBy).toBe('HR Test Runner');
    });

    it('rejects a leave request with a note', async () => {
      // Apply a request first
      const newReq = await leaveService.applyLeave({
        employeeId: 'emp_007',
        policyId: 'pol_vacation',
        startDate: '2026-12-01',
        endDate: '2026-12-02',
        reason: 'Year end trip',
      });

      const rejected = await leaveService.rejectRequest(newReq.id, {
        reviewerName: 'Lead Manager',
        note: 'Sprint freeze window',
      });

      expect(rejected.status).toBe('rejected');
      expect(rejected.reviewNote).toBe('Sprint freeze window');
    });
  });

  describe('Leave Balances & Manual Adjustments', () => {
    it('retrieves employee leave balances with total entitled and available days', async () => {
      const balances = await leaveService.getBalances();
      expect(balances.length).toBeGreaterThan(0);

      const rajesh = balances.find((b) => b.employeeId === 'emp_001');
      expect(rajesh).toBeDefined();
      expect(rajesh?.totalEntitled).toBeGreaterThan(0);
      expect(rajesh?.totalAvailable).toBeGreaterThan(0);
    });

    it('credits days to an employee leave balance', async () => {
      const balances = await leaveService.getBalances({ employeeId: 'emp_001' });
      const originalAvailable = balances[0]!.totalAvailable;

      const updated = await leaveService.adjustBalance({
        employeeId: 'emp_001',
        policyId: 'pol_vacation',
        adjustmentDays: 2,
        reason: 'bonus_credit',
        note: 'Reward for on-call weekend support',
      });

      expect(updated.totalAvailable).toBe(originalAvailable + 2);
    });
  });

  describe('KPI Metrics', () => {
    it('returns overall KPI stats including pending count and utilization %', async () => {
      const stats = await leaveService.getKPIStats();
      expect(typeof stats.pendingApprovalsCount).toBe('number');
      expect(typeof stats.onLeaveTodayCount).toBe('number');
      expect(typeof stats.totalEntitlementConsumedPercentage).toBe('number');
      expect(typeof stats.activePoliciesCount).toBe('number');
    });
  });
});
