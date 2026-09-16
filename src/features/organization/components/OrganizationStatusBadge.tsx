import React from 'react';
import { Badge, type BadgeVariant } from '../../../components/ui/Badge';
import type { EntityStatus } from '../../../types/common';

export interface OrganizationStatusBadgeProps {
  readonly status?: EntityStatus | string;
  readonly className?: string;
  readonly showDescription?: boolean;
}

const statusConfig: Record<string, { label: string; variant: BadgeVariant; description: string }> = {
  active: {
    label: 'Active',
    variant: 'success',
    description: 'Organization workspace is fully operational and healthy.',
  },
  suspended: {
    label: 'Suspended',
    variant: 'warning',
    description: 'Operational access is suspended by the platform administrator.',
  },
  inactive: {
    label: 'Inactive',
    variant: 'neutral',
    description: 'Organization workspace is deactivated or archived.',
  },
  pending: {
    label: 'Pending Provisioning',
    variant: 'info',
    description: 'Organization onboarding is being completed.',
  },
};

export const OrganizationStatusBadge: React.FC<OrganizationStatusBadgeProps> = ({
  status = 'active',
  className,
  showDescription = false,
}) => {
  const normalizedKey = status.toLowerCase();
  const config = statusConfig[normalizedKey] || {
    label: status.toUpperCase(),
    variant: 'neutral' as BadgeVariant,
    description: 'Organization status managed at platform level.',
  };

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', flexDirection: 'column', gap: 'var(--space-1)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Badge variant={config.variant} title={`Platform Status: ${config.label}`}>
          {config.label}
        </Badge>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
          }}
        >
          (Managed by Platform)
        </span>
      </div>
      {showDescription && (
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {config.description}
        </span>
      )}
    </div>
  );
};
