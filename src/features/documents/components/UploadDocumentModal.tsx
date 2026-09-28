import { Modal, Button, Input } from '../../../components/ui';
export function UploadDocumentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return <Modal isOpen={isOpen} onClose={onClose} title="Upload Document">
    <div className="modal-body"><Input type="file" /></div>
    <div className="modal-footer"><Button onClick={onClose}>Upload</Button></div>
  </Modal>;
}