import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { PermissionButton } from '../../../components/ui/PermissionButton';
import { PERMISSIONS } from '../../../permissions/permissions';
import { useToast } from '../../../components/feedback/ToastContext';

export function DashboardPendingActions() {
  const toast = useToast();

  const handleViewQueue = () => {
    toast.info('Approval workflows will connect to live employee submissions.', 'Approval Queue');
  };

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader>
        <div>
          <h2 className="text-section-title">Pending Approvals</h2>
          <p className="text-small" style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>
            Workforce requests requiring managerial or administrative review
          </p>
        </div>
        <Badge variant="success">0 Pending</Badge>
      </CardHeader>

      <CardBody style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <EmptyState
            preset="no-records"
            title="No pending requests"
            description="All submitted employee leave applications, shift adjustments, and profile changes have been resolved."
            action={
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <PermissionButton
                  permission={PERMISSIONS.LEAVE_VIEW}
                  variant="secondary"
                  size="sm"
                  onClick={handleViewQueue}
                >
                  Open Approval Queue
                </PermissionButton>

                <PermissionButton
                  permission={PERMISSIONS.LEAVE_APPROVE}
                  variant="primary"
                  size="sm"
                  disableUnauthorized={true}
                  unauthorizedTooltip="Requires manager permission: leave.approve"
                  onClick={() => toast.success('Batch leave approval workflow triggered.', 'Approvals')}
                >
                  Approve Pending
                </PermissionButton>
              </div>
            }
            style={{
              border: 'none',
              padding: 'var(--space-6) var(--space-4)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-success-text)',
                display: 'inline-block',
              }}
              aria-hidden="true"
            />
            <span>Live Approval Listener: Ready</span>
          </div>
          <span>Sync Status: Idle</span>
        </div>
      </CardBody>
    </Card>
  );
}
