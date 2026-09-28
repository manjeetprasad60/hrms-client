import { Modal, Button, Input } from '../../../components/ui';
export function EditLocationModal({ isOpen, onClose, location }: { isOpen: boolean; onClose: () => void; location?: Record<string, unknown> | null }) {
  return <Modal isOpen={isOpen} onClose={onClose} title="Edit Location">
    <div className="modal-body"><Input label="Name" defaultValue={location?.name as string | undefined} /></div>
    <div className="modal-footer"><Button onClick={onClose}>Save</Button></div>
  </Modal>;
}