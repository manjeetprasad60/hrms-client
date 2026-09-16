import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageContainer } from '../../../layouts/PageContainer';
import { PermissionButton } from '../../../components/ui/PermissionButton';
import { Pagination } from '../../../components/ui/Pagination';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { ConfirmationDialog } from '../../../components/feedback/ConfirmationDialog';
import { PERMISSIONS } from '../../../permissions/permissions';
import {
  CLIENT_USER_STATUS,
  type ClientUser,
  type ClientUserStatus,
  type UpdateClientUserInput,
} from '../../../types/auth';
import {
  USER_INVITATION_STATUS,
  type UserInvitation,
  type CreateInvitationInput,
} from '../../../types/invitation';
import { clientDataService } from '../../../services/client/clientDataService';
import { invitationService } from '../../../services/invitation/invitationService';
import { useClient } from '../../../routes/ClientContext';
import { UserTable } from '../components/UserTable';
import { InvitationTable } from '../components/InvitationTable';
import { UserFilters } from '../components/UserFilters';
import { InviteUserModal } from '../components/InviteUserModal';
import { UserDetailModal } from '../components/UserDetailModal';
import { AssignRoleModal } from '../components/AssignRoleModal';
import type { UserFilterState, UserLifecycleModalState } from '../types';

export const UserManagementPage: React.FC = () => {
  const { clientUser, organizationId } = useClient();

  // Tab State
  const [activeTab, setActiveTab] = useState<'users' | 'invitations'>('users');

  // Users State
  const [users, setUsers] = useState<readonly ClientUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);

  // Invitations State
  const [invitations, setInvitations] = useState<readonly UserInvitation[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState<boolean>(true);

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters State (for users tab)
  const [filters, setFilters] = useState<UserFilterState>({
    search: '',
    role: 'all',
    status: 'all',
  });

  // Pagination State (for users tab)
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals State
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState<boolean>(false);

  const [editingUser, setEditingUser] = useState<ClientUser | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  const [assigningRoleUser, setAssigningRoleUser] = useState<ClientUser | null>(null);
  const [isSubmittingRoleAssign, setIsSubmittingRoleAssign] = useState<boolean>(false);

  const [lifecycleModal, setLifecycleModal] = useState<UserLifecycleModalState>({
    isOpen: false,
    targetUser: null,
    action: null,
  });
  const [isSubmittingLifecycle, setIsSubmittingLifecycle] = useState<boolean>(false);

  // Invitation Revoke Modal State
  const [revokingInvitation, setRevokingInvitation] = useState<UserInvitation | null>(null);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);

  // Reload helpers
  const refreshUsers = useCallback(async () => {
    try {
      const userList = await clientDataService.listClientUsers();
      setUsers(userList);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reload users.';
      setGeneralError(message);
    }
  }, []);

  const refreshInvitations = useCallback(async () => {
    try {
      const inviteList = await invitationService.listInvitations();
      setInvitations(inviteList);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reload invitations.';
      setGeneralError(message);
    }
  }, []);

  // Initial loads on mount or organization change
  useEffect(() => {
    let isSubscribed = true;

    clientDataService
      .listClientUsers()
      .then((userList) => {
        if (isSubscribed) {
          setUsers(userList);
          setIsLoadingUsers(false);
        }
      })
      .catch((err: unknown) => {
        if (isSubscribed) {
          const message = err instanceof Error ? err.message : 'Failed to load organization users.';
          setGeneralError(message);
          setIsLoadingUsers(false);
        }
      });

    invitationService
      .listInvitations()
      .then((inviteList) => {
        if (isSubscribed) {
          setInvitations(inviteList);
          setIsLoadingInvitations(false);
        }
      })
      .catch(() => {
        if (isSubscribed) {
          setIsLoadingInvitations(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [organizationId]);

  // Handle filter changes and auto-reset pagination
  const handleFiltersChange = (newFilters: UserFilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      status: 'all',
    });
    setPage(1);
  };

  // Filter and Sort Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search Query
      if (filters.search.trim()) {
        const query = filters.search.trim().toLowerCase();
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        const displayName = (u.displayName || '').toLowerCase();
        const matchesName = fullName.includes(query) || displayName.includes(query);
        const matchesEmail = email.includes(query);
        if (!matchesName && !matchesEmail) {
          return false;
        }
      }

      // 2. Role Filter
      if (filters.role !== 'all') {
        if (u.role !== filters.role) {
          return false;
        }
      }

      // 3. Status Filter
      if (filters.status !== 'all') {
        if (u.status !== filters.status) {
          return false;
        }
      }

      return true;
    });
  }, [users, filters]);

  // Paginated Users Slice
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  // Pending invitations count for badge indicator
  const pendingInvitationsCount = useMemo(() => {
    return invitations.filter((inv) => inv.status === USER_INVITATION_STATUS.PENDING).length;
  }, [invitations]);

  // Flash Success Message Helper
  const flashSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage((prev) => (prev === message ? null : prev));
    }, 4000);
  };

  // Handle Invite User (Step 7 Flow)
  const handleInviteUser = async (input: CreateInvitationInput) => {
    setIsSubmittingInvite(true);
    try {
      await invitationService.createInvitation(input);
      flashSuccess(`Invitation email dispatched to ${input.email}. Access will activate upon setup.`);
      await refreshInvitations();
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  // Handle Edit User
  const handleSaveUser = async (userId: string, updates: UpdateClientUserInput) => {
    setIsSavingEdit(true);
    try {
      await clientDataService.updateClientUser(userId, updates);
      flashSuccess('User profile and access updated successfully.');
      await refreshUsers();
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Assign Role (Step 11 Flow)
  const handleAssignRole = async (userId: string, roleCode: string) => {
    setIsSubmittingRoleAssign(true);
    try {
      await clientDataService.updateClientUser(userId, { role: roleCode as ClientUser['role'] });
      flashSuccess('Role and operational permissions successfully updated.');
      await refreshUsers();
    } finally {
      setIsSubmittingRoleAssign(false);
    }
  };

  // Lifecycle Action Handlers
  const handleOpenSuspend = (user: ClientUser) => {
    setLifecycleModal({
      isOpen: true,
      targetUser: user,
      action: 'suspend',
    });
  };

  const handleOpenReactivate = (user: ClientUser) => {
    setLifecycleModal({
      isOpen: true,
      targetUser: user,
      action: 'reactivate',
    });
  };

  const handleOpenDeactivate = (user: ClientUser) => {
    setLifecycleModal({
      isOpen: true,
      targetUser: user,
      action: 'deactivate',
    });
  };

  const handleConfirmLifecycle = async () => {
    if (!lifecycleModal.targetUser || !lifecycleModal.action) return;
    const { targetUser, action } = lifecycleModal;
    setIsSubmittingLifecycle(true);

    try {
      let nextStatus: ClientUserStatus = CLIENT_USER_STATUS.ACTIVE;
      let successNote = '';

      if (action === 'suspend') {
        nextStatus = CLIENT_USER_STATUS.SUSPENDED;
        successNote = `User access for ${targetUser.email} has been suspended.`;
      } else if (action === 'reactivate') {
        nextStatus = CLIENT_USER_STATUS.ACTIVE;
        successNote = `User access for ${targetUser.email} has been reactivated.`;
      } else if (action === 'deactivate') {
        nextStatus = CLIENT_USER_STATUS.DISABLED;
        successNote = `User ${targetUser.email} has been deactivated (soft delete). Historical records remain preserved.`;
      }

      await clientDataService.setClientUserStatus(targetUser.id, nextStatus);
      flashSuccess(successNote);
      setLifecycleModal({ isOpen: false, targetUser: null, action: null });
      await refreshUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update user status.';
      setGeneralError(message);
    } finally {
      setIsSubmittingLifecycle(false);
    }
  };

  // Invitation Action Handlers
  const handleResendInvitation = async (invitation: UserInvitation) => {
    try {
      await invitationService.resendInvitation(invitation.id);
      flashSuccess(`Invitation re-sent to ${invitation.email}. Expiration has been extended.`);
      await refreshInvitations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resend invitation.';
      setGeneralError(msg);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokingInvitation) return;
    setIsRevoking(true);
    try {
      await invitationService.revokeInvitation(revokingInvitation.id);
      flashSuccess(`Invitation for ${revokingInvitation.email} has been revoked.`);
      setRevokingInvitation(null);
      await refreshInvitations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to revoke invitation.';
      setGeneralError(msg);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <PageContainer
      title="User Management"
      description="Provision client user accounts, assign roles, and manage access within your organization."
      breadcrumbs={[
        { label: 'Settings', path: '/settings' },
        { label: 'Users' },
      ]}
      actions={
        <PermissionButton
          permission={PERMISSIONS.USERS_INVITE}
          variant="primary"
          onClick={() => setIsInviteOpen(true)}
          title="Invite a new user to this organization"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ marginRight: 'var(--space-2)' }}
            aria-hidden="true"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Invite User
        </PermissionButton>
      }
    >
      {/* Success Notification Alert */}
      {successMessage && (
        <Alert variant="success" onDismiss={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Error Notification Alert */}
      {generalError && (
        <Alert variant="error" onDismiss={() => setGeneralError(null)}>
          {generalError}
        </Alert>
      )}

      {/* Sub-Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--color-border-default)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--text-sm)',
            fontWeight: activeTab === 'users' ? 600 : 500,
            color: activeTab === 'users' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'users' ? '2px solid var(--color-primary)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '-1px',
            transition: 'color var(--transition-fast)',
          }}
        >
          <span>Users</span>
          <Badge variant="neutral" style={{ fontSize: '11px', padding: '1px 6px' }}>
            {users.length}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invitations')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--text-sm)',
            fontWeight: activeTab === 'invitations' ? 600 : 500,
            color: activeTab === 'invitations' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'invitations' ? '2px solid var(--color-primary)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '-1px',
            transition: 'color var(--transition-fast)',
          }}
        >
          <span>Invitations</span>
          {pendingInvitationsCount > 0 ? (
            <Badge variant="info" style={{ fontSize: '11px', padding: '1px 6px' }}>
              {pendingInvitationsCount} pending
            </Badge>
          ) : (
            <Badge variant="neutral" style={{ fontSize: '11px', padding: '1px 6px' }}>
              {invitations.length}
            </Badge>
          )}
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* Filter and Search Controls */}
          <UserFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onResetFilters={handleResetFilters}
            totalMatches={filteredUsers.length}
            totalUsers={users.length}
          />

          {/* Enterprise Users Table */}
          <UserTable
            users={paginatedUsers}
            isLoading={isLoadingUsers}
            currentUserId={clientUser?.id}
            onEditUser={(user) => setEditingUser(user)}
            onAssignRole={(user) => setAssigningRoleUser(user)}
            onSuspendUser={handleOpenSuspend}
            onReactivateUser={handleOpenReactivate}
            onDeactivateUser={handleOpenDeactivate}
          />

          {/* Pagination Controls */}
          {!isLoadingUsers && filteredUsers.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              pageSize={pageSize}
              pageSizeOptions={[10, 25, 50]}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
          )}
        </>
      ) : (
        /* Organization Invitations Directory */
        <InvitationTable
          invitations={invitations}
          isLoading={isLoadingInvitations}
          onResend={handleResendInvitation}
          onRevoke={(inv) => setRevokingInvitation(inv)}
        />
      )}

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInviteUser}
        isSubmitting={isSubmittingInvite}
      />

      {/* Edit User Modal */}
      <UserDetailModal
        isOpen={editingUser !== null}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveUser}
        isSaving={isSavingEdit}
      />

      {/* Assign Role Modal */}
      <AssignRoleModal
        isOpen={assigningRoleUser !== null}
        user={assigningRoleUser}
        onClose={() => setAssigningRoleUser(null)}
        onAssignRole={handleAssignRole}
        isSubmitting={isSubmittingRoleAssign}
      />

      {/* Confirmation Dialog for Lifecycle Status Actions */}
      <ConfirmationDialog
        isOpen={lifecycleModal.isOpen}
        onClose={() => setLifecycleModal({ isOpen: false, targetUser: null, action: null })}
        onConfirm={handleConfirmLifecycle}
        isLoading={isSubmittingLifecycle}
        isDestructive={lifecycleModal.action === 'deactivate' || lifecycleModal.action === 'suspend'}
        confirmText={
          lifecycleModal.action === 'suspend'
            ? 'Suspend User'
            : lifecycleModal.action === 'reactivate'
            ? 'Reactivate User'
            : 'Deactivate User'
        }
        title={
          lifecycleModal.action === 'suspend'
            ? 'Suspend User Access'
            : lifecycleModal.action === 'reactivate'
            ? 'Reactivate User Access'
            : 'Deactivate User Account'
        }
        message={
          lifecycleModal.action === 'suspend' ? (
            <div>
              Are you sure you want to suspend portal access for{' '}
              <strong>{lifecycleModal.targetUser?.displayName || lifecycleModal.targetUser?.email}</strong>?
              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                The user will be temporarily blocked from signing in, but their record and assigned data will remain intact.
              </p>
            </div>
          ) : lifecycleModal.action === 'reactivate' ? (
            <div>
              Are you sure you want to restore active portal access for{' '}
              <strong>{lifecycleModal.targetUser?.displayName || lifecycleModal.targetUser?.email}</strong>?
            </div>
          ) : (
            <div>
              Are you sure you want to deactivate{' '}
              <strong>{lifecycleModal.targetUser?.displayName || lifecycleModal.targetUser?.email}</strong>?
              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                <strong>Non-destructive action:</strong> To comply with enterprise HR audit and retention policies, this account will be marked as disabled rather than deleted. Portal access is revoked immediately while workforce history and timesheet records remain preserved.
              </p>
            </div>
          )
        }
      />

      {/* Confirmation Dialog for Revoking Invitation */}
      <ConfirmationDialog
        isOpen={revokingInvitation !== null}
        onClose={() => setRevokingInvitation(null)}
        onConfirm={handleConfirmRevoke}
        isLoading={isRevoking}
        isDestructive={true}
        confirmText="Revoke Invitation"
        title="Revoke User Invitation"
        message={
          <div>
            Are you sure you want to revoke the invitation sent to{' '}
            <strong>{revokingInvitation?.email}</strong>?
            <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              The secure setup link sent to the user will be invalidated immediately. They will not be able to set up an account with this link.
            </p>
          </div>
        }
      />
    </PageContainer>
  );
};
