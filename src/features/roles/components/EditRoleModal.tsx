import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { PermissionMatrix } from './PermissionMatrix';
import type { Role, RoleStatus } from '../../../types/role';
import type { PermissionKey } from '../../../permissions/permissions';

export interface EditRoleModalProps {
  readonly isOpen: boolean;
  readonly role: Role | null;
  readonly onClose: () => void;
  readonly onSubmit: (
    roleId: string,
    updates: {
      name: string;
      description: string;
      status: RoleStatus;
      permissions: PermissionKey[];
    }
  ) => Promise<void>;
  readonly isSubmitting: boolean;
}

interface EditRoleFormProps {
  readonly role: Role;
  readonly onClose: () => void;
  readonly onSubmit: EditRoleModalProps['onSubmit'];
  readonly isSubmitting: boolean;
}

const EditRoleForm: React.FC<EditRoleFormProps> = ({
  role,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);
  const [status, setStatus] = useState<RoleStatus>(
    (role.status as RoleStatus) || 'active'
  );
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>(
    [...(role.permissionIds || role.permissions || [])]
  );
  const [error, setError] = useState<string | null>(null);

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
      await onSubmit(role.id, {
        name: trimmedName,
        description: trimmedDesc,
        status,
        permissions: selectedPermissions,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update role.';
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {error && (
        <Alert variant="error" title="Validation Error">
          {error}
        </Alert>
      )}

      {/* Role Identifier display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Role Slug / Code</span>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 'var(--text-xs)',
            backgroundColor: 'var(--color-background-subtle)',
            padding: '0.25rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-default)',
            display: 'inline-block',
            width: 'fit-content',
          }}
        >
          {role.code}
        </span>
      </div>

      <Input
        id="edit-role-name"
        label="Role Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        helperText="A clear, human-readable name identifying this role."
      />

      <Textarea
        id="edit-role-description"
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        rows={3}
        helperText="Explains what this role does and who should be assigned to it."
      />

      <Select
        id="edit-role-status"
        label="Role Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as RoleStatus)}
        options={[
          { value: 'active', label: 'Active - Available for user assignment' },
          { value: 'inactive', label: 'Inactive - Temporarily unavailable' },
          { value: 'archived', label: 'Archived - Deprecated role' },
        ]}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
            Permissions Matrix ({selectedPermissions.length} selected)
          </span>
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
          Manage granular permissions assigned to this custom role.
        </p>

        <div
          style={{
            maxHeight: '340px',
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

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--space-2)',
          marginTop: 'var(--space-4)',
          borderTop: '1px solid var(--color-border-default)',
          paddingTop: 'var(--space-4)',
        }}
      >
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting || !name.trim() || selectedPermissions.length === 0}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export const EditRoleModal: React.FC<EditRoleModalProps> = ({
  isOpen,
  role,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  if (!isOpen || !role) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Role: ${role.name}`}
      description="Update custom role details and permissions."
      className="max-w-3xl"
    >
      <EditRoleForm
        key={role.id}
        role={role}
        onClose={onClose}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
};
