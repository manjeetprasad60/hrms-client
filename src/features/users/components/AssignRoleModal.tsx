import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge, type BadgeVariant } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { Avatar } from '../../../components/ui/Avatar';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Spinner } from '../../../components/ui/Spinner';
import { useClient } from '../../../routes/ClientContext';
import { roleService } from '../../../services/role/roleService';
import { clientDataService } from '../../../services/client/clientDataService';
import {
  CLIENT_ROLES,
  canActorAssignRole,
} from '../../../permissions/roles';
import { PERMISSION_CATALOG } from '../../../permissions/registry';
import { formatRoleLabel } from '../../../utils/formatters';
import type { ClientUser } from '../../../types/auth';
import type { Role } from '../../../types/role';

export interface AssignRoleModalProps {
  readonly isOpen: boolean;
  readonly user: ClientUser | null;
  readonly onClose: () => void;
  readonly onAssignRole: (userId: string, roleCode: string) => Promise<void>;
  readonly isSubmitting?: boolean;
}

function getRoleBadgeVariant(roleCode: string): BadgeVariant {
  switch (roleCode) {
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

interface AssignRoleDialogContentProps {
  readonly user: ClientUser;
  readonly onClose: () => void;
  readonly onAssignRole: (userId: string, roleCode: string) => Promise<void>;
  readonly isSubmitting?: boolean;
}

const AssignRoleDialogContent: React.FC<AssignRoleDialogContentProps> = ({
  user,
  onClose,
  onAssignRole,
  isSubmitting = false,
}) => {
  const { role: actorRole, permissions: actorPermissions } = useClient();

  const [availableRoles, setAvailableRoles] = useState<readonly Role[]>([]);
  const [activeOrgAdminCount, setActiveOrgAdminCount] = useState<number>(1);
  const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(true);

  const [selectedRoleCode, setSelectedRoleCode] = useState<string>(
    user.role || CLIENT_ROLES.EMPLOYEE
  );
  const [isHighImpactAcknowledged, setIsHighImpactAcknowledged] = useState<boolean>(false);
  const [showPermissionDetails, setShowPermissionDetails] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Load roles and calculate admin count
  useEffect(() => {
    let isSubscribed = true;

    Promise.all([
      roleService.listRoles(),
      clientDataService.listClientUsers().catch(() => []),
    ])
      .then(([roles, users]) => {
        if (!isSubscribed) return;
        setAvailableRoles(roles);

        const adminCount = users.filter(
          (u) =>
            (u.role === CLIENT_ROLES.ORG_ADMIN || u.roleId === CLIENT_ROLES.ORG_ADMIN) &&
            u.status === 'active'
        ).length;
        setActiveOrgAdminCount(adminCount);
        setIsLoadingRoles(false);
      })
      .catch((err: unknown) => {
        if (!isSubscribed) return;
        const msg = err instanceof Error ? err.message : 'Failed to load roles.';
        setGeneralError(msg);
        setIsLoadingRoles(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Actor effective permissions
  const actorEffectivePerms = actorPermissions || [];

  // Current user's role object
  const currentRoleObj = useMemo(() => {
    return (
      availableRoles.find((r) => r.code === user.role || r.id === user.roleId) || null
    );
  }, [availableRoles, user]);

  // Selected new role object
  const selectedRoleObj = useMemo(() => {
    return availableRoles.find((r) => r.code === selectedRoleCode || r.id === selectedRoleCode) || null;
  }, [availableRoles, selectedRoleCode]);

  // Check if target user is sole active org_admin being demoted
  const isSoleAdminLockout = useMemo(() => {
    const isTargetCurrentlyAdmin =
      user.role === CLIENT_ROLES.ORG_ADMIN || user.roleId === CLIENT_ROLES.ORG_ADMIN;
    const isSelectingNonAdmin = selectedRoleCode !== CLIENT_ROLES.ORG_ADMIN;
    return isTargetCurrentlyAdmin && isSelectingNonAdmin && activeOrgAdminCount <= 1;
  }, [user, selectedRoleCode, activeOrgAdminCount]);

  // Permission difference analysis
  const { permissionsGained, permissionsRevoked, isHighImpact } = useMemo(() => {
    const currentPerms = new Set(currentRoleObj?.permissionIds || currentRoleObj?.permissions || []);
    const newPerms = new Set(selectedRoleObj?.permissionIds || selectedRoleObj?.permissions || []);

    const gained: string[] = [];
    const revoked: string[] = [];

    newPerms.forEach((p) => {
      if (!currentPerms.has(p)) gained.push(p);
    });

    currentPerms.forEach((p) => {
      if (!newPerms.has(p)) revoked.push(p);
    });

    const involvesAdmin =
      selectedRoleCode === CLIENT_ROLES.ORG_ADMIN ||
      user.role === CLIENT_ROLES.ORG_ADMIN ||
      selectedRoleCode === CLIENT_ROLES.PAYROLL_ADMIN ||
      user.role === CLIENT_ROLES.PAYROLL_ADMIN;

    const highImpact = involvesAdmin || revoked.length >= 3;

    return {
      permissionsGained: gained,
      permissionsRevoked: revoked,
      isHighImpact: highImpact,
    };
  }, [currentRoleObj, selectedRoleObj, selectedRoleCode, user.role]);

  const hasRoleChanged = user.role !== selectedRoleCode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasRoleChanged || isSoleAdminLockout) return;

    if (isHighImpact && !isHighImpactAcknowledged) {
      setGeneralError('Please acknowledge the high-impact access change before proceeding.');
      return;
    }

    setGeneralError(null);
    try {
      await onAssignRole(user.id, selectedRoleCode);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assign role.';
      setGeneralError(msg);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Assign Role & Permissions"
      description="Update organizational role assignment and review access permission changes."
      className="max-w-2xl"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={
              isSubmitting ||
              isLoadingRoles ||
              !hasRoleChanged ||
              isSoleAdminLockout ||
              (isHighImpact && !isHighImpactAcknowledged)
            }
          >
            Confirm Role Assignment
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {generalError && (
          <Alert variant="error" onDismiss={() => setGeneralError(null)}>
            {generalError}
          </Alert>
        )}

        {/* Target User Summary Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-hover)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-default)',
          }}
        >
          <Avatar firstName={user.firstName} lastName={user.lastName} src={user.photoURL} size="md" />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                {user.displayName || `${user.firstName} ${user.lastName}`}
              </span>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                Current: {formatRoleLabel(user.role)}
              </Badge>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {user.email}
            </span>
          </div>
        </div>

        {/* Sole Admin Lockout Warning */}
        {isSoleAdminLockout && (
          <Alert variant="warning" title="Sole Administrator Lockout Guard">
            This user is currently the <strong>sole active Organization Administrator</strong>.
            You cannot reassign or demote this user until another active administrator is provisioned.
          </Alert>
        )}

        {/* Role Selection Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Select New Assigned Role
          </label>

          {isLoadingRoles ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-4)' }}>
              <Spinner size="sm" />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Loading roles catalog...</span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                maxHeight: '260px',
                overflowY: 'auto',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2)',
              }}
            >
              {availableRoles.map((r) => {
                const isSelected = selectedRoleCode === r.code;
                const isCurrent = user.role === r.code;
                const rolePerms = r.permissionIds || r.permissions || [];
                const isAssignable = canActorAssignRole(
                  actorRole,
                  actorEffectivePerms,
                  r.code,
                  rolePerms
                );

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      if (isAssignable) {
                        setSelectedRoleCode(r.code);
                        setIsHighImpactAcknowledged(false);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected
                        ? '1px solid var(--color-primary-default, #2563eb)'
                        : '1px solid var(--color-border-subtle)',
                      backgroundColor: isSelected
                        ? 'var(--color-primary-subtle, #eff6ff)'
                        : 'var(--color-surface)',
                      opacity: isAssignable ? 1 : 0.45,
                      cursor: isAssignable ? 'pointer' : 'not-allowed',
                      transition: 'background-color 0.15s ease',
                    }}
                    title={
                      !isAssignable
                        ? 'You cannot assign a role with privileges exceeding your own.'
                        : undefined
                    }
                  >
                    <input
                      type="radio"
                      id={`role-select-${r.id}`}
                      name="role-assignment"
                      checked={isSelected}
                      onChange={() => {
                        if (isAssignable) {
                          setSelectedRoleCode(r.code);
                          setIsHighImpactAcknowledged(false);
                        }
                      }}
                      disabled={!isAssignable}
                      style={{ marginTop: '0.2rem', cursor: isAssignable ? 'pointer' : 'not-allowed' }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                          {r.name}
                        </span>
                        {r.isSystemRole ? (
                          <Badge variant="primary">System Role</Badge>
                        ) : (
                          <Badge variant="neutral">Custom Role</Badge>
                        )}
                        {isCurrent && <Badge variant="info">Current</Badge>}
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                          {rolePerms.length} permissions
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.4,
                        }}
                      >
                        {r.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Permission Impact & Diff Analysis */}
        {hasRoleChanged && selectedRoleObj && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-background-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Access Impact Analysis ({formatRoleLabel(user.role)} &rarr; {selectedRoleObj.name})
              </span>
              <button
                type="button"
                onClick={() => setShowPermissionDetails(!showPermissionDetails)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-primary-default, #2563eb)',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                {showPermissionDetails ? 'Hide details' : 'Show details'}
              </button>
            </div>

            {/* Impact Metric Summary */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <Badge variant="success">+{permissionsGained.length} Gained</Badge>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  new permissions
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <Badge variant={permissionsRevoked.length > 0 ? 'warning' : 'neutral'}>
                  -{permissionsRevoked.length} Revoked
                </Badge>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  permissions removed
                </span>
              </div>
            </div>

            {/* Detailed Diff Breakdown */}
            {showPermissionDetails && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  borderTop: '1px solid var(--color-border-default)',
                  paddingTop: 'var(--space-2)',
                }}
              >
                {permissionsGained.length > 0 && (
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-success-default, #16a34a)' }}>
                      Permissions Gained:
                    </span>
                    <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      {permissionsGained.map((p) => {
                        const def = PERMISSION_CATALOG.find((c) => c.key === p);
                        return (
                          <li key={p}>
                            <strong>{def?.name || p}</strong> ({p})
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {permissionsRevoked.length > 0 && (
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-warning-default, #ca8a04)' }}>
                      Permissions Revoked:
                    </span>
                    <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      {permissionsRevoked.map((p) => {
                        const def = PERMISSION_CATALOG.find((c) => c.key === p);
                        return (
                          <li key={p}>
                            <strong>{def?.name || p}</strong> ({p})
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {permissionsGained.length === 0 && permissionsRevoked.length === 0 && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    No permissions difference between these roles.
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* High-Impact Safety Warning Banner & Acknowledgment */}
        {hasRoleChanged && isHighImpact && !isSoleAdminLockout && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-warning-subtle, #fefce8)',
              border: '1px solid var(--color-warning-default, #ca8a04)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                High-Impact Security Action
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              You are reassigning a high-privilege role or substantially changing active permissions.
              This user&apos;s functional capabilities, administrative privileges, and security boundaries
              will take effect immediately upon confirmation.
            </p>
            <div style={{ marginTop: 'var(--space-1)' }}>
              <Checkbox
                id="high-impact-acknowledgment"
                checked={isHighImpactAcknowledged}
                onChange={(e) => setIsHighImpactAcknowledged(e.target.checked)}
                label="I understand that this user's administrative authority and access permissions will change immediately."
              />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  isOpen,
  user,
  onClose,
  onAssignRole,
  isSubmitting = false,
}) => {
  if (!isOpen || !user) return null;

  return (
    <AssignRoleDialogContent
      key={user.id}
      user={user}
      onClose={onClose}
      onAssignRole={onAssignRole}
      isSubmitting={isSubmitting}
    />
  );
};
