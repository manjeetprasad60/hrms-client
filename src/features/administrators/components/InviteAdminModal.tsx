import { Modal, Button, Input } from '../../../components/ui';
export function InviteAdminModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return <Modal isOpen={isOpen} onClose={onClose} title="Invite Admin">
    <div className="modal-body"><Input label="Email" /></div>
    <div className="modal-footer"><Button onClick={onClose}>Send</Button></div>
  </Modal>;
}