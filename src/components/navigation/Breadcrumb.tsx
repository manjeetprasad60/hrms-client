import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { ROUTE_PATHS } from '../../routes/routePaths';

export interface BreadcrumbItem {
  readonly label: string;
  readonly path?: string;
}

export interface BreadcrumbProps {
  readonly items?: readonly BreadcrumbItem[];
  readonly showHome?: boolean;
  readonly className?: string;
}

export function Breadcrumb({
  items = [],
  showHome = true,
  className,
}: BreadcrumbProps) {
  if (!showHome && items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('breadcrumb-nav', className)}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
        }}
      >
        {showHome && (
          <li style={{ display: 'flex', alignItems: 'center' }}>
            <Link
              to={ROUTE_PATHS.DASHBOARD}
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'inherit',
                transition: 'color var(--transition-fast)',
              }}
              title="Dashboard"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <span style={{ color: 'var(--color-border-strong)' }} aria-hidden="true">
                /
              </span>
              {isLast || !item.path ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  style={{
                    color: isLast ? 'var(--color-text-primary)' : 'inherit',
                    fontWeight: isLast ? 500 : 400,
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  style={{
                    color: 'inherit',
                    transition: 'color var(--transition-fast)',
                  }}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
