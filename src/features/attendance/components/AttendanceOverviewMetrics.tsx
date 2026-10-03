import type { AttendanceKPIStats } from '../types';

interface AttendanceOverviewMetricsProps {
  readonly stats: AttendanceKPIStats;
  readonly onQuickFilter?: (filterType: string) => void;
}

export function AttendanceOverviewMetrics({ stats, onQuickFilter }: AttendanceOverviewMetricsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}
    >
      {/* 1. Present Today */}
      <div
        className="card"
        style={{
          cursor: onQuickFilter ? 'pointer' : 'default',
          transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
        }}
        onClick={() => onQuickFilter?.('present')}
      >
        <div className="card-body" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>
                Present Today
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginTop: '0.25rem' }}>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {stats.presentToday}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  / {stats.totalExpected} expected
                </span>
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--color-success-text)',
                backgroundColor: 'var(--color-success-bg)',
                padding: '0.125rem 0.375rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {stats.onTimePercentage}% on-time
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              attendance rate
            </span>
          </div>
        </div>
      </div>

      {/* 2. Late Arrivals */}
      <div
        className="card"
        style={{
          cursor: onQuickFilter ? 'pointer' : 'default',
        }}
        onClick={() => onQuickFilter?.('late')}
      >
        <div className="card-body" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>
                Late Arrivals
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginTop: '0.25rem' }}>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-warning-text)' }}>
                  {stats.lateArrivals}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  flagged today
                </span>
              </div>
            </div>
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
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Standard grace period: 15 mins
            </span>
          </div>
        </div>
      </div>

      {/* 3. Remote & Field Punches */}
      <div
        className="card"
        style={{
          cursor: onQuickFilter ? 'pointer' : 'default',
        }}
        onClick={() => onQuickFilter?.('remote')}
      >
        <div className="card-body" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>
                Remote & Field
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginTop: '0.25rem' }}>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {stats.remoteWorkers}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  active off-site
                </span>
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-info-bg)',
                color: 'var(--color-info-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              GPS & IP geofence verified
            </span>
          </div>
        </div>
      </div>

      {/* 4. Daily Hours & Performance */}
      <div className="card">
        <div className="card-body" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>
                Avg Daily Duration
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginTop: '0.25rem' }}>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {stats.avgWorkHoursPerDay}h
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  / employee
                </span>
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-subtle)',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Standard shift 8.0h threshold
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
