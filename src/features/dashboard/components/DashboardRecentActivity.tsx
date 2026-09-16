import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { PermissionButton } from '../../../components/ui/PermissionButton';
import { PERMISSIONS } from '../../../permissions/permissions';
import { useToast } from '../../../components/feedback/ToastContext';

export function DashboardRecentActivity() {
  const toast = useToast();

  const handleViewAuditLog = () => {
    toast.info('Audit trail logs will stream in real time once operational events occur.', 'Audit Trail');
  };

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader>
        <div>
          <h2 className="text-section-title">Recent Organization Activity</h2>
          <p className="text-small" style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>
            Audit trail of workforce operations, policy updates, and security logs
          </p>
        </div>
        <Badge variant="neutral">Feed Ready</Badge>
      </CardHeader>

      <CardBody style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <EmptyState
          preset="no-notifications"
          title="No activity recorded"
          description="Operational events, team onboarding milestones, and administrative updates will appear here once actions begin."
          action={
            <PermissionButton
              permission={PERMISSIONS.REPORTS_VIEW}
              variant="secondary"
              size="sm"
              onClick={handleViewAuditLog}
            >
              View Full Audit Trail
            </PermissionButton>
          }
          style={{
            margin: 'auto 0',
            border: 'none',
            padding: 'var(--space-8) var(--space-4)',
          }}
        />

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
                backgroundColor: 'var(--color-primary)',
                display: 'inline-block',
              }}
              aria-hidden="true"
            />
            <span>Audit Stream: Connected</span>
          </div>
          <span>Storage: Ready</span>
        </div>
      </CardBody>
    </Card>
  );
}
