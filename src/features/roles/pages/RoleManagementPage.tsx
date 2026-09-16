import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageContainer } from '../../../layouts/PageContainer';
import { PermissionButton } from '../../../components/ui/PermissionButton';
import { Pagination } from '../../../components/ui/Pagination';
import { Alert } from '../../../components/ui/Alert';
import { ConfirmationDialog } from '../../../components/feedback/ConfirmationDialog';
import { PERMISSIONS, type PermissionKey } from '../../../permissions/permissions';
import { roleService } from '../../../services/role/roleService';
import { clientDataService } from '../../../services/client/clientDataService';
import { useClient } from '../../../routes/ClientContext';
import { RoleTable } from '../components/RoleTable';
import { RoleFilters } from '../components/RoleFilters';
import { CreateRoleModal } from '../components/CreateRoleModal';
import { EditRoleModal } from '../components/EditRoleModal';
import { RoleDetailModal } from '../components/RoleDetailModal';
import type { Role, RoleStatus } from '../../../types/role';
import type { RoleFilterState, RoleDeleteState } from '../types';

export const RoleManagementPage: React.FC = () => {
  const { organizationId } = useClient();

  // Roles State
  const [roles, setRoles] = useState<readonly Role[]>([]);
  const [userCountMap, setUserCountMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Status Alerts
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<RoleFilterState>({
    search: '',
    type: 'all',
    status: 'all',
  });

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  const [inspectingRole, setInspectingRole] = useState<Role | null>(null);

  const [deleteModalState, setDeleteModalState] = useState<RoleDeleteState>({
    isOpen: false,
    role: null,
    assignedUsersCount: 0,
  });
  const [isDeletingRole, setIsDeletingRole] = useState<boolean>(false);

  // Load roles and assigned user counts
  const loadRolesAndUsers = useCallback(async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const [roleList, userList] = await Promise.all([
        roleService.listRoles(),
        clientDataService.listClientUsers().catch(() => []),
      ]);

      // Calculate user counts per role
      const counts: Record<string, number> = {};
      for (const u of userList) {
        if (u.role) {
          counts[u.role] = (counts[u.role] || 0) + 1;
        }
        if (u.roleId) {
          counts[u.roleId] = (counts[u.roleId] || 0) + 1;
        }
        if (u.roleIds && Array.isArray(u.roleIds)) {
          for (const rid of u.roleIds) {
            counts[rid] = (counts[rid] || 0) + 1;
          }
        }
      }

      setRoles(roleList);
      setUserCountMap(counts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load organizational roles.';
      setGeneralError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    Promise.all([
      roleService.listRoles(),
      clientDataService.listClientUsers().catch(() => []),
    ])
      .then(([roleList, userList]) => {
        if (!isSubscribed) return;

        const counts: Record<string, number> = {};
        for (const u of userList) {
          if (u.role) counts[u.role] = (counts[u.role] || 0) + 1;
          if (u.roleId) counts[u.roleId] = (counts[u.roleId] || 0) + 1;
          if (u.roleIds && Array.isArray(u.roleIds)) {
            for (const rid of u.roleIds) {
              counts[rid] = (counts[rid] || 0) + 1;
            }
          }
        }

        setRoles(roleList);
        setUserCountMap(counts);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!isSubscribed) return;
        const msg = err instanceof Error ? err.message : 'Failed to load organizational roles.';
        setGeneralError(msg);
        setIsLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [organizationId]);

  // Filter roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      // Type filter
      if (filters.type === 'system' && !role.isSystemRole) return false;
      if (filters.type === 'custom' && !role.isCustomRole) return false;

      // Status filter
      if (filters.status !== 'all' && role.status !== filters.status) return false;

      // Search filter (name, description, code)
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const matchesName = role.name.toLowerCase().includes(q);
        const matchesCode = role.code.toLowerCase().includes(q);
        const matchesDesc = role.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDesc) return false;
      }

      return true;
    });
  }, [roles, filters]);

  // Paginated roles
  const totalItems = filteredRoles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRoles.slice(startIndex, startIndex + pageSize);
  }, [filteredRoles, currentPage, pageSize]);

  // Create Role handler
  const handleCreateRole = async (input: {
    name: string;
    description: string;
    permissions: PermissionKey[];
  }) => {
    setIsSubmittingCreate(true);
    setGeneralError(null);
    try {
      const newRole = await roleService.createCustomRole({
        name: input.name,
        description: input.description,
        permissionIds: input.permissions,
      });

      setIsCreateOpen(false);
      setSuccessMessage(`Custom role "${newRole.name}" created successfully.`);
      await loadRolesAndUsers();
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Edit Role handler
  const handleEditRole = async (
    roleId: string,
    updates: {
      name: string;
      description: string;
      status: RoleStatus;
      permissions: PermissionKey[];
    }
  ) => {
    setIsSubmittingEdit(true);
    setGeneralError(null);
    try {
      const updated = await roleService.updateRole(roleId, {
        name: updates.name,
        description: updates.description,
        status: updates.status,
        permissionIds: updates.permissions,
      });

      setEditingRole(null);
      setSuccessMessage(`Role "${updated.name}" updated successfully.`);
      await loadRolesAndUsers();
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Delete initiation handler
  const handleInitiateDelete = (role: Role) => {
    const assignedCount = userCountMap[role.id] ?? userCountMap[role.code] ?? 0;
    setDeleteModalState({
      isOpen: true,
      role,
      assignedUsersCount: assignedCount,
    });
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deleteModalState.role) return;
    setIsDeletingRole(true);
    setGeneralError(null);
    try {
      await roleService.deleteRole(deleteModalState.role.id);
      const deletedName = deleteModalState.role.name;
      setDeleteModalState({ isOpen: false, role: null, assignedUsersCount: 0 });
      setSuccessMessage(`Custom role "${deletedName}" has been successfully deleted.`);
      await loadRolesAndUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete role.';
      setGeneralError(msg);
      setDeleteModalState({ isOpen: false, role: null, assignedUsersCount: 0 });
    } finally {
      setIsDeletingRole(false);
    }
  };

  return (
    <PageContainer
      title="Roles & Permissions"
      description="Define organizational access control policies, system archetypes, and custom roles with granular permissions."
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Roles & Permissions', path: '/settings/roles' },
      ]}
      actions={
        <PermissionButton
          permission={PERMISSIONS.ROLES_CREATE}
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          aria-label="Create Custom Role"
        >
          Create Custom Role
        </PermissionButton>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Alerts */}
        {generalError && (
          <Alert variant="error" title="Action Failed" onDismiss={() => setGeneralError(null)}>
            {generalError}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" title="Success" onDismiss={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {/* Filters */}
        <RoleFilters
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            setPage(1);
          }}
          onResetFilters={() => {
            setFilters({ search: '', type: 'all', status: 'all' });
            setPage(1);
          }}
          totalMatches={totalItems}
          totalRoles={roles.length}
        />

        {/* Table */}
        <RoleTable
          roles={paginatedRoles}
          userCountMap={userCountMap}
          isLoading={isLoading}
          onViewRole={(role) => setInspectingRole(role)}
          onEditRole={(role) => setEditingRole(role)}
          onDeleteRole={handleInitiateDelete}
        />

        {/* Pagination */}
        {totalItems > 0 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setPage(1);
            }}
          />
        )}

        {/* Modals */}
        <CreateRoleModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateRole}
          isSubmitting={isSubmittingCreate}
        />

        <EditRoleModal
          isOpen={Boolean(editingRole)}
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onSubmit={handleEditRole}
          isSubmitting={isSubmittingEdit}
        />

        <RoleDetailModal
          isOpen={Boolean(inspectingRole)}
          role={inspectingRole}
          assignedUsersCount={
            inspectingRole
              ? userCountMap[inspectingRole.id] ?? userCountMap[inspectingRole.code] ?? 0
              : 0
          }
          onClose={() => setInspectingRole(null)}
        />

        {/* Delete Confirmation or Block Dialog */}
        {deleteModalState.assignedUsersCount > 0 ? (
          <ConfirmationDialog
            isOpen={deleteModalState.isOpen}
            onClose={() => setDeleteModalState({ isOpen: false, role: null, assignedUsersCount: 0 })}
            onConfirm={() => setDeleteModalState({ isOpen: false, role: null, assignedUsersCount: 0 })}
            title="Cannot Delete Role"
            message={
              <div>
                <p style={{ margin: 0 }}>
                  The role <strong>{deleteModalState.role?.name}</strong> cannot be deleted because{' '}
                  <strong>
                    {deleteModalState.assignedUsersCount}{' '}
                    {deleteModalState.assignedUsersCount === 1 ? 'user is' : 'users are'}
                  </strong>{' '}
                  currently assigned to it.
                </p>
                <p style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
                  To maintain organizational integrity and prevent orphaned users, you must reassign all
                  assigned users to another role before deleting this role.
                </p>
              </div>
            }
            confirmText="Understood"
            cancelText="Close"
            isDestructive={false}
          />
        ) : (
          <ConfirmationDialog
            isOpen={deleteModalState.isOpen}
            onClose={() => setDeleteModalState({ isOpen: false, role: null, assignedUsersCount: 0 })}
            onConfirm={handleConfirmDelete}
            title="Delete Custom Role"
            message={
              <div>
                <p style={{ margin: 0 }}>
                  Are you sure you want to permanently delete the custom role{' '}
                  <strong>{deleteModalState.role?.name}</strong>?
                </p>
                <p
                  style={{
                    marginTop: 'var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  No users are currently assigned to this role. This action cannot be undone.
                </p>
              </div>
            }
            confirmText="Delete Role"
            cancelText="Cancel"
            isDestructive={true}
            isLoading={isDeletingRole}
          />
        )}
      </div>
    </PageContainer>
  );
};
