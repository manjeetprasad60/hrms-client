import { Modal, Button } from '../../../components/ui';

export function EmployeeDetailModal({ isOpen, onClose, employee }: { isOpen: boolean; onClose: () => void; employee?: Record<string, unknown> | null }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Employee Details">
      <div className="modal-body">
        <p>Name: {employee?.firstName as string} {employee?.lastName as string}</p>
      </div>
      <div className="modal-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}