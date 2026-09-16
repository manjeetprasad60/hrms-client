import { Card, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { PERMISSIONS } from '../../../permissions/permissions';
import type { DashboardStatCard } from '../types';

const KPI_METRICS: readonly DashboardStatCard[] = [
  {
    id: 'kpi-workforce',
    title: 'Active Employees',
    value: '—',
    statusLabel: 'Pending Sync',
    statusVariant: 'neutral',
    subtitle: 'Workforce directory foundation ready for database sync',
    permission: PERMISSIONS.EMPLOYEES_VIEW,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'kpi-attendance',
    title: "Today's Attendance",
    value: '—',
    statusLabel: 'Pending Sync',
    statusVariant: 'neutral',
    subtitle: 'Real-time clock-in tracking ready for live feeds',
    permission: PERMISSIONS.ATTENDANCE_VIEW,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: 'kpi-leave',
    title: 'Pending Leave Requests',
    value: '—',
    statusLabel: 'Pending Sync',
    statusVariant: 'neutral',
    subtitle: 'Time-off approval workflow ready for processing',
    permission: PERMISSIONS.LEAVE_VIEW,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'kpi-payroll',
    title: 'Current Pay Period',
    value: '—',
    statusLabel: 'Pending Sync',
    statusVariant: 'neutral',
    subtitle: 'Payroll cycle automation awaiting setup in Phase 7',
    permission: PERMISSIONS.PAYROLL_VIEW,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export function DashboardKpis() {
  return (
    <div className="grid-cards" role="region" aria-label="Key Performance Indicators">
      {KPI_METRICS.map((kpi) => (
        <Card key={kpi.id} style={{ display: 'flex', flexDirection: 'column' }}>
          <CardBody style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {kpi.icon}
                </div>
                <p
                  className="text-label"
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontWeight: 'var(--weight-medium)',
                  }}
                >
                  {kpi.title}
                </p>
              </div>

              <Badge variant={kpi.statusVariant ?? 'neutral'}>
                {kpi.statusLabel}
              </Badge>
            </div>

            <div style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <span
                style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--color-text-primary)',
                  letterSpacing: 'var(--tracking-tight)',
                  lineHeight: 'var(--leading-none)',
                }}
              >
                {kpi.value}
              </span>
            </div>

            <p
              className="text-small"
              style={{
                color: 'var(--color-text-muted)',
                marginTop: 'auto',
                lineHeight: 'var(--leading-snug)',
              }}
            >
              {kpi.subtitle}
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
