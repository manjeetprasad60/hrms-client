import { Table, Badge } from '../../../components/ui';

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  designation?: string;
  status?: string;
  [key: string]: unknown;
}

export function EmployeeTable({ employees = [], onEdit, onView }: { employees?: Employee[]; onEdit: (e: Employee) => void; onView: (e: Employee) => void }) {
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
          {employees.map((e: Employee) => (
            <tr key={e.id}>
              <td>{e.firstName} {e.lastName}</td>
              <td>{e.email}</td>
              <td>{e.department}</td>
              <td>{e.designation}</td>
              <td><Badge variant={e.status === 'active' ? 'success' : 'neutral'}>{e.status}</Badge></td>
              <td>
                <button className="btn btn-secondary" onClick={() => onView(e)}>View</button>
                <button className="btn btn-secondary" onClick={() => onEdit(e)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}