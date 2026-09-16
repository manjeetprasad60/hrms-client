import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

export type ErrorStateVariant =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'server'
  | 'validation'
  | 'generic';

export interface ErrorStateProps {
  readonly variant?: ErrorStateVariant;
  readonly title?: string;
  readonly message?: string;
  readonly error?: Error | string;
  readonly onRetry?: () => void;
  readonly onSignIn?: () => void;
  readonly onGoHome?: () => void;
  readonly action?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

interface VariantConfig {
  readonly title: string;
  readonly message: string;
  readonly badge: string;
  readonly icon: React.ReactNode;
}

const VARIANT_CONFIGS: Record<ErrorStateVariant, VariantConfig> = {
  network: {
    title: 'Connection Lost',
    message: 'Unable to reach the server. Please check your internet connection or corporate VPN and try again.',
    badge: 'Network Error',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    ),
  },
  unauthorized: {
    title: 'Session Expired',
    message: 'Your authentication session is invalid or has expired. Please sign in again to access this workspace.',
    badge: '401 Unauthorized',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 2l-2 2m-2-2l2 2" />
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  forbidden: {
    title: 'Access Restricted',
    message: 'Your organizational role does not have permission to view or manage this operational area.',
    badge: '403 Forbidden',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
  },
  server: {
    title: 'Service Temporarily Unavailable',
    message: 'Our backend services encountered an unexpected condition. Please retry in a few moments.',
    badge: '500 Server Error',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
  },
  validation: {
    title: 'Invalid Request',
    message: 'The submitted request was incomplete or contained invalid parameters. Please verify your input and try again.',
    badge: '400 Bad Request',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  generic: {
    title: 'Unable to Load Data',
    message: 'An unexpected error occurred while processing your request. Please try again or contact your administrator.',
    badge: 'Error',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
};

/**
 * Enterprise error feedback component supporting specialized presets:
 * - network (connection lost)
 * - unauthorized (401 session expired)
 * - forbidden (403 permission denied)
 * - server (500 / Firebase service unavailable)
 * - validation (400 bad request)
 * - generic (unexpected error)
 */
export function ErrorState({
  variant = 'generic',
  title,
  message,
  error,
  onRetry,
  onSignIn,
  onGoHome,
  action,
  className,
  style,
}: ErrorStateProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const config = VARIANT_CONFIGS[variant];
  const resolvedTitle = title ?? config.title;
  const resolvedMessage = message ?? config.message;

  const errorString =
    error instanceof Error
      ? error.stack || error.message
      : typeof error === 'string'
        ? error
        : undefined;

  return (
    <div
      role="alert"
      className={cn('error-state-container', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-8) var(--space-4)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-error-border)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '36rem',
        margin: '0 auto',
        ...style,
      }}
    >
      {/* Semantic Icon */}
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-error-bg)',
          color: 'var(--color-error-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-3)',
        }}
        aria-hidden="true"
      >
        {config.icon}
      </div>

      <div style={{ marginBottom: 'var(--space-2)' }}>
        <Badge variant={variant === 'forbidden' ? 'warning' : 'danger'}>
          {config.badge}
        </Badge>
      </div>

      <h3
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {resolvedTitle}
      </h3>

      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--leading-relaxed)',
          marginBottom: 'var(--space-6)',
          maxWidth: '28rem',
        }}
      >
        {resolvedMessage}
      </p>

      {/* Recovery Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            Try Again
          </Button>
        )}
        {onSignIn && (
          <Button variant="primary" onClick={onSignIn}>
            Sign In Again
          </Button>
        )}
        {onGoHome && (
          <Button variant="secondary" onClick={onGoHome}>
            Return to Dashboard
          </Button>
        )}
        {action}
        {errorString && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTechnicalDetails((prev) => !prev)}
          >
            {showTechnicalDetails ? 'Hide Technical Details' : 'View Details'}
          </Button>
        )}
      </div>

      {/* Technical Diagnostics Accordion */}
      {showTechnicalDetails && errorString && (
        <pre
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-error-text)',
            textAlign: 'left',
            maxWidth: '100%',
            overflowX: 'auto',
            border: '1px solid var(--color-border-default)',
            fontFamily: 'monospace',
          }}
        >
          {errorString}
        </pre>
      )}
    </div>
  );
}
