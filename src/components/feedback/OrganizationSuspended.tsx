import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../routes/AuthContext';
import type { EntityStatus } from '../../types/common';

export interface OrganizationSuspendedProps {
  readonly organizationName?: string;
  readonly status?: EntityStatus;
  readonly title?: string;
  readonly message?: string;
  readonly onSignOut?: () => void;
}

/**
 * Organization Suspended / Inactive View
 *
 * Rendered when a client company's subscription or status is suspended or inactive,
 * or when a user account has been suspended.
 * Enforces product authorization by completely blocking access to operational HR modules.
 */
export function OrganizationSuspended({
  organizationName,
  status = 'suspended',
  title,
  message,
  onSignOut,
}: OrganizationSuspendedProps) {
  const { logout } = useAuth();
  const companyName = organizationName || 'Your Organization';
  const isSuspended = status === 'suspended';

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      void logout();
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        backgroundColor: 'var(--color-bg-subtle)',
      }}
    >
      <div style={{ maxWidth: '540px', width: '100%' }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSuspended ? 'var(--color-error-bg)' : 'var(--color-warning-bg)',
                    color: isSuspended ? 'var(--color-error-text)' : 'var(--color-warning-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-hidden="true"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: 0 }}>
                  {title || (isSuspended ? 'Workspace Access Suspended' : 'Workspace Inactive')}
                </h1>
              </div>
              <Badge variant={isSuspended ? 'danger' : 'neutral'}>
                {isSuspended ? 'Suspended' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>

          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-normal)' }}>
                {message || (
                  <>
                    Operational access for <strong>{companyName}</strong> has been {isSuspended ? 'temporarily suspended' : 'marked as inactive'}.
                    All operational modules (Employees, Attendance, Leave, Payroll) are restricted in accordance with tenant authorization policies.
                  </>
                )}
              </p>

              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-default)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--leading-normal)',
                }}
              >
                <strong>Resolution:</strong> Please reach out to your company&apos;s billing administrator or the HRIS platform support team to review your account status and restore operational privileges.
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSignOut}
                  style={{ flex: 1 }}
                >
                  Sign Out of Portal
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
