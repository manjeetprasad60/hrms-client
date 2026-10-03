import type { LeavePolicy } from '../types';
import { Button, Badge, Switch } from '../../../components/ui';

interface TimeOffPoliciesListProps {
  readonly policies: readonly LeavePolicy[];
  readonly onToggleStatus: (policyId: string) => void;
  readonly onEditPolicy: (policy: LeavePolicy) => void;
  readonly onCreatePolicy: () => void;
}

export function TimeOffPoliciesList({
  policies,
  onToggleStatus,
  onEditPolicy,
  onCreatePolicy,
}: TimeOffPoliciesListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Policy Header & Controls */}
      <div
        className="card"
        style={{
          padding: 'var(--space-4) var(--space-5)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}
      >
        <div>
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Configured Time-Off Policies &amp; Entitlements
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
            Set annual quotas, accrual intervals, document verification rules, and carry-over limits.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={onCreatePolicy}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Time-Off Policy
        </Button>
      </div>

      {/* Grid of Policies */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {policies.map((pol) => {
          return (
            <div
              key={pol.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `4px solid ${pol.color}`,
                backgroundColor: 'var(--color-surface)',
                opacity: pol.isActive ? 1 : 0.65,
                transition: 'opacity var(--transition-fast)',
              }}
            >
              <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                {/* Title & Status */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 700,
                          padding: '0.15rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: `${pol.color}20`,
                          color: pol.color,
                        }}
                      >
                        {pol.code}
                      </span>
                      <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {pol.name}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: '0.4rem' }}>
                      <Badge variant={pol.type === 'paid' ? 'success' : 'warning'}>
                        {pol.type === 'paid' ? 'Paid Leave' : 'Unpaid / Loss of Pay'}
                      </Badge>
                      <Badge variant="neutral">
                        {pol.annualAllowanceDays} Days / Year
                      </Badge>
                    </div>
                  </div>

                  {/* Active Toggle Switch */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <Switch
                      checked={pol.isActive}
                      onChange={() => onToggleStatus(pol.id)}
                      label=""
                    />
                  </div>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    marginTop: 'var(--space-3)',
                    lineHeight: 'var(--leading-normal)',
                  }}
                >
                  {pol.description}
                </p>

                {/* Policy Rules Specifications */}
                <div
                  style={{
                    marginTop: 'var(--space-4)',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Accrual Frequency:</span>
                    <strong style={{ textTransform: 'capitalize' }}>
                      {pol.accrualFrequency.replace(/_/g, ' ')}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Max Carry Forward:</span>
                    <strong>{pol.maxCarryForwardDays} Days</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Half-Day Requests:</span>
                    <strong>{pol.allowHalfDay ? 'Allowed' : 'Full-day only'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Minimum Advance Notice:</span>
                    <strong>{pol.minNoticeDays} Day{pol.minNoticeDays === 1 ? '' : 's'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Document Verification:</span>
                    <strong>
                      {pol.requiresAttachment
                        ? `Required for > ${pol.attachmentThresholdDays} consecutive days`
                        : 'Not Required'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Applicable Departments:</span>
                    <strong>{pol.applicableDepartments.join(', ')}</strong>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                className="card-footer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-5)',
                  backgroundColor: 'var(--color-bg-subtle)',
                }}
              >
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {pol.autoApprove ? '⚡ Auto-Approved' : '🛡️ Manager Approval Required'}
                </span>

                <Button variant="ghost" size="sm" onClick={() => onEditPolicy(pol)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Policy
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
