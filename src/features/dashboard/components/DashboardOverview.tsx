import { PageContainer } from '../../../layouts/PageContainer';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { DashboardWelcomeHeader } from './DashboardWelcomeHeader';
import { DashboardKpis } from './DashboardKpis';
import { DashboardQuickActions } from './DashboardQuickActions';
import { DashboardPendingActions } from './DashboardPendingActions';
import { DashboardRecentActivity } from './DashboardRecentActivity';

export function DashboardOverview() {
  return (
    <PageContainer
      title="Client Operations Hub"
      description="Central administrative dashboard for managing organization workforce, attendance, approvals, and HR operations."
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Section 1: Welcome & Tenant Context */}
        <DashboardWelcomeHeader />

        {/* Section 2: Operational KPI Metrics (Strict Zero-Fake-Data) */}
        <section aria-labelledby="section-kpis-title">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <div>
              <h2 id="section-kpis-title" className="text-section-title">
                Operational Overview
              </h2>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                Real-time telemetry indicators awaiting live database synchronization
              </p>
            </div>
            <Badge variant="neutral">Live Telemetry Pending</Badge>
          </div>
          <DashboardKpis />
        </section>

        {/* Section 3: Permission-Guarded Quick Actions */}
        <DashboardQuickActions />

        {/* Section 4: Dual Operations Split (Pending Approvals & Recent Activity) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          <DashboardPendingActions />
          <DashboardRecentActivity />
        </div>

        {/* Section 5: Integration & Architecture Readiness Status */}
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-section-title">Platform Architecture Readiness</h2>
              <p className="text-small" style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>
                Decoupled foundation ready for Firebase service bindings and module data wiring
              </p>
            </div>
            <Badge variant="success">Architecture Ready</Badge>
          </CardHeader>
          <CardBody>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <span className="text-subheading">Authentication</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="text-small" style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                  Tenant session initialized via <code>AuthService</code> boundary. Zero insecure token storage.
                </p>
              </div>

              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <span className="text-subheading">Realtime Database</span>
                  <Badge variant="neutral">Prepared</Badge>
                </div>
                <p className="text-small" style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                  Service boundary in <code>databaseService</code> ready to bind reactive listeners to live nodes.
                </p>
              </div>

              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <span className="text-subheading">RBAC Permissions</span>
                  <Badge variant="primary">Enforced</Badge>
                </div>
                <p className="text-small" style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                  Granular action evaluation (e.g. <code>employees.create</code>) applied to all interactive controls.
                </p>
              </div>

              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <span className="text-subheading">Cloud Storage</span>
                  <Badge variant="neutral">Configured</Badge>
                </div>
                <p className="text-small" style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                  Document and avatar upload pipeline abstracted through <code>storageService</code>.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}
