import { Table, Badge } from '../../../components/ui';
import type { Employee } from '../../../services/employee/employee.types';

export type { Employee };

export function EmployeeTable({
  employees = [],
  onEdit,
  onView,
}: {
  readonly employees?: Employee[];
  readonly onEdit: (e: Employee) => void;
  readonly onView: (e: Employee) => void;
}) {
  return (
    <div className="table-container">
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                No employees found
              </td>
            </tr>
          ) : (
            employees.map((e: Employee) => {
              const displayName =
                e.name ||
                `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() ||
                '—';

              const badgeVariant =
                e.status === 'active'
                  ? 'success'
                  : e.status === 'on_leave'
                  ? 'warning'
                  : 'neutral';

              return (
                <tr key={e.id}>
                  <td>{displayName}</td>
                  <td>{e.email || '—'}</td>
                  <td>{e.department || '—'}</td>
                  <td>{e.designation || '—'}</td>
                  <td>
                    <Badge variant={badgeVariant}>
                      {e.status || 'unknown'}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => onView(e)}>
                        View
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => onEdit(e)}>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
}