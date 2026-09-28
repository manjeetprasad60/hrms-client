import { Table } from '../../../components/ui';
export function AdminTable({ admins = [] }: { admins?: Record<string, unknown>[] }) {
  return <div className="table-container"><Table>
    <thead><tr><th>Name</th><th>Email</th></tr></thead>
    <tbody>{admins.map((a: Record<string, unknown>) => <tr key={a.id as string}><td>{a.name as string}</td><td>{a.email as string}</td></tr>)}</tbody>
  </Table></div>;
}