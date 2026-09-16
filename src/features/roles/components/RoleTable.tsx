import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Badge, type BadgeVariant } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { TableLoadingRows } from '../../../components/feedback/Loading/TableLoading';
import { usePermission } from '../../../permissions/usePermission';
import { PERMISSIONS } from '../../../permissions/permissions';
import type { Role } from '../../../types/role';

export interface RoleTableProps {
  readonly roles: readonly Role[];
  readonly userCountMap: Record<string, number>;
  readonly isLoading?: boolean;
  readonly onViewRole: (role: Role) => void;
  readonly onEditRole: (role: Role) => void;
  readonly onDeleteRole: (role: Role) => void;
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

export const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  userCountMap,
  isLoading = false,
  onViewRole,
  onEditRole,
  onDeleteRole,
}) => {
  const { can } = usePermission();
  const canEdit = can(PERMISSIONS.ROLES_EDIT) || can(PERMISSIONS.ROLES_MANAGE);
  const canDelete = can(PERMISSIONS.ROLES_DELETE) || can(PERMISSIONS.ROLES_MANAGE);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <Table containerClassName="roles-management-table" aria-label="Organizational roles and permissions">
        <TableHeader>
          <TableRow>
            <TableHead style={{ minWidth: '220px' }}>Role</TableHead>
            <TableHead style={{ minWidth: '260px' }}>Description</TableHead>
            <TableHead style={{ minWidth: '140px' }}>Type</TableHead>
            <TableHead style={{ minWidth: '120px' }}>Assigned Users</TableHead>
            <TableHead style={{ minWidth: '120px' }}>Permissions</TableHead>
            <TableHead style={{ minWidth: '100px' }}>Status</TableHead>
            <TableHead style={{ minWidth: '200px', textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableLoadingRows columns={7} rows={5} />
          ) : roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  No roles found matching your criteria.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => {
              const assignedCount = userCountMap[role.id] ?? userCountMap[role.code] ?? 0;
              const permissionsCount = role.permissionIds?.length ?? role.permissions?.length ?? 0;

              return (
                <TableRow key={role.id}>
                  {/* Role Name and Code */}
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {role.name}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontFamily: 'monospace',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {role.code}
                      </span>
                    </div>
                  </TableCell>

                  {/* Description */}
                  <TableCell>
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                      title={role.description}
                    >
                      {role.description}
                    </span>
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    {role.isSystemRole ? (
                      <Badge variant="primary">System Role</Badge>
                    ) : (
                      <Badge variant="neutral">Custom Role</Badge>
                    )}
                  </TableCell>

                  {/* Assigned Users */}
                  <TableCell>
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: assignedCount > 0 ? 600 : 400,
                        color: assignedCount > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      }}
                    >
                      {assignedCount === 1 ? '1 user' : `${assignedCount} users`}
                    </span>
                  </TableCell>

                  {/* Permissions count */}
                  <TableCell>
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {permissionsCount} granted
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(role.status)}>
                      {role.status.charAt(0).toUpperCase() + role.status.slice(1)}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 'var(--space-1)',
                      }}
                    >
                      {/* View details */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewRole(role)}
                        aria-label={`View permissions for ${role.name}`}
                        title="View role details and permissions"
                        style={{ padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}
                      >
                        View
                      </Button>

                      {/* Edit Role (Custom roles only, requires ROLES_EDIT/MANAGE) */}
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditRole(role)}
                          disabled={role.isSystemRole}
                          aria-label={`Edit ${role.name}`}
                          title={
                            role.isSystemRole
                              ? 'Protected system role cannot be edited'
                              : 'Edit custom role'
                          }
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: 'var(--text-xs)',
                            opacity: role.isSystemRole ? 0.4 : 1,
                            cursor: role.isSystemRole ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Edit
                        </Button>
                      )}

                      {/* Delete Role (Custom roles only, requires ROLES_DELETE/MANAGE) */}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteRole(role)}
                          disabled={role.isSystemRole}
                          aria-label={`Delete ${role.name}`}
                          title={
                            role.isSystemRole
                              ? 'Protected system role cannot be deleted'
                              : assignedCount > 0
                              ? `Cannot delete role with ${assignedCount} assigned users`
                              : 'Delete custom role'
                          }
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: 'var(--text-xs)',
                            color: role.isSystemRole ? 'var(--color-text-muted)' : 'var(--color-danger-default, #dc2626)',
                            opacity: role.isSystemRole ? 0.4 : 1,
                            cursor: role.isSystemRole ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
