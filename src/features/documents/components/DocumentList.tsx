import { Card } from '../../../components/ui';
export function DocumentList({ documents = [] }: { documents?: Record<string, unknown>[] }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
    {documents.map((d: Record<string, unknown>) => <Card key={d.id as string}><div className="card-body">{d.name as string}</div></Card>)}
  </div>;
}