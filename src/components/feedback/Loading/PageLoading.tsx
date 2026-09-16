import { Skeleton } from '../Skeleton';

export interface PageLoadingProps {
  /**
   * Whether to include top metric card skeletons
   * Default: true
   */
  readonly showMetrics?: boolean;
}

/**
 * Full page loading skeleton matching the layout of PageContainer.
 * Prevents jarring layout shifts when navigating between module pages.
 */
export function PageLoading({ showMetrics = true }: PageLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-6)',
      }}
    >
      {/* Breadcrumb Skeleton */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <Skeleton width="60px" height="14px" />
        <span style={{ color: 'var(--color-border-default)' }}>/</span>
        <Skeleton width="100px" height="14px" />
      </div>

      {/* Header Skeleton */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '320px' }}>
          <Skeleton width="220px" height="32px" />
          <Skeleton width="300px" height="16px" />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Skeleton width="100px" height="38px" variant="rectangular" />
          <Skeleton width="120px" height="38px" variant="rectangular" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      {showMetrics && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <Skeleton width="120px" height="14px" />
              <Skeleton width="80px" height="28px" />
              <Skeleton width="140px" height="12px" />
            </div>
          ))}
        </div>
      )}

      {/* Main Content Area Skeleton */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width="180px" height="20px" />
          <Skeleton width="140px" height="32px" variant="rectangular" />
        </div>
        <Skeleton height="180px" variant="rectangular" />
      </div>
    </div>
  );
}
