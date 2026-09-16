import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ROUTE_PATHS } from './routePaths';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: 'var(--space-12) var(--space-4)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-bg-subtle)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-4)',
          border: '1px solid var(--color-border-default)',
        }}
        aria-hidden="true"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      </div>

      <div style={{ marginBottom: 'var(--space-2)' }}>
        <Badge variant="neutral">404 Error</Badge>
      </div>

      <h1
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: 'var(--tracking-tight)',
          marginBottom: 'var(--space-2)',
        }}
      >
        Page Not Found
      </h1>

      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          maxWidth: '28rem',
          lineHeight: 'var(--leading-relaxed)',
          marginBottom: 'var(--space-6)',
        }}
      >
        The page you requested does not exist, may have been relocated, or is temporarily unavailable in the Client Admin portal.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>

        <Button variant="primary" onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}>
          Return to Dashboard
        </Button>
      </div>

      {/* Quick Navigation Alternatives */}
      <div
        style={{
          borderTop: '1px solid var(--color-border-default)',
          paddingTop: 'var(--space-4)',
          maxWidth: '28rem',
          width: '100%',
        }}
      >
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>
          Quick Navigation:
        </span>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <Link to={ROUTE_PATHS.DASHBOARD} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', textDecoration: 'none' }}>
            Dashboard
          </Link>
          <Link to={ROUTE_PATHS.EMPLOYEES} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', textDecoration: 'none' }}>
            Employees
          </Link>
          <Link to={ROUTE_PATHS.ATTENDANCE} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', textDecoration: 'none' }}>
            Attendance
          </Link>
          <Link to={ROUTE_PATHS.LEAVE} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', textDecoration: 'none' }}>
            Leave
          </Link>
        </div>
      </div>
    </div>
  );
}
