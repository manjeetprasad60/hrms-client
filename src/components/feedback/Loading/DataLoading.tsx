import { Spinner } from '../../ui/Spinner';
import { Skeleton } from '../Skeleton';

export interface DataLoadingProps {
  /**
   * Presentation mode:
   * - 'skeleton': Content placeholder lines (default)
   * - 'spinner': Centered loading spinner with optional text
   */
  readonly mode?: 'skeleton' | 'spinner';
  readonly message?: string;
  readonly minHeight?: string | number;
  readonly lines?: number;
}

/**
 * Reusable content-level data loading indicator.
 * Suitable for cards, sections, widgets, and form panels.
 */
export function DataLoading({
  mode = 'skeleton',
  message = 'Loading data...',
  minHeight = '140px',
  lines = 3,
}: DataLoadingProps) {
  if (mode === 'spinner') {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight,
          gap: 'var(--space-3)',
          padding: 'var(--space-6)',
        }}
      >
        <Spinner size="md" />
        {message && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {message}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        minHeight,
        justifyContent: 'center',
      }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="16px"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}
