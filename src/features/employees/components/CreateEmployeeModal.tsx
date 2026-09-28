import { Modal, Button, Input } from '../../../components/ui';

export function CreateEmployeeModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit?: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Employee">
      <div className="modal-body">
        <Input label="First Name" />
        <Input label="Last Name" />
        <Input label="Email" type="email" />
      </div>
      <div className="modal-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit}>Create</Button>
      </div>
    </Modal>
  );
}