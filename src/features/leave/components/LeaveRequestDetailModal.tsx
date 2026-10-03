import type { LeaveRequest } from '../types';
import { Modal, Button, Badge } from '../../../components/ui';

interface LeaveRequestDetailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly request: LeaveRequest | null;
  readonly onApprove?: (id: string) => void;
  readonly onReject?: (request: LeaveRequest) => void;
}

export function LeaveRequestDetailModal({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}: LeaveRequestDetailModalProps) {
  if (!request) return null;

  const isPending = request.status === 'pending';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Leave Request Audit Details"
      description={`Reference ID: ${request.id}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Status Header Strip */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: request.color,
                display: 'inline-block',
              }}
            />
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
              {request.leaveTypeName} ({request.leaveTypeCode})
            </strong>
          </div>

          <Badge
            variant={
              request.status === 'approved'
                ? 'success'
                : request.status === 'rejected'
                ? 'danger'
                : 'warning'
            }
          >
            {request.status.toUpperCase()}
          </Badge>
        </div>

        {/* Employee Information */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#e0e7ff',
              color: '#4338ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 'var(--text-base)',
              flexShrink: 0,
            }}
          >
            {request.employeeName
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {request.employeeName}
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {request.employeeEmail} • {request.designation} ({request.department})
            </p>
          </div>
        </div>

        {/* Schedule & Duration Breakdown */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-3)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Date Window:</span>
            <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginTop: '2px' }}>
              {request.startDate} → {request.endDate}
            </p>
          </div>

          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Duration:</span>
            <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginTop: '2px' }}>
              {request.durationDays} Business Day{request.durationDays === 1 ? '' : 's'}
              {request.isHalfDay ? ` (${request.halfDaySession || 'Half-Day'})` : ' (Full-Day)'}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div className="card" style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-surface)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Employee Reason / Purpose:
          </span>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
            {request.reason}
          </p>

          {request.attachmentName && (
            <div
              style={{
                marginTop: 'var(--space-3)',
                paddingTop: 'var(--space-2)',
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-info-text)',
              }}
            >
              <span>📎 Supporting Attachment:</span>
              <strong>{request.attachmentName}</strong>
            </div>
          )}
        </div>

        {/* Entitlement & Balance Impact */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--text-xs)',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Balance Before:</span>{' '}
            <strong>{request.currentAvailableBalance} days</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Deduction:</span>{' '}
            <strong style={{ color: 'var(--color-error-text)' }}>-{request.durationDays} days</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Remaining After:</span>{' '}
            <strong style={{ color: 'var(--color-primary)' }}>{request.balanceAfterApproval} days</strong>
          </div>
        </div>

        {/* Conflict Warning if any */}
        {typeof request.overlappingTeammatesCount === 'number' && request.overlappingTeammatesCount > 0 && (
          <div className="alert alert-warning" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-3)' }}>
            ⚠️ <strong>Department Schedule Conflict:</strong> {request.overlappingTeammatesCount} colleague(s) in{' '}
            {request.department} have overlapping approved/pending leaves during this date window. Ensure project coverage is maintained.
          </div>
        )}

        {/* Review Audit Trail if resolved */}
        {request.reviewedBy && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Reviewed By: <strong>{request.reviewedBy}</strong></span>
              <span>{request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString() : ''}</span>
            </div>
            {request.reviewNote && (
              <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                &ldquo;{request.reviewNote}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border-default)',
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          {isPending && onReject && (
            <Button
              variant="danger"
              onClick={() => {
                onClose();
                onReject(request);
              }}
            >
              Reject
            </Button>
          )}

          {isPending && onApprove && (
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                onApprove(request.id);
              }}
            >
              Approve Leave
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
