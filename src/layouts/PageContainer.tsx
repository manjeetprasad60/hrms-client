import React from 'react';
import { Breadcrumb, type BreadcrumbItem } from '../components/navigation/Breadcrumb';
import { cn } from '../utils/cn';

export interface PageContainerProps {
  readonly title: string;
  readonly description?: string;
  readonly breadcrumbs?: readonly BreadcrumbItem[];
  readonly actions?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function PageContainer({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn('page-container', className)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header Area */}
      <div
        className="page-header-wrap"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          borderBottom: '1px solid var(--color-border-default)',
          paddingBottom: 'var(--space-5)',
        }}
      >
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} />
        )}

        <div
          className="page-title-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
          }}
        >
          <div style={{ flex: '1 1 300px' }}>
            <h1 className="text-page-title">{title}</h1>
            {description && (
              <p
                className="text-body"
                style={{
                  marginTop: 'var(--space-1)',
                  maxWidth: '48rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div
              className="page-actions"
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
              }}
            >
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Main Page Content */}
      <div className="page-content">{children}</div>
    </div>
  );
}
