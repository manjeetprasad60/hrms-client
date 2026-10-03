import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, Alert } from '../../../components/ui';

export interface EditEmployeeModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly employee?: Record<string, unknown> | null;
  readonly onSubmit?: (updatedEmployee: Record<string, unknown>) => Promise<void> | void;
  readonly isSubmitting?: boolean;
  readonly apiError?: string | null;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'probation', label: 'Probation' },
  { value: 'terminated', label: 'Terminated' },
];

export function EditEmployeeModal({
  isOpen,
  onClose,
  employee,
  onSubmit,
  isSubmitting = false,
  apiError = null,
}: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    status: 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      const fullName =
        (employee.name as string) ||
        `${(employee.firstName as string) || ''} ${(employee.lastName as string) || ''}`.trim();
      setFormData({
        name: fullName,
        email: (employee.email as string) || '',
        department: (employee.department as string) || '',
        designation: (employee.designation as string) || '',
        status: (employee.status as string) || 'active',
      });
      setErrors({});
      setLocalError(null);
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setErrors({});
    setLocalError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const nameParts = formData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      await onSubmit?.({
        ...employee,
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        firstName,
        lastName,
      });
      setErrors({});
      setLocalError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update employee';
      setLocalError(msg);
    }
  };

  const displayedError = apiError || localError;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Employee">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {displayedError && (
          <Alert variant="error" title="Error">
            {displayedError}
          </Alert>
        )}

        <Input
          label="Name"
          name="name"
          placeholder="Enter full name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={isSubmitting}
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isSubmitting}
          required
        />

        <Input
          label="Department"
          name="department"
          placeholder="Enter department or code (e.g. dept_cmp_hrms_28_2886_gen)"
          list="edit-dept-options"
          value={formData.department}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <datalist id="edit-dept-options">
          <option value="dept_cmp_hrms_28_2886_gen" />
          <option value="Engineering" />
          <option value="Human Resources" />
          <option value="Finance" />
          <option value="Marketing" />
          <option value="Sales" />
          <option value="Operations" />
          <option value="Product" />
          <option value="Design" />
        </datalist>

        <Input
          label="Designation"
          name="designation"
          placeholder="Enter designation (e.g. Senior Software Engineer)"
          value={formData.designation}
          onChange={handleChange}
          disabled={isSubmitting}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={STATUS_OPTIONS}
          disabled={isSubmitting}
        />

        <div className="input-group">
          <label className="input-label">Actions</label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
            <Button variant="secondary" type="button" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}