import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Badge, type BadgeVariant } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { PermissionMatrix } from './PermissionMatrix';
import { formatDate } from '../../../utils/formatters';
import type { Role } from '../../../types/role';

export interface RoleDetailModalProps {
  readonly isOpen: boolean;
  readonly role: Role | null;
  readonly assignedUsersCount: number;
  readonly onClose: () => void;
}

function getStatusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'warning';
    case 'archived':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export const RoleDetailModal: React.FC<RoleDetailModalProps> = ({
  isOpen,
  role,
  assignedUsersCount,
  onClose,
}) => {
  if (!isOpen || !role) return null;

  const permissions = role.permissionIds || role.permissions || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role.name}
      description={role.isSystemRole ? 'System Role Archetype' : 'Custom Organization Role'}
      className="max-w-3xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Header Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
            backgroundColor: 'var(--color-background-subtle)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-default)',
          }}
        >
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
              Role Code / Identifier
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              {role.code}
            </span>
          </div>

          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
              Role Type
            </span>
            {role.isSystemRole ? (
              <Badge variant="primary">System Role</Badge>
            ) : (
              <Badge variant="neutral">Custom Role</Badge>
            )}
          </div>

          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
              Status
            </span>
            <Badge variant={getStatusBadgeVariant(role.status)}>
              {role.status.charAt(0).toUpperCase() + role.status.slice(1)}
            </Badge>
          </div>

          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
              Assigned Active Users
            </span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {assignedUsersCount === 1 ? '1 user' : `${assignedUsersCount} users`}
            </span>
          </div>

          {role.createdAt && (
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                Created At
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                {formatDate(role.createdAt)}
              </span>
            </div>
          )}

          {role.updatedAt && (
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                Last Updated
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                {formatDate(role.updatedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Role Description */}
        <div>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              display: 'block',
              marginBottom: 'var(--space-1)',
            }}
          >
            Description & Scope
          </span>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {role.description}
          </p>
        </div>

        {/* Permissions Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
              }}
            >
              Granted Permissions ({permissions.length})
            </span>
          </div>

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
            <PermissionMatrix selectedPermissions={permissions} readOnly />
          </div>
        </div>
      </div>
    </Modal>
  );
};
