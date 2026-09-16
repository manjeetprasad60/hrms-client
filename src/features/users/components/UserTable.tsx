import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge, type BadgeVariant } from '../../../components/ui/Badge';
import { PermissionButton } from '../../../components/ui/PermissionButton';
import { TableLoadingRows } from '../../../components/feedback/Loading/TableLoading';
import { PERMISSIONS } from '../../../permissions/permissions';
import { CLIENT_ROLES, type ClientRole } from '../../../permissions/roles';
import { CLIENT_USER_STATUS, type ClientUser } from '../../../types/auth';
import { formatDate, formatRoleLabel } from '../../../utils/formatters';

export interface UserTableProps {
  readonly users: readonly ClientUser[];
  readonly isLoading?: boolean;
  readonly currentUserId?: string;
  readonly onEditUser: (user: ClientUser) => void;
  readonly onAssignRole?: (user: ClientUser) => void;
  readonly onSuspendUser: (user: ClientUser) => void;
  readonly onReactivateUser: (user: ClientUser) => void;
  readonly onDeactivateUser: (user: ClientUser) => void;
}

function getRoleBadgeVariant(role: ClientRole): BadgeVariant {
  switch (role) {
    case CLIENT_ROLES.ORG_ADMIN:
      return 'primary';
    case CLIENT_ROLES.HR_MANAGER:
      return 'info';
    case CLIENT_ROLES.PAYROLL_ADMIN:
      return 'warning';
    case CLIENT_ROLES.DEPARTMENT_HEAD:
      return 'neutral';
    case CLIENT_ROLES.EMPLOYEE:
    default:
      return 'neutral';
  }
}

function getStatusBadgeVariant(status?: string): BadgeVariant {
  switch (status) {
    case CLIENT_USER_STATUS.ACTIVE:
      return 'success';
    case CLIENT_USER_STATUS.INVITED:
      return 'info';
    case CLIENT_USER_STATUS.SUSPENDED:
      return 'warning';
    case CLIENT_USER_STATUS.DISABLED:
      return 'danger';
    default:
      return 'neutral';
  }
}

function getStatusLabel(status?: string): string {
  switch (status) {
    case CLIENT_USER_STATUS.ACTIVE:
      return 'Active';
    case CLIENT_USER_STATUS.INVITED:
      return 'Invited';
    case CLIENT_USER_STATUS.SUSPENDED:
      return 'Suspended';
    case CLIENT_USER_STATUS.DISABLED:
      return 'Disabled';
    default:
      return status || 'Unknown';
  }
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading = false,
  currentUserId,
  onEditUser,
  onAssignRole,
  onSuspendUser,
  onReactivateUser,
  onDeactivateUser,
}) => {
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
      <Table containerClassName="user-management-table" aria-label="Organization users directory">
        <TableHeader>
          <TableRow>
            <TableHead style={{ minWidth: '220px' }}>User</TableHead>
            <TableHead style={{ minWidth: '200px' }}>Email</TableHead>
            <TableHead style={{ minWidth: '150px' }}>Role</TableHead>
            <TableHead style={{ minWidth: '120px' }}>Status</TableHead>
            <TableHead style={{ minWidth: '160px' }}>Last Activity</TableHead>
            <TableHead style={{ minWidth: '200px', textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableLoadingRows rows={5} columns={6} />
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-4)' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  No users found matching your search or filters.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isSelf = currentUserId ? user.id === currentUserId || user.authUid === currentUserId : false;
              const fullName = `${user.firstName} ${user.lastName}`.trim() || user.displayName || user.email;

              return (
                <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                  {/* User Identity Column */}
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <Avatar
                        firstName={user.firstName}
                        lastName={user.lastName}
                        src={user.photoURL || user.avatarUrl}
                        size="sm"
                        presence={user.status === CLIENT_USER_STATUS.ACTIVE ? 'online' : undefined}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <span
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontWeight: 600,
                              color: 'var(--color-text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {fullName}
                          </span>
                          {isSelf && (
                            <Badge variant="info" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              You
                            </Badge>
                          )}
                        </div>
                        {user.displayName && user.displayName !== fullName && (
                          <span
                            style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            @{user.displayName}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Email Column */}
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <span
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {user.email}
                      </span>
                      {user.isEmailVerified && (
                        <span
                          title="Verified Email"
                          aria-label="Verified Email"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: 'var(--color-success)',
                            marginLeft: 'var(--space-1)',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Role Column */}
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {formatRoleLabel(user.role)}
                    </Badge>
                  </TableCell>

                  {/* Status Column */}
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status)}>
                      {getStatusLabel(user.status)}
                    </Badge>
                  </TableCell>

                  {/* Last Activity Column */}
                  <TableCell>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {user.lastLoginAt
                        ? formatDate(user.lastLoginAt, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : user.status === CLIENT_USER_STATUS.INVITED
                        ? 'Invitation pending'
                        : 'Never signed in'}
                    </span>
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 'var(--space-1)',
                      }}
                    >
                      {/* Edit User Button */}
                      <PermissionButton
                        permission={PERMISSIONS.USERS_EDIT}
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditUser(user)}
                        aria-label={`Edit ${fullName}`}
                        title="Edit user profile, roles, and permissions"
                        style={{ padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}
                      >
                        Edit
                      </PermissionButton>

                      {/* Assign Role Button */}
                      {onAssignRole && (
                        <PermissionButton
                          permission={PERMISSIONS.USERS_EDIT}
                          variant="ghost"
                          size="sm"
                          onClick={() => onAssignRole(user)}
                          aria-label={`Change role for ${fullName}`}
                          title="Assign or change organizational role"
                          style={{ padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-primary-default, #2563eb)' }}
                        >
                          Role
                        </PermissionButton>
                      )}

                      {/* Suspend User Button (for active or invited users) */}
                      {(user.status === CLIENT_USER_STATUS.ACTIVE || user.status === CLIENT_USER_STATUS.INVITED) && (
                        <PermissionButton
                          permission={PERMISSIONS.USERS_SUSPEND}
                          variant="ghost"
                          size="sm"
                          onClick={() => onSuspendUser(user)}
                          disabled={isSelf}
                          disableUnauthorized={false}
                          aria-label={`Suspend ${fullName}`}
                          title={isSelf ? 'You cannot suspend your own account' : 'Temporarily suspend user access'}
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: 'var(--text-xs)',
                            color: isSelf ? 'var(--color-text-muted)' : 'var(--color-warning-text)',
                          }}
                        >
                          Suspend
                        </PermissionButton>
                      )}

                      {/* Reactivate User Button (for suspended users) */}
                      {user.status === CLIENT_USER_STATUS.SUSPENDED && (
                        <PermissionButton
                          permission={PERMISSIONS.USERS_SUSPEND}
                          variant="ghost"
                          size="sm"
                          onClick={() => onReactivateUser(user)}
                          aria-label={`Reactivate ${fullName}`}
                          title="Restore active access for user"
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-success)',
                          }}
                        >
                          Reactivate
                        </PermissionButton>
                      )}

                      {/* Deactivate User Button (soft delete for non-disabled users) */}
                      {user.status !== CLIENT_USER_STATUS.DISABLED && (
                        <PermissionButton
                          permission={PERMISSIONS.USERS_DELETE}
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeactivateUser(user)}
                          disabled={isSelf}
                          disableUnauthorized={false}
                          aria-label={`Deactivate ${fullName}`}
                          title={isSelf ? 'You cannot deactivate your own account' : 'Deactivate user (revokes portal access)'}
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: 'var(--text-xs)',
                            color: isSelf ? 'var(--color-text-muted)' : 'var(--color-error)',
                          }}
                        >
                          Deactivate
                        </PermissionButton>
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
