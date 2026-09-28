import { useState } from 'react';
import { PageContainer } from '../../../layouts';
import { Button } from '../../../components/ui';
import { DepartmentTable } from '../components/DepartmentTable';
import { CreateDepartmentModal } from '../components/CreateDepartmentModal';
import { EditDepartmentModal } from '../components/EditDepartmentModal';

export function DepartmentManagementPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editDept, setEditDept] = useState<Record<string, unknown> | null>(null);
  return (
    <PageContainer title="Departments">
      <Button onClick={() => setShowCreate(true)}>Add Department</Button>
      <DepartmentTable departments={[]} onEdit={(d) => setEditDept(d as Record<string, unknown>)} />
      <CreateDepartmentModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      {editDept && <EditDepartmentModal isOpen={true} department={editDept} onClose={() => setEditDept(null)} />}
    </PageContainer>
  );
}