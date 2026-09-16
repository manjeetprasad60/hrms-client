import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../routes/AuthContext';

export interface AccountNotConfiguredProps {
  readonly onSignOut?: () => void;
  readonly userEmail?: string;
  readonly title?: string;
  readonly message?: string;
  readonly badgeLabel?: string;
}

/**
 * Account Not Configured Feedback View
 *
 * Rendered when a Firebase-authenticated user has no authorized client organization relationship.
 * Prevents unauthorized access into the Client Admin portal and gives a clear exit path.
 */
export function AccountNotConfigured({
  onSignOut,
  userEmail,
  title = 'Account Not Configured',
  message,
  badgeLabel = 'No Tenant',
}: AccountNotConfiguredProps) {
  const { user, logout } = useAuth();
  const displayEmail = userEmail || user?.email || 'authenticated user';

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
      <div style={{ maxWidth: '520px', width: '100%' }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-warning-bg)',
                    color: 'var(--color-warning-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-hidden="true"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: 0 }}>
                  {title}
                </h1>
              </div>
              <Badge variant="warning">{badgeLabel}</Badge>
            </div>
          </CardHeader>

          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-normal)' }}>
                {message || (
                  <>
                    You have successfully signed in with <strong>{displayEmail}</strong>, but your account is not currently linked to any active client organization workspace.
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
                <strong>Next Steps:</strong> Contact your organization administrator or HR department to provision your membership in their client portal. Once invited, sign in again to access your workspace.
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSignOut}
                  style={{ flex: 1 }}
                >
                  Sign Out of Account
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
