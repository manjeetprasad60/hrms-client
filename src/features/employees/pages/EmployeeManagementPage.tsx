import { useState } from 'react';
import { PageContainer } from '../../../layouts';
import { Button } from '../../../components/ui';
import { EmployeeTable } from '../components/EmployeeTable';
import { EmployeeFilters } from '../components/EmployeeFilters';
import { CreateEmployeeModal } from '../components/CreateEmployeeModal';
import { EditEmployeeModal } from '../components/EditEmployeeModal';
import { EmployeeDetailModal } from '../components/EmployeeDetailModal';

export function EmployeeManagementPage() {
  const [filters, setFilters] = useState({ search: '', status: '', department: '', employmentType: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [editEmp, setEditEmp] = useState<Record<string, unknown> | null>(null);
  const [viewEmp, setViewEmp] = useState<Record<string, unknown> | null>(null);

  return (
    <PageContainer title="Employee Directory" breadcrumbs={[{label: 'Employees', path: '/employees'}]}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2>0 Employees</h2>
        <Button onClick={() => setShowCreate(true)}>Add Employee</Button>
      </div>
      <EmployeeFilters filters={filters} onChange={setFilters} />
      <EmployeeTable 
        employees={[]} 
        onEdit={(e) => setEditEmp(e as Record<string, unknown>)} 
        onView={(e) => setViewEmp(e as Record<string, unknown>)}
      />
      <CreateEmployeeModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      {editEmp && <EditEmployeeModal isOpen={true} employee={editEmp} onClose={() => setEditEmp(null)} />}
      {viewEmp && <EmployeeDetailModal isOpen={true} employee={viewEmp} onClose={() => setViewEmp(null)} />}
    </PageContainer>
  );
}