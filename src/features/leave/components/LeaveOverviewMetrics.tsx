import type { LeaveKPIStats } from '../types';

interface LeaveOverviewMetricsProps {
  readonly stats: LeaveKPIStats;
  readonly onQuickFilter?: (tab: 'approvals' | 'calendar' | 'policies' | 'balances') => void;
}

export function LeaveOverviewMetrics({ stats, onQuickFilter }: LeaveOverviewMetricsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}
    >
      {/* 1. Pending Approvals */}
      <div
        className="card"
        style={{
          cursor: onQuickFilter ? 'pointer' : 'default',
          transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
          borderLeft: '4px solid #f59e0b',
        }}
        onClick={() => onQuickFilter?.('approvals')}
        role="button"
        tabIndex={0}
      >
        <div className="card-body" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wider)',
                }}
              >
                Pending Approvals
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginTop: '0.25rem' }}>
                <span
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 700,
                    color: stats.pendingApprovalsCount > 0 ? '#b45309' : 'var(--color-text-primary)',
                  }}
                >
                  {stats.pendingApprovalsCount}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  requests
                </span>
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fef3c7',
                color: '#b45309',
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
          <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {stats.urgentPendingCount > 0 ? (
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--color-error-text)',
                  backgroundColor: 'var(--color-error-bg)',
                  padding: '0.125rem 0.375rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                ⚠️ {stats.urgentPendingCount} overdue (&gt;48h)
              </span>
            ) : (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                All queues within SLA
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. On Leave Today */}
      <div
        className="card"
        style={{
          cursor: onQuickFilter ? 'pointer' : 'default',
          borderLeft: '4px solid var(--color-primary)',
        }}
        onClick={() => onQuickFilter?.('calendar')}
        role="button"
        tabIndex={0}
      >
        <div className="card-body" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wider)',
                }}
              >
                Out of Office Today
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginTop: '0.25rem' }}>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {stats.onLeaveTodayCount}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  employees
                </span>
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {stats.onLeaveThisWeekCount} scheduled this week
            </span>
          </div>
        </div>
      </div>

      {/* 3. Leave Consumption & Utilization */}
      <div
        className="card"
        style={{
          cursor: onQuickFilter ? 'pointer' : 'default',
          borderLeft: '4px solid #2563eb',
        }}
        onClick={() => onQuickFilter?.('balances')}
        role="button"
        tabIndex={0}
      >
        <div className="card-body" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wider)',
                }}
              >
                Quota Consumed
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginTop: '0.25rem' }}>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {stats.totalEntitlementConsumedPercentage}%
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  of annual total
                </span>
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <div
              style={{
                height: '6px',
                backgroundColor: 'var(--color-border-subtle)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, stats.totalEntitlementConsumedPercentage)}%`,
                  backgroundColor: '#2563eb',
                  borderRadius: 'var(--radius-full)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Time-Off Policies */}
      <div
        className="card"
        style={{
          cursor: onQuickFilter ? 'pointer' : 'default',
          borderLeft: '4px solid #8b5cf6',
        }}
        onClick={() => onQuickFilter?.('policies')}
        role="button"
        tabIndex={0}
      >
        <div className="card-body" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wider)',
                }}
              >
                Time-Off Policies
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginTop: '0.25rem' }}>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {stats.activePoliciesCount}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  active rules
                </span>
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Accrual, carry-over &amp; approvals
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
