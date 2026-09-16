import React, { Component, type ReactNode } from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ROUTE_PATHS } from '../../routes/routePaths';

export interface ErrorBoundaryProps {
  readonly children: React.ReactNode;
  readonly fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode);
  readonly onReset?: () => void;
  readonly onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Application-Level & Component-Level Error Boundary
 *
 * Catches JavaScript rendering errors anywhere in child component tree.
 * Prevents white screen of death and presents a calm recovery experience.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // In production, send error to error reporting service (e.g., Sentry / Cloud Logging)
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({
          error: this.state.error,
          reset: this.handleReset,
        });
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorStack = this.state.error.stack || this.state.error.message;

      return (
        <div
          role="alert"
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-8) var(--space-4)',
            textAlign: 'center',
            maxWidth: '38rem',
            margin: '0 auto',
          }}
        >
          {/* Error Alert Icon */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-4)',
            }}
            aria-hidden="true"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <div style={{ marginBottom: 'var(--space-2)' }}>
            <Badge variant="danger">Application Error</Badge>
          </div>

          <h2
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Something went wrong
          </h2>

          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 'var(--space-6)',
              maxWidth: '30rem',
            }}
          >
            An unexpected error occurred while rendering this view. Your saved organizational records remain secure.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Reload Application
            </Button>
            <Button variant="secondary" onClick={this.handleReset}>
              Try Recovering
            </Button>
          </div>

          {/* Diagnostic stack trace for troubleshooting */}
          <details
            style={{
              marginTop: 'var(--space-6)',
              width: '100%',
              textAlign: 'left',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            <summary style={{ cursor: 'pointer', marginBottom: 'var(--space-2)' }}>
              View Technical Diagnostic Information
            </summary>
            <pre
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                overflowX: 'auto',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-error-text)',
                fontFamily: 'monospace',
                maxHeight: '200px',
              }}
            >
              {errorStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * React Router Route-level error element.
 * Catches route loader, action, or component errors without crashing the AppShell.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = 'An unexpected routing error occurred.';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div
      role="alert"
      style={{
        padding: 'var(--space-12) var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        maxWidth: '36rem',
        margin: '0 auto',
      }}
    >
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
          marginBottom: 'var(--space-4)',
        }}
        aria-hidden="true"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div style={{ marginBottom: 'var(--space-2)' }}>
        <Badge variant="danger">{errorStatus} Page Error</Badge>
      </div>

      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
        Unable to display this page
      </h2>

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)', maxWidth: '28rem' }}>
        {errorMessage}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
        <Button variant="primary" onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
