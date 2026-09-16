import React from 'react';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import type { SettingsCategory } from '../types';

export interface UpcomingCategoryCardProps {
  readonly category: SettingsCategory;
}

const plannedFeaturesByCat: Record<string, readonly string[]> = {
  working_configuration: [
    'Standard weekly working days (e.g. Monday - Friday)',
    'Standard daily work hours & core overlap hours',
    'Flexible hours & remote work eligibility toggles',
    'Fiscal year calendar start month and day configuration',
    'Overtime threshold and auto-approval rules for clock-ins',
  ],
  notifications: [
    'System-wide transactional email notifications toggle',
    'Daily pending approval digests for managers and admins',
    'Instant alerts on anomalous clock-ins and attendance flags',
    'Automated payslip disbursement email notifications',
    'Configurable webhook endpoints for enterprise Slack / Teams',
  ],
  security: [
    'Organization-wide enforced Multi-Factor Authentication (MFA)',
    'Inactivity session timeout limits (15m, 30m, 60m)',
    'Mandatory password rotation frequency (90, 180, 365 days)',
    'Single-session enforcement (terminate simultaneous logins)',
    'Corporate IP whitelisting for payroll operations',
  ],
};

export const UpcomingCategoryCard: React.FC<UpcomingCategoryCardProps> = ({ category }) => {
  const plannedItems = plannedFeaturesByCat[category.id] || [
    'Enterprise configuration schema established in Phase 3',
    'Extensible data model ready for granular administration',
  ];

  return (
    <Card>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {category.title}
              </h2>
              <Badge variant="neutral">{category.badge || 'Upcoming'}</Badge>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {category.description}
            </p>
          </div>
          <Badge variant="info" style={{ fontSize: '11px' }}>
            Scheduled for {category.phase}
          </Badge>
        </div>
      </CardHeader>
      <CardBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <span
                style={{
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '2px',
                }}
                aria-hidden="true"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </span>
              <div>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Architectural Foundation Established
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                  The data contracts and Firebase tree for this settings category are prepared. In accordance with
                  HRIS platform architectural principles, interactive configuration forms will be activated alongside
                  their corresponding functional domain modules.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
              Planned Configuration Capabilities
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              {plannedItems.map((item) => (
                <li
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
