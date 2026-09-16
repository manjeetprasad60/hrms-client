import React from 'react';
import { cn } from '../../utils/cn';

export type EmptyStatePreset =
  | 'no-employees'
  | 'no-notifications'
  | 'no-records'
  | 'search-empty'
  | 'default';

export interface EmptyStateProps {
  readonly preset?: EmptyStatePreset;
  readonly title?: string;
  readonly description?: string;
  readonly icon?: React.ReactNode;
  readonly action?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

const PRESET_CONFIGS: Record<
  Exclude<EmptyStatePreset, 'default'>,
  {
    readonly title: string;
    readonly description: string;
    readonly icon: React.ReactNode;
  }
> = {
  'no-employees': {
    title: 'No employees found',
    description: 'Your organization directory is currently empty. Add staff members to manage their profiles and employment records.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  'no-notifications': {
    title: 'No notifications',
    description: 'You are all caught up! There are no unread system notifications, approval requests, or alerts.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  'no-records': {
    title: 'No records available',
    description: 'There are no operational records or logs to display in this section yet.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  'search-empty': {
    title: 'No results found',
    description: 'No matching records were found for your current search query or applied filter criteria. Try adjusting your search term.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
  },
};

/**
 * Reusable empty state component with enterprise presets.
 * Used for zero-data conditions, empty search results, and fresh workspace sections.
 */
export function EmptyState({
  preset = 'default',
  title,
  description,
  icon,
  action,
  className,
  style,
}: EmptyStateProps) {
  const presetData = preset !== 'default' ? PRESET_CONFIGS[preset] : null;

  const resolvedTitle = title ?? presetData?.title ?? 'No records available';
  const resolvedDescription = description ?? presetData?.description;
  const resolvedIcon = icon ?? presetData?.icon ?? (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );

  return (
    <div
      role="region"
      aria-label={resolvedTitle}
      className={cn('empty-state-container', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-6)',
        textAlign: 'center',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-border-default)',
        maxWidth: '36rem',
        margin: '0 auto',
        ...style,
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-bg-subtle)',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
        }}
        aria-hidden="true"
      >
        {resolvedIcon}
      </div>

      <h3
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: resolvedDescription ? 'var(--space-2)' : 0,
        }}
      >
        {resolvedTitle}
      </h3>

      {resolvedDescription && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            maxWidth: '28rem',
            lineHeight: 'var(--leading-relaxed)',
            marginBottom: action ? 'var(--space-6)' : 0,
          }}
        >
          {resolvedDescription}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
