import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { CLIENT_ROLES, canActorAssignRole, type ClientRole } from '../../../permissions/roles';
import { roleService } from '../../../services/role/roleService';
import { useClient } from '../../../routes/ClientContext';
import type { Role } from '../../../types/role';
import { CLIENT_USER_STATUS, type ClientUser, type ClientUserStatus, type UpdateClientUserInput } from '../../../types/auth';

export interface UserDetailModalProps {
  readonly isOpen: boolean;
  readonly user: ClientUser | null;
  readonly onClose: () => void;
  readonly onSave: (userId: string, updates: UpdateClientUserInput) => Promise<void>;
  readonly isSaving?: boolean;
}

interface UserDetailDialogContentProps {
  readonly user: ClientUser;
  readonly onClose: () => void;
  readonly onSave: (userId: string, updates: UpdateClientUserInput) => Promise<void>;
  readonly isSaving?: boolean;
}

const UserDetailDialogContent: React.FC<UserDetailDialogContentProps> = ({
  user,
  onClose,
  onSave,
  isSaving = false,
}) => {
  const { role: actorRole, permissions: actorPermissions } = useClient();
  const [availableRoles, setAvailableRoles] = useState<readonly Role[]>([]);

  useEffect(() => {
    let isSubscribed = true;
    roleService
      .listRoles()
      .then((roles) => {
        if (isSubscribed) {
          setAvailableRoles(roles);
        }
      })
      .catch(() => {});

    return () => {
      isSubscribed = false;
    };
  }, []);

  const actorEffectivePerms = useMemo(() => actorPermissions || [], [actorPermissions]);

  const roleOptions = useMemo(() => {
    if (availableRoles.length === 0) {
      return [
        { value: CLIENT_ROLES.EMPLOYEE, label: 'Employee' },
        { value: CLIENT_ROLES.DEPARTMENT_HEAD, label: 'Department Head' },
        { value: CLIENT_ROLES.PAYROLL_ADMIN, label: 'Payroll Admin' },
        { value: CLIENT_ROLES.HR_MANAGER, label: 'HR Manager' },
        { value: CLIENT_ROLES.ORG_ADMIN, label: 'Organization Admin' },
      ];
    }
    return availableRoles
      .filter((r) => {
        if (r.code === user.role) return true;
        const rolePerms = r.permissionIds || r.permissions || [];
        return canActorAssignRole(actorRole, actorEffectivePerms, r.code, rolePerms);
      })
      .map((r) => ({
        value: r.code,
        label: `${r.name}${r.isSystemRole ? '' : ' (Custom)'}`,
      }));
  }, [availableRoles, actorRole, actorEffectivePerms, user.role]);

  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [phone, setPhone] = useState(user.phone || user.phoneNumber || '');
  const [employeeId, setEmployeeId] = useState(user.employeeId || '');
  const [role, setRole] = useState<ClientRole>(user.role || CLIENT_ROLES.EMPLOYEE);
  const [status, setStatus] = useState<ClientUserStatus>(
    (user.status as ClientUserStatus) || CLIENT_USER_STATUS.ACTIVE
  );

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const errors: Record<string, string> = {};
    if (!firstName.trim()) {
      errors.firstName = 'First name is required.';
    }
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await onSave(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        phoneNumber: phone.trim() || undefined,
        employeeId: employeeId.trim() || undefined,
        role,
        status,
      });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update user profile.';
      setGeneralError(message);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="User Details & Access"
      description="Review user profile, assign organizational roles, and update account status."
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-detail-form"
            variant="primary"
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form id="user-detail-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {generalError && (
          <Alert variant="error">
            {generalError}
          </Alert>
        )}

        {/* User Summary Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-hover)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-default)',
          }}
        >
          <Avatar
            firstName={user.firstName}
            lastName={user.lastName}
            src={user.photoURL || user.avatarUrl}
            size="lg"
          />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {user.firstName} {user.lastName}
              </span>
              <Badge variant="neutral" style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                {user.status}
              </Badge>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              User ID: <code style={{ fontSize: '11px' }}>{user.id}</code>
            </span>
          </div>
        </div>

        {/* Personal Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Input
            id="edit-first-name"
            label="First Name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (formErrors.firstName) setFormErrors((prev) => ({ ...prev, firstName: '' }));
            }}
            error={formErrors.firstName}
            required
          />

          <Input
            id="edit-last-name"
            label="Last Name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (formErrors.lastName) setFormErrors((prev) => ({ ...prev, lastName: '' }));
            }}
            error={formErrors.lastName}
            required
          />
        </div>

        {/* Email Address (Read-only for security) */}
        <Input
          id="edit-email"
          label="Corporate Email Address"
          value={user.email}
          disabled
          helperText="Email is permanently bound to the authentication UID and cannot be modified directly."
        />

        {/* Role & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Select
            id="edit-role"
            label="Assigned Role"
            value={role}
            onChange={(e) => setRole(e.target.value as ClientRole)}
            options={roleOptions}
            required
          />

          <Select
            id="edit-status"
            label="Account Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ClientUserStatus)}
            options={[
              { value: CLIENT_USER_STATUS.ACTIVE, label: 'Active (Full Access)' },
              { value: CLIENT_USER_STATUS.INVITED, label: 'Invited (Pending Confirmation)' },
              { value: CLIENT_USER_STATUS.SUSPENDED, label: 'Suspended (Temporary Lock)' },
              { value: CLIENT_USER_STATUS.DISABLED, label: 'Disabled (Deactivated)' },
            ]}
            required
            helperText="Soft lifecycle transitions. Audit logs remain intact."
          />
        </div>

        {/* Contact & Employee Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Input
            id="edit-phone"
            type="tel"
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            id="edit-employee-id"
            label="Workforce Employee ID"
            placeholder="EMP-0123"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave,
  isSaving = false,
}) => {
  if (!isOpen || !user) return null;

  return (
    <UserDetailDialogContent
      key={user.id}
      user={user}
      onClose={onClose}
      onSave={onSave}
      isSaving={isSaving}
    />
  );
};
