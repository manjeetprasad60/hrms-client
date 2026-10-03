import { Modal, Button } from '../../../components/ui';

export function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly employee?: Record<string, unknown> | null;
}) {
  const name =
    (employee?.name as string) ||
    `${(employee?.firstName as string) || ''} ${(employee?.lastName as string) || ''}`.trim();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Employee Details">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Name</span>
          <span style={{ fontWeight: 500 }}>{name || '—'}</span>
        </div>
        <div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Email</span>
          <span style={{ fontWeight: 500 }}>{(employee?.email as string) || '—'}</span>
        </div>
        <div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Department</span>
          <span style={{ fontWeight: 500 }}>{(employee?.department as string) || '—'}</span>
        </div>
        <div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Designation</span>
          <span style={{ fontWeight: 500 }}>{(employee?.designation as string) || '—'}</span>
        </div>
        <div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Status</span>
          <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{(employee?.status as string) || '—'}</span>
        </div>
      </div>
      <div className="input-group" style={{ marginTop: '1.25rem' }}>
        <label className="input-label">Actions</label>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}