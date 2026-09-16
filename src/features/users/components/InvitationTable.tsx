import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Badge, type BadgeVariant } from '../../../components/ui/Badge';
import { PermissionButton } from '../../../components/ui/PermissionButton';
import { TableLoadingRows } from '../../../components/feedback/Loading/TableLoading';
import { PERMISSIONS } from '../../../permissions/permissions';
import { CLIENT_ROLES, type ClientRole } from '../../../permissions/roles';
import { USER_INVITATION_STATUS, type UserInvitation, type UserInvitationStatus } from '../../../types/invitation';
import { formatDate, formatRoleLabel } from '../../../utils/formatters';

export interface InvitationTableProps {
  readonly invitations: readonly UserInvitation[];
  readonly isLoading?: boolean;
  readonly onResend: (invitation: UserInvitation) => void;
  readonly onRevoke: (invitation: UserInvitation) => void;
}

function getInvitationStatusVariant(status: UserInvitationStatus): BadgeVariant {
  switch (status) {
    case USER_INVITATION_STATUS.PENDING:
      return 'info';
    case USER_INVITATION_STATUS.ACCEPTED:
      return 'success';
    case USER_INVITATION_STATUS.EXPIRED:
      return 'warning';
    case USER_INVITATION_STATUS.REVOKED:
      return 'danger';
    default:
      return 'neutral';
  }
}

function getInvitationStatusLabel(status: UserInvitationStatus): string {
  switch (status) {
    case USER_INVITATION_STATUS.PENDING:
      return 'Pending';
    case USER_INVITATION_STATUS.ACCEPTED:
      return 'Accepted';
    case USER_INVITATION_STATUS.EXPIRED:
      return 'Expired';
    case USER_INVITATION_STATUS.REVOKED:
      return 'Revoked';
    default:
      return status;
  }
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

export const InvitationTable: React.FC<InvitationTableProps> = ({
  invitations,
  isLoading = false,
  onResend,
  onRevoke,
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
      <Table containerClassName="invitation-table" aria-label="Organization user invitations">
        <TableHeader>
          <TableRow>
            <TableHead style={{ minWidth: '220px' }}>Invitee</TableHead>
            <TableHead style={{ minWidth: '150px' }}>Role</TableHead>
            <TableHead style={{ minWidth: '120px' }}>Status</TableHead>
            <TableHead style={{ minWidth: '160px' }}>Sent Date</TableHead>
            <TableHead style={{ minWidth: '160px' }}>Expires</TableHead>
            <TableHead style={{ minWidth: '180px', textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableLoadingRows rows={4} columns={6} />
          ) : invitations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-4)' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  No pending or past invitations found.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            invitations.map((inv) => {
              const fullName = `${inv.firstName} ${inv.lastName}`.trim() || inv.email;
              const isPendingOrExpired =
                inv.status === USER_INVITATION_STATUS.PENDING || inv.status === USER_INVITATION_STATUS.EXPIRED;

              return (
                <TableRow key={inv.id} data-testid={`invitation-row-${inv.id}`}>
                  {/* Invitee Column */}
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {fullName}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                        {inv.email}
                      </span>
                    </div>
                  </TableCell>

                  {/* Role Column */}
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(inv.role)}>
                      {formatRoleLabel(inv.role)}
                    </Badge>
                  </TableCell>

                  {/* Status Column */}
                  <TableCell>
                    <Badge variant={getInvitationStatusVariant(inv.status)}>
                      {getInvitationStatusLabel(inv.status)}
                    </Badge>
                  </TableCell>

                  {/* Sent Date Column */}
                  <TableCell>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {formatDate(inv.createdAt, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </TableCell>

                  {/* Expiration Date Column */}
                  <TableCell>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {formatDate(inv.expiresAt, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
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
                      {/* Resend Action */}
                      <PermissionButton
                        permission={PERMISSIONS.USERS_INVITE}
                        anyPermissions={[PERMISSIONS.USERS_INVITE, PERMISSIONS.USERS_CREATE]}
                        variant="ghost"
                        size="sm"
                        onClick={() => onResend(inv)}
                        disabled={!isPendingOrExpired}
                        disableUnauthorized={false}
                        aria-label={`Resend invitation to ${inv.email}`}
                        title={
                          isPendingOrExpired
                            ? 'Resend invitation email and extend expiration'
                            : 'Only pending or expired invitations can be resent'
                        }
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: 'var(--text-xs)',
                          opacity: isPendingOrExpired ? 1 : 0.4,
                        }}
                      >
                        Resend
                      </PermissionButton>

                      {/* Revoke Action */}
                      <PermissionButton
                        permission={PERMISSIONS.USERS_INVITE}
                        anyPermissions={[PERMISSIONS.USERS_INVITE, PERMISSIONS.USERS_CREATE]}
                        variant="ghost"
                        size="sm"
                        onClick={() => onRevoke(inv)}
                        disabled={inv.status !== USER_INVITATION_STATUS.PENDING && inv.status !== USER_INVITATION_STATUS.EXPIRED}
                        disableUnauthorized={false}
                        aria-label={`Revoke invitation for ${inv.email}`}
                        title="Revoke invitation link"
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-error)',
                          opacity: isPendingOrExpired ? 1 : 0.4,
                        }}
                      >
                        Revoke
                      </PermissionButton>
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
