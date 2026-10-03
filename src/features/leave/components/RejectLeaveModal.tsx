import { useState } from 'react';
import type { LeaveRequest } from '../types';
import { Modal, Button, Textarea } from '../../../components/ui';

interface RejectLeaveModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly request: LeaveRequest | null;
  readonly onConfirm: (id: string, note: string) => Promise<void>;
  readonly isSubmitting?: boolean;
}

export function RejectLeaveModal({
  isOpen,
  onClose,
  request,
  onConfirm,
  isSubmitting = false,
}: RejectLeaveModalProps) {
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;

    if (!note.trim()) {
      setErrorMsg('Please specify a rejection reason for the employee.');
      return;
    }

    try {
      await onConfirm(request.id, note.trim());
      onClose();
      setNote('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Rejection failed');
    }
  };

  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Decline Leave Request"
      description="Specify the reason for declining this employee time-off application."
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {errorMsg && (
          <div className="alert alert-error" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-3)' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Request Summary Card */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-default)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                {request.employeeName}
              </strong>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {request.department} • {request.leaveTypeName}
              </p>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {request.durationDays} day{request.durationDays === 1 ? '' : 's'}
            </span>
          </div>

          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '0.4rem' }}>
            📅 Dates: {request.startDate} → {request.endDate}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>
            Reason: &ldquo;{request.reason}&rdquo;
          </div>
        </div>

        {/* Rejection Note */}
        <div className="input-group">
          <label className="input-label" htmlFor="reject-note">
            Rejection Feedback to Employee <span className="input-required">*</span>
          </label>
          <Textarea
            id="reject-note"
            rows={3}
            placeholder="e.g. Critical sprint milestone deadline; please coordinate with team lead or reschedule after next Tuesday..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
        </div>

        {/* Footer */}
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
          <Button variant="danger" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Declining...' : 'Confirm Rejection'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
