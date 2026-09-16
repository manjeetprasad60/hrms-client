import React from 'react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { CLIENT_ROLES, type ClientRole } from '../../../permissions/roles';
import { CLIENT_USER_STATUS, type ClientUserStatus } from '../../../types/auth';
import type { UserFilterState } from '../types';

export interface UserFiltersProps {
  readonly filters: UserFilterState;
  readonly onFiltersChange: (filters: UserFilterState) => void;
  readonly onResetFilters: () => void;
  readonly totalMatches: number;
  readonly totalUsers: number;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
  totalMatches,
  totalUsers,
}) => {
  const isFiltered = filters.search.trim() !== '' || filters.role !== 'all' || filters.status !== 'all';

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
              id="user-search-input"
              type="search"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              aria-label="Search users by name or email"
            />
          </div>

          {/* Role Filter */}
          <div style={{ width: '180px' }}>
            <Select
              id="user-role-filter"
              value={filters.role}
              onChange={(e) => onFiltersChange({ ...filters, role: e.target.value as ClientRole | 'all' })}
              aria-label="Filter by user role"
              options={[
                { value: 'all', label: 'All Roles' },
                { value: CLIENT_ROLES.ORG_ADMIN, label: 'Organization Admin' },
                { value: CLIENT_ROLES.HR_MANAGER, label: 'HR Manager' },
                { value: CLIENT_ROLES.PAYROLL_ADMIN, label: 'Payroll Admin' },
                { value: CLIENT_ROLES.DEPARTMENT_HEAD, label: 'Department Head' },
                { value: CLIENT_ROLES.EMPLOYEE, label: 'Employee' },
              ]}
            />
          </div>

          {/* Status Filter */}
          <div style={{ width: '160px' }}>
            <Select
              id="user-status-filter"
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as ClientUserStatus | 'all' })}
              aria-label="Filter by user status"
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: CLIENT_USER_STATUS.ACTIVE, label: 'Active' },
                { value: CLIENT_USER_STATUS.INVITED, label: 'Invited' },
                { value: CLIENT_USER_STATUS.SUSPENDED, label: 'Suspended' },
                { value: CLIENT_USER_STATUS.DISABLED, label: 'Disabled' },
              ]}
            />
          </div>

          {/* Reset Filters Action */}
          {isFiltered && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onResetFilters}
              aria-label="Clear active search and filters"
              style={{ height: '36px' }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Counter Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            Showing <strong>{totalMatches}</strong> of <strong>{totalUsers}</strong> users
          </span>
          {isFiltered && (
            <Badge variant="primary" style={{ fontSize: '11px', padding: '1px 6px' }}>
              Filtered
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
