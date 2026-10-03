import { useState, useMemo, useEffect } from 'react';
import type { LeavePolicy, EmployeeLeaveBalance, ApplyLeavePayload } from '../types';
import { Modal, Button, Input, Select, Textarea } from '../../../components/ui';
import { leaveService } from '../../../services/leave';

interface ApplyLeaveModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly policies: readonly LeavePolicy[];
  readonly balances: readonly EmployeeLeaveBalance[];
  readonly defaultEmployeeId?: string;
  readonly onSubmit: (payload: ApplyLeavePayload) => Promise<void>;
  readonly isSubmitting?: boolean;
}

export function ApplyLeaveModal({
  isOpen,
  onClose,
  policies,
  balances,
  defaultEmployeeId,
  onSubmit,
  isSubmitting = false,
}: ApplyLeaveModalProps) {
  const activePolicies = useMemo(() => policies.filter((p) => p.isActive), [policies]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    defaultEmployeeId || (balances[0]?.employeeId ?? 'emp_001')
  );
  const [selectedPolicyId, setSelectedPolicyId] = useState(
    activePolicies[0]?.id ?? 'pol_vacation'
  );
  const [startDate, setStartDate] = useState('2026-10-12');
  const [endDate, setEndDate] = useState('2026-10-13');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<'morning' | 'afternoon'>('morning');
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync default employee when passed
  useEffect(() => {
    if (defaultEmployeeId) {
      setSelectedEmployeeId(defaultEmployeeId);
    }
  }, [defaultEmployeeId]);

  // Selected Employee object
  const currentEmployee = useMemo(() => {
    return balances.find((b) => b.employeeId === selectedEmployeeId);
  }, [balances, selectedEmployeeId]);

  // Selected Policy object
  const currentPolicy = useMemo(() => {
    return activePolicies.find((p) => p.id === selectedPolicyId) || activePolicies[0];
  }, [activePolicies, selectedPolicyId]);

  // Available balance for this specific employee & policy
  const policyBalance = useMemo(() => {
    if (!currentEmployee || !currentPolicy) return 10;
    const item = currentEmployee.balances.find((p) => p.policyId === currentPolicy.id);
    return item ? item.available : 10;
  }, [currentEmployee, currentPolicy]);

  // Calculated business days
  const businessDays = useMemo(() => {
    if (isHalfDay) return 0.5;
    return leaveService.calculateBusinessDays(startDate, endDate);
  }, [startDate, endDate, isHalfDay]);

  const remainingBalanceAfter = Math.max(0, policyBalance - businessDays);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!reason.trim()) {
      setErrorMsg('Please specify the reason for this time-off request.');
      return;
    }

    if (businessDays <= 0) {
      setErrorMsg('Invalid date range. Start date must be before or equal to end date.');
      return;
    }

    if (currentPolicy?.type === 'paid' && businessDays > policyBalance) {
      setErrorMsg(
        `Requested duration (${businessDays} days) exceeds available ${currentPolicy.name} balance (${policyBalance} days).`
      );
      return;
    }

    try {
      await onSubmit({
        employeeId: selectedEmployeeId,
        policyId: selectedPolicyId,
        startDate,
        endDate: isHalfDay ? startDate : endDate,
        isHalfDay,
        halfDaySession: isHalfDay ? halfDaySession : undefined,
        reason: reason.trim(),
        attachmentName: attachmentName ? attachmentName.trim() : undefined,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit leave request');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Leave / Time-Off"
      description="Submit a new time-off application with policy validation and entitlement checks."
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {errorMsg && (
          <div className="alert alert-error" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-3)' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Employee Selector */}
        <div className="input-group">
          <label className="input-label" htmlFor="apply-employee">
            Employee <span className="input-required">*</span>
          </label>
          <Select
            id="apply-employee"
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            options={balances.map((b) => ({
              value: b.employeeId,
              label: `${b.employeeName} (${b.department} - ${b.designation})`,
            }))}
            disabled={Boolean(defaultEmployeeId)}
          />
        </div>

        {/* Leave Policy Selector with live balance badge */}
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label" htmlFor="apply-policy">
              Time-Off Policy <span className="input-required">*</span>
            </label>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-light)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              Available: {policyBalance} Days
            </span>
          </div>
          <Select
            id="apply-policy"
            value={selectedPolicyId}
            onChange={(e) => setSelectedPolicyId(e.target.value)}
            options={activePolicies.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.code}) — ${p.type === 'paid' ? 'Paid' : 'Unpaid'}`,
            }))}
          />
        </div>

        {/* Half Day Toggle */}
        {currentPolicy?.allowHalfDay && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Half-Day Request
              </span>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                0.5 day deduction for partial day off
              </p>
            </div>
            <input
              type="checkbox"
              checked={isHalfDay}
              onChange={(e) => setIsHalfDay(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              aria-label="Half-day leave toggle"
            />
          </div>
        )}

        {/* Half Day Session Selector */}
        {isHalfDay && (
          <div className="input-group">
            <label className="input-label" htmlFor="apply-half-session">
              Session
            </label>
            <Select
              id="apply-half-session"
              value={halfDaySession}
              onChange={(e) => setHalfDaySession(e.target.value as 'morning' | 'afternoon')}
              options={[
                { value: 'morning', label: 'Morning Session (09:00 AM – 01:30 PM)' },
                { value: 'afternoon', label: 'Afternoon Session (01:30 PM – 06:00 PM)' },
              ]}
            />
          </div>
        )}

        {/* Date Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: isHalfDay ? '1fr' : '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="apply-start-date">
              {isHalfDay ? 'Leave Date' : 'Start Date'} <span className="input-required">*</span>
            </label>
            <Input
              id="apply-start-date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (isHalfDay || e.target.value > endDate) {
                  setEndDate(e.target.value);
                }
              }}
              required
            />
          </div>

          {!isHalfDay && (
            <div className="input-group">
              <label className="input-label" htmlFor="apply-end-date">
                End Date <span className="input-required">*</span>
              </label>
              <Input
                id="apply-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
              />
            </div>
          )}
        </div>

        {/* Calculation & Entitlement Impact Callout */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--text-xs)',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Working Days:</span>{' '}
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
              {businessDays} day{businessDays === 1 ? '' : 's'}
            </strong>{' '}
            <span style={{ color: 'var(--color-text-muted)' }}>(weekends excluded)</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Projected Balance:</span>{' '}
            <strong
              style={{
                fontSize: 'var(--text-sm)',
                color: remainingBalanceAfter < 0 ? 'var(--color-error-text)' : 'var(--color-primary)',
              }}
            >
              {remainingBalanceAfter} days
            </strong>
          </div>
        </div>

        {/* Reason */}
        <div className="input-group">
          <label className="input-label" htmlFor="apply-reason">
            Reason for Leave <span className="input-required">*</span>
          </label>
          <Textarea
            id="apply-reason"
            rows={3}
            placeholder="Briefly explain the reason for this time off..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        {/* Optional Document Upload / File Simulation */}
        <div className="input-group">
          <label className="input-label" htmlFor="apply-attachment">
            Supporting Document / Certificate (Optional)
          </label>
          <Input
            id="apply-attachment"
            type="text"
            placeholder="e.g. medical_certificate.pdf, travel_itinerary.pdf"
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
          />
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border-default)',
          }}
        >
          <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
