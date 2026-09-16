import React from 'react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { RoleStatus } from '../../../types/role';
import type { RoleFilterState } from '../types';

export interface RoleFiltersProps {
  readonly filters: RoleFilterState;
  readonly onFiltersChange: (filters: RoleFilterState) => void;
  readonly onResetFilters: () => void;
  readonly totalMatches: number;
  readonly totalRoles: number;
}

export const RoleFilters: React.FC<RoleFiltersProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
  totalMatches,
  totalRoles,
}) => {
  const isFiltered =
    filters.search.trim() !== '' ||
    filters.type !== 'all' ||
    filters.status !== 'all';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--space-3)',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input & Select Dropdowns */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--space-3)',
            flex: 1,
            minWidth: '280px',
          }}
        >
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }}>
            <Input
              id="role-search-input"
              type="search"
              placeholder="Search by role name or code..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              aria-label="Search roles"
            />
          </div>

          {/* Type Filter */}
          <div style={{ width: '170px' }}>
            <Select
              id="role-type-filter"
              value={filters.type}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  type: e.target.value as 'all' | 'system' | 'custom',
                })
              }
              aria-label="Filter by role type"
              options={[
                { value: 'all', label: 'All Role Types' },
                { value: 'system', label: 'System Roles' },
                { value: 'custom', label: 'Custom Roles' },
              ]}
            />
          </div>

          {/* Status Filter */}
          <div style={{ width: '160px' }}>
            <Select
              id="role-status-filter"
              value={filters.status}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  status: e.target.value as 'all' | RoleStatus,
                })
              }
              aria-label="Filter by role status"
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onResetFilters}
              aria-label="Reset all filters"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Count Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {isFiltered ? (
            <>
              Showing <strong>{totalMatches}</strong> of <strong>{totalRoles}</strong> roles
              <Badge variant="info">Filtered</Badge>
            </>
          ) : (
            <>
              Total Roles: <strong>{totalRoles}</strong>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
