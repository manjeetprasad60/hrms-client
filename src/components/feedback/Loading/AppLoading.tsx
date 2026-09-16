import { Spinner } from '../../ui/Spinner';

export interface AppLoadingProps {
  readonly message?: string;
  readonly submessage?: string;
}

/**
 * Full-screen application loading state.
 * Rendered during initial application boot, authentication resolution, or tenant switching.
 */
export function AppLoading({
  message = 'Loading Workspace',
  submessage = 'Preparing your organizational data...',
}: AppLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-app)',
        padding: 'var(--space-6)',
        textAlign: 'center',
      }}
    >
      {/* Brand Icon with subtle animation */}
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 'var(--text-xl)',
          boxShadow: 'var(--elevation-2)',
          marginBottom: 'var(--space-6)',
        }}
        aria-hidden="true"
      >
        C
      </div>

      <Spinner size="lg" style={{ marginBottom: 'var(--space-4)' }} />

      <h2
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-1)',
        }}
      >
        {message}
      </h2>

      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          maxWidth: '24rem',
        }}
      >
        {submessage}
      </p>
    </div>
  );
}
