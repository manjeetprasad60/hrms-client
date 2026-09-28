import { Table } from '../../../components/ui';
interface Location { id?: string; name?: string; city?: string; [key: string]: unknown; }

export function LocationTable({ locations = [], onEdit }: { locations?: Location[]; onEdit: (l: Location) => void }) {
  return (
    <div className="table-container"><Table>
      <thead><tr><th>Name</th><th>City</th><th>Actions</th></tr></thead>
      <tbody>{locations.map((l: Location) => (<tr key={l.id}><td>{l.name}</td><td>{l.city}</td>
      <td><button className="btn" onClick={() => onEdit(l)}>Edit</button></td></tr>))}</tbody>
    </Table></div>
  );
}