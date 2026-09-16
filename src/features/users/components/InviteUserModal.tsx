import React, { useState, useMemo } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { CLIENT_ROLES, CLIENT_ROLE_LABELS, getAllowedAssignableRoles, type ClientRole } from '../../../permissions/roles';
import { useClient } from '../../../routes/ClientContext';
import type { CreateInvitationInput } from '../../../types/invitation';

export interface InviteUserModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onInvite: (input: CreateInvitationInput) => Promise<void>;
  readonly isSubmitting?: boolean;
}

const ROLE_DESCRIPTIONS: Record<ClientRole, string> = {
  [CLIENT_ROLES.ORG_ADMIN]: 'Organization Admin (Full portal access)',
  [CLIENT_ROLES.HR_MANAGER]: 'HR Manager (Directory & policies)',
  [CLIENT_ROLES.PAYROLL_ADMIN]: 'Payroll Administrator (Compensation & runs)',
  [CLIENT_ROLES.DEPARTMENT_HEAD]: 'Department Head (Team review & approvals)',
  [CLIENT_ROLES.EMPLOYEE]: 'Employee (Standard workforce access)',
};

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  isSubmitting = false,
}) => {
  const { role: actorRole } = useClient();
  const assignableRoles = useMemo(() => getAllowedAssignableRoles(actorRole), [actorRole]);

  const defaultRole = assignableRoles.includes(CLIENT_ROLES.EMPLOYEE)
    ? CLIENT_ROLES.EMPLOYEE
    : assignableRoles[0] || CLIENT_ROLES.EMPLOYEE;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ClientRole>(defaultRole);
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole(defaultRole);
    setPhone('');
    setEmployeeId('');
    setFormErrors({});
    setGeneralError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

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
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid corporate email address.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    try {
      await onInvite({
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        phone: phone.trim() || undefined,
        employeeId: employeeId.trim() || undefined,
        departmentIds: [],
        locationIds: [],
      });
      resetForm();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send invitation. Please try again.';
      setGeneralError(message);
    }
  };

  const roleOptions = useMemo(() => {
    return assignableRoles.map((r) => ({
      value: r,
      label: ROLE_DESCRIPTIONS[r] || CLIENT_ROLE_LABELS[r] || r,
    }));
  }, [assignableRoles]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite User"
      description="Send an invitation link with account setup instructions. Portal access is granted only after setup is completed."
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="invite-user-form"
            variant="primary"
            isLoading={isSubmitting}
          >
            Send Invitation
          </Button>
        </>
      }
    >
      <form id="invite-user-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {generalError && (
          <Alert variant="error">
            {generalError}
          </Alert>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Input
            id="invite-first-name"
            label="First Name"
            placeholder="Jane"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (formErrors.firstName) setFormErrors((prev) => ({ ...prev, firstName: '' }));
            }}
            error={formErrors.firstName}
            required
            autoFocus
          />

          <Input
            id="invite-last-name"
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (formErrors.lastName) setFormErrors((prev) => ({ ...prev, lastName: '' }));
            }}
            error={formErrors.lastName}
            required
          />
        </div>

        <Input
          id="invite-email"
          type="email"
          label="Corporate Email"
          placeholder="jane.doe@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
          }}
          error={formErrors.email}
          required
        />

        <Select
          id="invite-role"
          label="Organization Role"
          value={role}
          onChange={(e) => setRole(e.target.value as ClientRole)}
          options={roleOptions}
          required
          helperText="Selectable roles are restricted to your administrative authorization level."
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Input
            id="invite-phone"
            type="tel"
            label="Phone Number (Optional)"
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            id="invite-employee-id"
            label="Employee ID (Optional)"
            placeholder="EMP-0123"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
