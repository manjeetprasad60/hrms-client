import { useState, useMemo, useEffect, useContext } from 'react';
import { PageContainer } from '../../../layouts';
import { Button, Spinner } from '../../../components/ui';
import { EmployeeTable, type Employee } from '../components/EmployeeTable';
import { EmployeeFilters, type EmployeeFiltersState } from '../components/EmployeeFilters';
import { CreateEmployeeModal, type EmployeeFormData } from '../components/CreateEmployeeModal';
import { EditEmployeeModal } from '../components/EditEmployeeModal';
import { EmployeeDetailModal } from '../components/EmployeeDetailModal';
import { employeeService } from '../../../services/employee';
import { ClientContext } from '../../../routes/ClientContext';
import type { CreateEmployeePayload } from '../../../services/employee/employee.types';

const DEFAULT_COMPANY_ID = 'cmp_hrms_28_2886';

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp_001',
    companyId: DEFAULT_COMPANY_ID,
    name: 'Rajesh Kumar',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh@flextr.com',
    department: 'Engineering',
    designation: 'Senior Developer',
    status: 'active',
  },
  {
    id: 'emp_002',
    companyId: DEFAULT_COMPANY_ID,
    name: 'Meera Singh',
    firstName: 'Meera',
    lastName: 'Singh',
    email: 'meera@flextr.com',
    department: 'Design',
    designation: 'Lead Designer',
    status: 'on_leave',
  },
  {
    id: 'emp_003',
    companyId: DEFAULT_COMPANY_ID,
    name: 'Amit Patel',
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit@flextr.com',
    department: 'Human Resources',
    designation: 'HR Manager',
    status: 'active',
  },
];

export function EmployeeManagementPage() {
  const clientContext = useContext(ClientContext);
  const companyId = clientContext?.organizationId || clientContext?.clientUser?.companyId || DEFAULT_COMPANY_ID;

  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [filters, setFilters] = useState<EmployeeFiltersState>({
    search: '',
    status: '',
    department: '',
    employmentType: '',
  });

  const [showCreate, setShowCreate] = useState(false);
  const [editEmp, setEditEmp] = useState<Record<string, unknown> | null>(null);
  const [viewEmp, setViewEmp] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    employeeService
      .getEmployees(companyId)
      .then((data) => {
        if (isMounted) {
          if (data && data.length > 0) {
            setEmployees(data);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (filters.status && emp.status !== filters.status) {
        return false;
      }
      if (filters.department && emp.department?.toLowerCase() !== filters.department.toLowerCase()) {
        return false;
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const displayName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`;
        const matchesName = displayName.toLowerCase().includes(query);
        const matchesEmail = emp.email?.toLowerCase().includes(query);
        const matchesDept = emp.department?.toLowerCase().includes(query);
        const matchesDesig = emp.designation?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesDept && !matchesDesig) {
          return false;
        }
      }
      return true;
    });
  }, [employees, filters]);

  const handleCreateEmployee = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    setCreateError(null);

    const nameParts = data.name.trim().split(/\s+/);
    const firstName = data.firstName || nameParts[0] || '';
    const lastName = data.lastName || nameParts.slice(1).join(' ') || '';

    const payload: CreateEmployeePayload = {
      companyId: data.companyId || companyId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      department: data.department || '',
      designation: data.designation || '',
      status: data.status || 'active',
      firstName,
      lastName,
    };

    try {
      const created = await employeeService.addEmployee(payload);
      const newEmployee: Employee = {
        ...payload,
        ...(created && typeof created === 'object' ? created : {}),
        id: (created as { id?: string })?.id || `emp_${Date.now()}`,
      };

      setEmployees((prev) => [newEmployee, ...prev]);
      setShowCreate(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add employee';
      setCreateError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleEditEmployee = async (updated: Record<string, unknown>) => {
    setIsUpdating(true);
    setUpdateError(null);
    const empId = (updated.id as string) || (editEmp?.id as string);

    const payload = {
      companyId: (updated.companyId as string) || companyId,
      designation: updated.designation as string,
      status: updated.status as string,
      name: updated.name as string,
      email: updated.email as string,
      department: updated.department as string,
      firstName: updated.firstName as string,
      lastName: updated.lastName as string,
    };

    try {
      const res = await employeeService.updateEmployee(companyId, empId, payload);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === empId
            ? ({
                ...emp,
                ...updated,
                ...(res && typeof res === 'object' ? res : {}),
              } as Employee)
            : emp
        )
      );
      setEditEmp(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update employee';
      setUpdateError(msg);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <PageContainer title="Employee Directory" breadcrumbs={[{ label: 'Employees', path: '/employees' }]}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>
          {filteredEmployees.length} {filteredEmployees.length === 1 ? 'Employee' : 'Employees'}
        </h2>
        <Button onClick={() => { setCreateError(null); setShowCreate(true); }}>
          Add Employee
        </Button>
      </div>

      <EmployeeFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Spinner />
        </div>
      ) : (
        <EmployeeTable
          employees={filteredEmployees}
          onEdit={(e) => setEditEmp(e as Record<string, unknown>)}
          onView={(e) => setViewEmp(e as Record<string, unknown>)}
        />
      )}

      <CreateEmployeeModal
        isOpen={showCreate}
        onClose={() => { setCreateError(null); setShowCreate(false); }}
        onSubmit={handleCreateEmployee}
        isSubmitting={isSubmitting}
        apiError={createError}
      />

      {editEmp && (
        <EditEmployeeModal
          isOpen={true}
          employee={editEmp}
          onClose={() => { setUpdateError(null); setEditEmp(null); }}
          onSubmit={handleEditEmployee}
          isSubmitting={isUpdating}
          apiError={updateError}
        />
      )}

      {viewEmp && (
        <EmployeeDetailModal
          isOpen={true}
          employee={viewEmp}
          onClose={() => setViewEmp(null)}
        />
      )}
    </PageContainer>
  );
}