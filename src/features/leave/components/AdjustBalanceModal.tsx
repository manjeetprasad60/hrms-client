import { useState, useMemo, useEffect } from 'react';
import type { EmployeeLeaveBalance, BalanceAdjustmentPayload, BalanceAdjustmentReason } from '../types';
import { Modal, Button, Input, Select, Textarea } from '../../../components/ui';

interface AdjustBalanceModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly employee: EmployeeLeaveBalance | null;
  readonly onSubmit: (payload: BalanceAdjustmentPayload) => Promise<void>;
  readonly isSubmitting?: boolean;
}

export function AdjustBalanceModal({
  isOpen,
  onClose,
  employee,
  onSubmit,
  isSubmitting = false,
}: AdjustBalanceModalProps) {
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [adjustmentDays, setAdjustmentDays] = useState<number>(1);
  const [adjustmentType, setAdjustmentType] = useState<'credit' | 'debit'>('credit');
  const [reason, setReason] = useState<BalanceAdjustmentReason>('manual_correction');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Default to first policy of employee
  useEffect(() => {
    if (employee && employee.balances.length > 0) {
      setSelectedPolicyId(employee.balances[0]!.policyId);
    }
  }, [employee]);

  const currentPolicyBalance = useMemo(() => {
    if (!employee) return null;
    return employee.balances.find((p) => p.policyId === selectedPolicyId) || employee.balances[0] || null;
  }, [employee, selectedPolicyId]);

  const signedDays = adjustmentType === 'credit' ? Math.abs(adjustmentDays) : -Math.abs(adjustmentDays);
  const projectedBalance = currentPolicyBalance
    ? Math.max(0, currentPolicyBalance.available + signedDays)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!employee) return;
    if (!selectedPolicyId) {
      setErrorMsg('Please select a leave policy.');
      return;
    }

    if (adjustmentDays <= 0) {
      setErrorMsg('Adjustment days must be greater than zero.');
      return;
    }

    if (!note.trim()) {
      setErrorMsg('Please provide an audit note explaining this balance adjustment.');
      return;
    }

    try {
      await onSubmit({
        employeeId: employee.employeeId,
        policyId: selectedPolicyId,
        adjustmentDays: signedDays,
        reason,
        note: note.trim(),
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Adjustment failed');
    }
  };

  if (!employee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Leave Balance"
      description={`Manually credit or debit leave days for ${employee.employeeName}.`}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {errorMsg && (
          <div className="alert alert-error" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-3)' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Employee Summary Card */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
              {employee.employeeName}
            </strong>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {employee.department} • {employee.designation}
            </p>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Fiscal Year: {employee.fiscalYear}
          </span>
        </div>

        {/* Target Policy */}
        <div className="input-group">
          <label className="input-label" htmlFor="adjust-policy">
            Time-Off Policy <span className="input-required">*</span>
          </label>
          <Select
            id="adjust-policy"
            value={selectedPolicyId}
            onChange={(e) => setSelectedPolicyId(e.target.value)}
            options={employee.balances.map((p) => ({
              value: p.policyId,
              label: `${p.policyName} (${p.policyCode}) — Current: ${p.available} available`,
            }))}
          />
        </div>

        {/* Type: Credit or Debit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="adjust-action">
              Action <span className="input-required">*</span>
            </label>
            <Select
              id="adjust-action"
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as 'credit' | 'debit')}
              options={[
                { value: 'credit', label: '➕ Credit Days (Add)' },
                { value: 'debit', label: '➖ Debit Days (Deduct)' },
              ]}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="adjust-amount">
              Number of Days <span className="input-required">*</span>
            </label>
            <Input
              id="adjust-amount"
              type="number"
              step="0.5"
              min="0.5"
              max="60"
              value={adjustmentDays}
              onChange={(e) => setAdjustmentDays(parseFloat(e.target.value) || 0)}
              required
            />
          </div>
        </div>

        {/* Live Balance Change Preview */}
        {currentPolicyBalance && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: adjustmentType === 'credit' ? 'var(--color-success-bg)' : '#fffbeb',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${adjustmentType === 'credit' ? 'var(--color-success-border)' : '#fde68a'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 'var(--text-xs)',
            }}
          >
            <span>
              Current: <strong>{currentPolicyBalance.available} days</strong>
            </span>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
              {adjustmentType === 'credit' ? `+${adjustmentDays}` : `-${adjustmentDays}`} days
            </span>
            <span>
              Adjusted: <strong>{projectedBalance} days</strong>
            </span>
          </div>
        )}

        {/* Reason Code */}
        <div className="input-group">
          <label className="input-label" htmlFor="adjust-reason">
            Reason Category <span className="input-required">*</span>
          </label>
          <Select
            id="adjust-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as BalanceAdjustmentReason)}
            options={[
              { value: 'manual_correction', label: 'Administrative / System Correction' },
              { value: 'bonus_credit', label: 'Bonus / Compensatory Off (Comp-off)' },
              { value: 'carryover_adjustment', label: 'Annual Carryover Balance Rollover' },
              { value: 'probation_entitlement', label: 'Probation Completion Entitlement' },
              { value: 'loss_of_pay', label: 'Unauthorized Absence / Loss of Pay' },
              { value: 'other', label: 'Other Special Circumstance' },
            ]}
          />
        </div>

        {/* Audit Note */}
        <div className="input-group">
          <label className="input-label" htmlFor="adjust-note">
            Audit Documentation &amp; Note <span className="input-required">*</span>
          </label>
          <Textarea
            id="adjust-note"
            rows={3}
            placeholder="Document reference, approval ticket #, or reason for manual audit trail..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
        </div>

        {/* Modal Actions */}
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
            {isSubmitting ? 'Saving...' : 'Apply Balance Adjustment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
