import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

export interface UnsavedChangesModalProps {
  readonly isOpen: boolean;
  readonly onConfirmLeave: () => void;
  readonly onCancelStay: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onConfirmLeave,
  onCancelStay,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancelStay}
      title="Unsaved Changes"
      description="You have unsaved changes on this page"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          You have modified the organization profile. If you leave this page without saving, all
          unsaved adjustments will be discarded.
        </p>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
          Are you sure you want to discard your changes and leave?
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-4)',
        }}
      >
        <Button variant="outline" size="sm" onClick={onCancelStay}>
          Stay on Page
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirmLeave}>
          Discard Changes & Leave
        </Button>
      </div>
    </Modal>
  );
};
