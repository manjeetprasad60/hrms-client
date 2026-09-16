import { useMemo } from 'react';
import { cn } from '../../utils/cn';

export interface PaginationProps {
  readonly page: number;
  readonly totalPages: number;
  readonly totalItems?: number;
  readonly pageSize?: number;
  readonly pageSizeOptions?: readonly number[];
  readonly onPageChange: (page: number) => void;
  readonly onPageSizeChange?: (pageSize: number) => void;
  readonly className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  const startItem = totalItems !== undefined ? (page - 1) * pageSize + 1 : undefined;
  const endItem = totalItems !== undefined ? Math.min(page * pageSize, totalItems) : undefined;

  return (
    <nav
      aria-label="Pagination Navigation"
      className={cn('pagination-container', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        padding: 'var(--space-3) 0',
      }}
    >
      {/* Range Summary & Page Size Select */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {totalItems !== undefined && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of{' '}
            <strong>{totalItems}</strong> items
          </span>
        )}

        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <label
              htmlFor="pagination-limit-select"
              style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
            >
              Per page:
            </label>
            <select
              id="pagination-limit-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="select"
              style={{
                width: 'auto',
                padding: '2px 8px',
                height: '28px',
                fontSize: 'var(--text-xs)',
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Go to previous page"
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.25rem 0.5rem', height: '32px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Prev</span>
        </button>

        {/* Numeric Page Buttons */}
        {pageNumbers.map((p, idx) => {
          if (p === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: '0 0.5rem',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-sm)',
                }}
                aria-hidden="true"
              >
                …
              </span>
            );
          }

          const isCurrent = p === page;

          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={`Page ${p}`}
              className={cn(
                'btn',
                'btn-sm',
                isCurrent ? 'btn-primary' : 'btn-ghost'
              )}
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                fontWeight: isCurrent ? 600 : 400,
              }}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Go to next page"
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.25rem 0.5rem', height: '32px' }}
        >
          <span>Next</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
