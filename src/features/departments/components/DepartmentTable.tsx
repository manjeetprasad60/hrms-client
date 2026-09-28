import { Table } from '../../../components/ui';

interface Department {
  id: string;
  name: string;
  description?: string;
  [key: string]: unknown;
}

export function DepartmentTable({ departments = [], onEdit }: { departments?: Department[]; onEdit: (d: Department) => void }) {
  return (
    <div className="table-container">
      <Table>
        <thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
        <tbody>
          {departments.map((d: Department) => (
            <tr key={d.id}><td>{d.name}</td><td>{d.description}</td>
            <td><button className="btn btn-secondary" onClick={() => onEdit(d)}>Edit</button></td></tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}