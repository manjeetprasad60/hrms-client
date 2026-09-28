import { Modal, Button, Input } from '../../../components/ui';
export function CreateDepartmentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Department">
      <div className="modal-body"><Input label="Name" /></div>
      <div className="modal-footer"><Button onClick={onClose}>Save</Button></div>
    </Modal>
  );
}