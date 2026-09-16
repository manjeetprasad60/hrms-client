import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ROUTE_PATHS } from '../../routes/routePaths';

export interface PermissionDeniedProps {
  readonly requiredPermission?: string;
  readonly requiredRole?: string;
  readonly currentRole?: string;
  readonly title?: string;
  readonly message?: string;
  readonly onReturnToDashboard?: () => void;
  readonly onGoBack?: () => void;
  readonly action?: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly className?: string;
}

/**
 * Reusable 403 Forbidden / Access Restricted component.
 * Can be rendered on pages, inside card panels, tab views, or modal dialogs.
 */
export function PermissionDenied({
  requiredPermission,
  requiredRole,
  currentRole,
  title = 'Access Restricted',
  message = 'Your current organizational role does not have permission to view or manage this operational area.',
  onReturnToDashboard,
  onGoBack,
  action,
  style,
  className,
}: PermissionDeniedProps) {
  const navigate = useNavigate();
  const handleDashboard = onReturnToDashboard ?? (() => navigate(ROUTE_PATHS.DASHBOARD));
  const handleGoBack = onGoBack ?? (() => navigate(-1));

  return (
    <div
      role="alert"
      className={className}
      style={{
        padding: 'var(--space-12) var(--space-6)',
        textAlign: 'center',
        maxWidth: '36rem',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style,
      }}
    >
      {/* Shield Lock Icon */}
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-warning-bg)',
          color: 'var(--color-warning-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
        }}
        aria-hidden="true"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <div style={{ marginBottom: 'var(--space-2)' }}>
        <Badge variant="warning">403 Access Restricted</Badge>
      </div>

      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
        {title}
      </h2>

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)', maxWidth: '28rem' }}>
        {message}
      </p>

      {/* Diagnostic permission box */}
      {(requiredPermission || requiredRole || currentRole) && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-6)',
            border: '1px solid var(--color-border-default)',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          {requiredPermission && (
            <div>
              <strong style={{ color: 'var(--color-text-primary)' }}>Required Permission:</strong>{' '}
              <code>{requiredPermission}</code>
            </div>
          )}
          {requiredRole && (
            <div>
              <strong style={{ color: 'var(--color-text-primary)' }}>Required Role:</strong> {requiredRole}
            </div>
          )}
          {currentRole && (
            <div>
              <strong style={{ color: 'var(--color-text-primary)' }}>Your Role:</strong> {currentRole}
            </div>
          )}
        </div>
      )}

      {/* Administrative Remediation Note */}
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)', maxWidth: '28rem', lineHeight: 1.5 }}>
        If you require access to this operational area, please contact your Organization Administrator to request the appropriate role or permission assignment.
      </p>

      {/* Action CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
        {action}
        <Button variant="outline" onClick={handleGoBack}>
          Go Back
        </Button>
        <Button variant="primary" onClick={handleDashboard}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
