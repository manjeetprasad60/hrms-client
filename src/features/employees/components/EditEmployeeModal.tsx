import { Modal, Button, Input } from '../../../components/ui';

export function EditEmployeeModal({ isOpen, onClose, employee, onSubmit }: { isOpen: boolean; onClose: () => void; employee?: Record<string, unknown> | null; onSubmit?: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Employee">
      <div className="modal-body">
        <Input label="First Name" defaultValue={employee?.firstName as string | undefined} />
      </div>
      <div className="modal-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit}>Save</Button>
      </div>
    </Modal>
  );
}