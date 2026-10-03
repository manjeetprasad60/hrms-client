import { useState, useEffect, useCallback, useTransition, useContext } from 'react';
import { PageContainer } from '../../../layouts';
import { Button, Spinner, Tabs } from '../../../components/ui';
import {
  LeaveOverviewMetrics,
  PendingApprovalsList,
  LeaveBalancesView,
  TimeOffPoliciesList,
  LeaveCalendarView,
  LeaveHistoryTable,
  ApplyLeaveModal,
  AdjustBalanceModal,
  RejectLeaveModal,
  LeaveRequestDetailModal,
  PolicyEditorModal,
} from '../components';
import { leaveService } from '../../../services/leave';
import { ClientContext } from '../../../routes/ClientContext';
import type {
  LeaveRequest,
  LeavePolicy,
  EmployeeLeaveBalance,
  LeaveKPIStats,
  LeaveTabKey,
  ApplyLeavePayload,
  BalanceAdjustmentPayload,
} from '../types';

const DEFAULT_COMPANY_ID = 'cmp_hrms_28_2886';

export function LeaveManagementPage() {
  const [, startTransition] = useTransition();
  const clientContext = useContext(ClientContext);
  const companyId =
    clientContext?.organizationId || clientContext?.clientUser?.companyId || DEFAULT_COMPANY_ID;

  // Active Tab State
  const [activeTab, setActiveTab] = useState<LeaveTabKey>('approvals');

  // Domain States
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [balances, setBalances] = useState<EmployeeLeaveBalance[]>([]);
  const [stats, setStats] = useState<LeaveKPIStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyDefaultEmployeeId, setApplyDefaultEmployeeId] = useState<string | undefined>(undefined);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null);
  const [selectedBalanceEmployee, setSelectedBalanceEmployee] = useState<EmployeeLeaveBalance | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<LeaveRequest | null>(null);
  const [detailRequest, setDetailRequest] = useState<LeaveRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    try {
      const [reqData, polData, balData, statsData] = await Promise.all([
        leaveService.getRequests({ companyId }),
        leaveService.getPolicies(companyId),
        leaveService.getBalances(),
        leaveService.getKPIStats(companyId),
      ]);

      startTransition(() => {
        setRequests(reqData);
        setPolicies(polData);
        setBalances(balData);
        setStats(statsData);
        setIsLoading(false);
      });
    } catch {
      startTransition(() => {
        setIsLoading(false);
      });
    }
  }, [companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions: Approval
  const handleApprove = async (id: string) => {
    try {
      const updated = await leaveService.approveRequest(id, { reviewerName: 'HR Admin' });
      showToast(`Approved leave request for ${updated.employeeName}`);
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Approval failed', 'info');
    }
  };

  const handleBatchApprove = async (ids: readonly string[]) => {
    try {
      const count = await leaveService.batchApprove({ requestIds: ids, reviewerName: 'HR Admin' });
      showToast(`Batch approved ${count} leave requests`);
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Batch approve failed', 'info');
    }
  };

  // Actions: Rejection
  const handleConfirmReject = async (id: string, note: string) => {
    setIsSubmitting(true);
    try {
      const updated = await leaveService.rejectRequest(id, { reviewerName: 'HR Admin', note });
      showToast(`Declined leave request for ${updated.employeeName}`);
      loadData();
      setRejectingRequest(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchReject = async (ids: readonly string[]) => {
    try {
      const count = await leaveService.batchReject({
        requestIds: ids,
        reviewerName: 'HR Admin',
        note: 'Declined via batch review',
      });
      showToast(`Declined ${count} leave requests`);
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Batch reject failed', 'info');
    }
  };

  // Actions: Balance Adjustment
  const handleBalanceAdjustment = async (payload: BalanceAdjustmentPayload) => {
    setIsSubmitting(true);
    try {
      await leaveService.adjustBalance(payload);
      showToast('Leave balance adjusted successfully');
      loadData();
      setSelectedBalanceEmployee(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actions: Policy Toggle & Save
  const handleTogglePolicyStatus = async (policyId: string) => {
    try {
      const updated = await leaveService.togglePolicyStatus(policyId);
      showToast(`Policy "${updated.name}" is now ${updated.isActive ? 'active' : 'inactive'}`);
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Toggle failed', 'info');
    }
  };

  const handleSavePolicy = async (payload: Partial<LeavePolicy>) => {
    setIsSubmitting(true);
    try {
      const saved = await leaveService.savePolicy({ ...payload, companyId });
      showToast(`Policy "${saved.name}" saved successfully`);
      loadData();
      setIsPolicyModalOpen(false);
      setEditingPolicy(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actions: Apply Leave
  const handleApplyLeave = async (payload: ApplyLeavePayload) => {
    setIsSubmitting(true);
    try {
      const req = await leaveService.applyLeave(payload);
      showToast(`Leave request submitted for ${req.employeeName}`);
      loadData();
      setIsApplyModalOpen(false);
      setApplyDefaultEmployeeId(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activePoliciesCount = policies.filter((p) => p.isActive).length;

  return (
    <PageContainer
      title="Leave Management"
      description="Track time-off policies, leave balances, and pending approvals."
      breadcrumbs={[{ label: 'Leave', path: '/leave' }]}
    >
      {/* Toast Notification Alert */}
      {notification && (
        <div
          className={`alert alert-${notification.type === 'success' ? 'success' : 'info'}`}
          style={{
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            style={{ color: 'inherit', padding: '0.25rem', cursor: 'pointer' }}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Header Actions & Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-bg-subtle)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            📅 Fiscal Year: 2026 Cycle
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            • Standard 40h weekly work schedules
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Button
            variant="secondary"
            onClick={() => {
              setEditingPolicy(null);
              setIsPolicyModalOpen(true);
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            New Policy
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              setApplyDefaultEmployeeId(undefined);
              setIsApplyModalOpen(true);
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Apply Leave
          </Button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      {stats && (
        <LeaveOverviewMetrics
          stats={stats}
          onQuickFilter={(targetTab) => setActiveTab(targetTab as LeaveTabKey)}
        />
      )}

      {/* Central Navigation Tabs */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Tabs
          tabs={[
            { id: 'approvals', label: 'Pending Approvals', count: pendingRequests.length },
            { id: 'balances', label: 'Leave Balances', count: balances.length },
            { id: 'policies', label: 'Time-Off Policies', count: activePoliciesCount },
            { id: 'calendar', label: "Team Calendar / Who's Away" },
            { id: 'history', label: 'Request History' },
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as LeaveTabKey)}
          aria-label="Leave management views"
        />
      </div>

      {/* Tab Panels */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Spinner />
        </div>
      ) : (
        <div>
          {/* Tab 1: Pending Approvals */}
          {activeTab === 'approvals' && (
            <PendingApprovalsList
              requests={pendingRequests}
              onApprove={handleApprove}
              onReject={(req) => setRejectingRequest(req)}
              onBatchApprove={handleBatchApprove}
              onBatchReject={handleBatchReject}
              onViewDetails={(req) => setDetailRequest(req)}
            />
          )}

          {/* Tab 2: Leave Balances */}
          {activeTab === 'balances' && (
            <LeaveBalancesView
              balances={balances}
              onAdjustBalance={(emp) => setSelectedBalanceEmployee(emp)}
              onApplyForEmployee={(empId) => {
                setApplyDefaultEmployeeId(empId);
                setIsApplyModalOpen(true);
              }}
            />
          )}

          {/* Tab 3: Time-Off Policies */}
          {activeTab === 'policies' && (
            <TimeOffPoliciesList
              policies={policies}
              onToggleStatus={handleTogglePolicyStatus}
              onEditPolicy={(pol) => {
                setEditingPolicy(pol);
                setIsPolicyModalOpen(true);
              }}
              onCreatePolicy={() => {
                setEditingPolicy(null);
                setIsPolicyModalOpen(true);
              }}
            />
          )}

          {/* Tab 4: Team Calendar */}
          {activeTab === 'calendar' && (
            <LeaveCalendarView requests={requests} policies={policies} />
          )}

          {/* Tab 5: Request History */}
          {activeTab === 'history' && (
            <LeaveHistoryTable
              requests={requests}
              onViewDetails={(req) => setDetailRequest(req)}
            />
          )}
        </div>
      )}

      {/* Modal: Apply Leave */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setApplyDefaultEmployeeId(undefined);
        }}
        policies={policies}
        balances={balances}
        defaultEmployeeId={applyDefaultEmployeeId}
        onSubmit={handleApplyLeave}
        isSubmitting={isSubmitting}
      />

      {/* Modal: Adjust Balance */}
      <AdjustBalanceModal
        isOpen={Boolean(selectedBalanceEmployee)}
        onClose={() => setSelectedBalanceEmployee(null)}
        employee={selectedBalanceEmployee}
        onSubmit={handleBalanceAdjustment}
        isSubmitting={isSubmitting}
      />

      {/* Modal: Decline / Reject Leave */}
      <RejectLeaveModal
        isOpen={Boolean(rejectingRequest)}
        onClose={() => setRejectingRequest(null)}
        request={rejectingRequest}
        onConfirm={handleConfirmReject}
        isSubmitting={isSubmitting}
      />

      {/* Modal: Leave Request Audit Details */}
      <LeaveRequestDetailModal
        isOpen={Boolean(detailRequest)}
        onClose={() => setDetailRequest(null)}
        request={detailRequest}
        onApprove={handleApprove}
        onReject={(req) => setRejectingRequest(req)}
      />

      {/* Modal: Policy Editor (Create / Edit) */}
      <PolicyEditorModal
        isOpen={isPolicyModalOpen}
        onClose={() => {
          setIsPolicyModalOpen(false);
          setEditingPolicy(null);
        }}
        policy={editingPolicy}
        onSubmit={handleSavePolicy}
        isSubmitting={isSubmitting}
      />
    </PageContainer>
  );
}
