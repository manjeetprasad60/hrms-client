import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { PermissionMatrix } from './PermissionMatrix';
import type { PermissionKey } from '../../../permissions/permissions';

export interface CreateRoleModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (input: {
    name: string;
    description: string;
    permissions: PermissionKey[];
  }) => Promise<void>;
  readonly isSubmitting: boolean;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedPermissions([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setError('Please provide a valid role name (minimum 2 characters).');
      return;
    }

    if (!trimmedDesc || trimmedDesc.length < 5) {
      setError('Please provide a meaningful description of the role responsibilities (minimum 5 characters).');
      return;
    }

    if (selectedPermissions.length === 0) {
      setError('A role must grant at least one permission.');
      return;
    }

    try {
      await onSubmit({
        name: trimmedName,
        description: trimmedDesc,
        permissions: selectedPermissions,
      });
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create role.';
      setError(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Custom Role"
      description="Define a new custom role with tailored permissions for your organization."
      className="max-w-3xl"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting || !name.trim() || selectedPermissions.length === 0}
          >
            Create Role
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {error && (
          <Alert variant="error" title="Validation Error">
            {error}
          </Alert>
        )}

        <Input
          id="create-role-name"
          label="Role Name"
          placeholder="e.g. Billing Specialist, Onboarding Coordinator"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          helperText="A clear, human-readable name identifying this role."
        />

        <Textarea
          id="create-role-description"
          label="Description"
          placeholder="Describe the scope of responsibility and operational authority granted by this role..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          helperText="Explains what this role does and who should be assigned to it."
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
              Permissions Matrix ({selectedPermissions.length} selected)
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
            Select the granular permissions to grant to users assigned to this role.
          </p>

          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-background-subtle)',
            }}
          >
            <PermissionMatrix
              selectedPermissions={selectedPermissions}
              onChange={setSelectedPermissions}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
