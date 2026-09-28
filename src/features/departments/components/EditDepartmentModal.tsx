import { Modal, Button, Input } from '../../../components/ui';
export function EditDepartmentModal({ isOpen, onClose, department }: { isOpen: boolean; onClose: () => void; department?: Record<string, unknown> | null }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Department">
      <div className="modal-body"><Input label="Name" defaultValue={department?.name as string | undefined} /></div>
      <div className="modal-footer"><Button onClick={onClose}>Save</Button></div>
    </Modal>
  );
}