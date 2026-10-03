import type { Dispatch, SetStateAction } from 'react';
import { Input, Select } from '../../../components/ui';

export type EmployeeFiltersState = {
  search: string;
  status: string;
  department: string;
  employmentType: string;
};

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'On Leave', value: 'on_leave' },
  { label: 'Probation', value: 'probation' },
  { label: 'Terminated', value: 'terminated' },
];

export function EmployeeFilters({
  filters,
  onChange,
}: {
  readonly filters: EmployeeFiltersState;
  readonly onChange: Dispatch<SetStateAction<EmployeeFiltersState>>;
}) {
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '220px' }}>
        <Input
          placeholder="Search by name, email, department, designation..."
          value={filters.search}
          onChange={(e) => onChange((prev) => ({ ...prev, search: e.target.value }))}
        />
      </div>
      <div style={{ width: '180px' }}>
        <Select
          value={filters.status}
          onChange={(e) => onChange((prev) => ({ ...prev, status: e.target.value }))}
          options={STATUS_OPTIONS}
        />
      </div>
    </div>
  );
}