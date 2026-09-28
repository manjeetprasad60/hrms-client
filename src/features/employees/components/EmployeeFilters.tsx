import type { Dispatch, SetStateAction } from 'react';
import { Input, Select } from '../../../components/ui';

type EmployeeFiltersState = {
  search: string;
  status: string;
  department: string;
  employmentType: string;
};

export function EmployeeFilters({ filters, onChange }: { filters: EmployeeFiltersState; onChange: Dispatch<SetStateAction<EmployeeFiltersState>> }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      <Input placeholder="Search..." value={filters.search} onChange={(e) => onChange((prev) => ({ ...prev, search: e.target.value }))} />
      <Select value={filters.status} onChange={(e) => onChange((prev) => ({ ...prev, status: e.target.value }))} options={[{label:'All', value:''}]} />
    </div>
  );
}