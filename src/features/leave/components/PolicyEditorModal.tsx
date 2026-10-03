import { useState, useEffect } from 'react';
import type { LeavePolicy, AccrualFrequency, PolicyType } from '../types';
import { Modal, Button, Input, Select, Textarea } from '../../../components/ui';

interface PolicyEditorModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly policy: LeavePolicy | null; // null for creating new policy
  readonly onSubmit: (policy: Partial<LeavePolicy>) => Promise<void>;
  readonly isSubmitting?: boolean;
}

const COLOR_PRESETS = [
  '#0f766e', // Teal
  '#2563eb', // Blue
  '#dc2626', // Red
  '#9333ea', // Purple
  '#d97706', // Amber
  '#059669', // Emerald
  '#475569', // Slate
  '#db2777', // Pink
];

export function PolicyEditorModal({
  isOpen,
  onClose,
  policy,
  onSubmit,
  isSubmitting = false,
}: PolicyEditorModalProps) {
  const isEditing = Boolean(policy?.id);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PolicyType>('paid');
  const [annualAllowanceDays, setAnnualAllowanceDays] = useState(12);
  const [accrualFrequency, setAccrualFrequency] = useState<AccrualFrequency>('annual_lump_sum');
  const [maxCarryForwardDays, setMaxCarryForwardDays] = useState(0);
  const [allowHalfDay, setAllowHalfDay] = useState(true);
  const [requiresAttachment, setRequiresAttachment] = useState(false);
  const [attachmentThresholdDays, setAttachmentThresholdDays] = useState(2);
  const [minNoticeDays, setMinNoticeDays] = useState(1);
  const [autoApprove, setAutoApprove] = useState(false);
  const [color, setColor] = useState('#0f766e');
  const [departmentsStr, setDepartmentsStr] = useState('All');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (policy) {
      setName(policy.name);
      setCode(policy.code);
      setDescription(policy.description);
      setType(policy.type);
      setAnnualAllowanceDays(policy.annualAllowanceDays);
      setAccrualFrequency(policy.accrualFrequency);
      setMaxCarryForwardDays(policy.maxCarryForwardDays);
      setAllowHalfDay(policy.allowHalfDay);
      setRequiresAttachment(policy.requiresAttachment);
      setAttachmentThresholdDays(policy.attachmentThresholdDays);
      setMinNoticeDays(policy.minNoticeDays);
      setAutoApprove(policy.autoApprove);
      setColor(policy.color);
      setDepartmentsStr(policy.applicableDepartments.join(', '));
    } else {
      // Defaults for new policy
      setName('');
      setCode('');
      setDescription('');
      setType('paid');
      setAnnualAllowanceDays(12);
      setAccrualFrequency('monthly');
      setMaxCarryForwardDays(5);
      setAllowHalfDay(true);
      setRequiresAttachment(false);
      setAttachmentThresholdDays(2);
      setMinNoticeDays(2);
      setAutoApprove(false);
      setColor('#0f766e');
      setDepartmentsStr('All');
    }
  }, [policy, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Policy name is required.');
      return;
    }

    if (!code.trim()) {
      setErrorMsg('Short policy code is required (e.g. VAC, SL).');
      return;
    }

    const applicable = departmentsStr
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    try {
      await onSubmit({
        id: policy?.id,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        type,
        annualAllowanceDays: Number(annualAllowanceDays),
        accrualFrequency,
        maxCarryForwardDays: Number(maxCarryForwardDays),
        allowHalfDay,
        requiresAttachment,
        attachmentThresholdDays: Number(attachmentThresholdDays),
        minNoticeDays: Number(minNoticeDays),
        autoApprove,
        color,
        applicableDepartments: applicable.length > 0 ? applicable : ['All'],
        isActive: policy?.isActive ?? true,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save policy');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Policy: ${policy?.name}` : 'Create Time-Off Policy'}
      description="Configure entitlement rules, accrual schedule, carryover ceilings, and verification criteria."
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {errorMsg && (
          <div className="alert alert-error" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-3)' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Name and Code */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-3)' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="policy-name">
              Policy Name <span className="input-required">*</span>
            </label>
            <Input
              id="policy-name"
              placeholder="e.g. Floating Holiday, Annual Vacation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="policy-code">
              Code (2-4 chars) <span className="input-required">*</span>
            </label>
            <Input
              id="policy-code"
              placeholder="e.g. VAC"
              maxLength={5}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="input-group">
          <label className="input-label" htmlFor="policy-desc">
            Policy Description
          </label>
          <Textarea
            id="policy-desc"
            rows={2}
            placeholder="Explain eligibility, purpose, and company guidelines for this time off..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Paid / Unpaid & Annual Allowance */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="policy-type">
              Compensation Type
            </label>
            <Select
              id="policy-type"
              value={type}
              onChange={(e) => setType(e.target.value as PolicyType)}
              options={[
                { value: 'paid', label: 'Paid Leave (Standard)' },
                { value: 'unpaid', label: 'Unpaid / Loss of Pay (LOP)' },
              ]}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="policy-allowance">
              Annual Allowance (Days) <span className="input-required">*</span>
            </label>
            <Input
              id="policy-allowance"
              type="number"
              min="0"
              max="365"
              step="1"
              value={annualAllowanceDays}
              onChange={(e) => setAnnualAllowanceDays(parseInt(e.target.value, 10) || 0)}
              required
            />
          </div>
        </div>

        {/* Accrual Frequency & Carry Forward */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="policy-accrual">
              Accrual Frequency
            </label>
            <Select
              id="policy-accrual"
              value={accrualFrequency}
              onChange={(e) => setAccrualFrequency(e.target.value as AccrualFrequency)}
              options={[
                { value: 'annual_lump_sum', label: 'Annual Lump Sum (Credit on Jan 1)' },
                { value: 'monthly', label: 'Monthly Accrual (1/12th per month)' },
                { value: 'quarterly', label: 'Quarterly Accrual (1/4th per quarter)' },
              ]}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="policy-carryover">
              Max Carry-Forward (Days)
            </label>
            <Input
              id="policy-carryover"
              type="number"
              min="0"
              max="60"
              value={maxCarryForwardDays}
              onChange={(e) => setMaxCarryForwardDays(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>

        {/* Notice Days & Applicable Departments */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="policy-notice">
              Min. Advance Notice (Days)
            </label>
            <Input
              id="policy-notice"
              type="number"
              min="0"
              max="90"
              value={minNoticeDays}
              onChange={(e) => setMinNoticeDays(parseInt(e.target.value, 10) || 0)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="policy-depts">
              Applicable Departments
            </label>
            <Input
              id="policy-depts"
              placeholder="e.g. All, Engineering, Sales"
              value={departmentsStr}
              onChange={(e) => setDepartmentsStr(e.target.value)}
            />
          </div>
        </div>

        {/* Policy Color Tag */}
        <div className="input-group">
          <label className="input-label">Badge &amp; Calendar Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: color === c ? '3px solid #0f172a' : '2px solid transparent',
                  cursor: 'pointer',
                  transform: color === c ? 'scale(1.15)' : 'none',
                  transition: 'transform var(--transition-fast)',
                }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Checkbox Options: Half-day, Auto-approve, Requires Attachment */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-default)',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={allowHalfDay}
              onChange={(e) => setAllowHalfDay(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
            />
            <span>Allow employees to take half-day off</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
            />
            <span>Auto-approve requests without manager workflow (e.g. Bereavement)</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={requiresAttachment}
              onChange={(e) => setRequiresAttachment(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
            />
            <span>Require supporting medical/official document verification</span>
          </label>

          {requiresAttachment && (
            <div style={{ marginLeft: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
              <span>Required if request exceeds:</span>
              <Input
                type="number"
                min="1"
                max="30"
                style={{ width: '70px', padding: '0.2rem 0.4rem' }}
                value={attachmentThresholdDays}
                onChange={(e) => setAttachmentThresholdDays(parseInt(e.target.value, 10) || 1)}
              />
              <span>consecutive days</span>
            </div>
          )}
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
            {isSubmitting ? 'Saving Policy...' : isEditing ? 'Update Policy' : 'Create Policy'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
