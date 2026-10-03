import { useState, useEffect, useContext } from 'react';
import type { ManualAdjustmentPayload, WorkMode } from '../types';
import { Modal, Button } from '../../../components/ui';
import { DEFAULT_COMPANY_ID } from '../../../services/attendance';
import { employeeService } from '../../../services/employee';
import { ClientContext } from '../../../routes/ClientContext';

export interface ManualAttendanceEmployee {
  readonly id: string;
  readonly name: string;
  readonly department: string;
  readonly designation?: string;
}

interface ManualAttendanceModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (payload: ManualAdjustmentPayload) => Promise<void>;
  readonly isSubmitting?: boolean;
  readonly companyId?: string;
  readonly employees?: ManualAttendanceEmployee[];
}

export function ManualAttendanceModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  companyId: propCompanyId,
  employees: propEmployees,
}: ManualAttendanceModalProps) {
  const clientContext = useContext(ClientContext);
  const companyId =
    propCompanyId || clientContext?.organizationId || clientContext?.clientUser?.companyId || DEFAULT_COMPANY_ID;

  const [employees, setEmployees] = useState<ManualAttendanceEmployee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [clockIn, setClockIn] = useState('09:00 AM');
  const [clockOut, setClockOut] = useState('06:00 PM');
  const [workMode, setWorkMode] = useState<WorkMode>('office');
  const [status, setStatus] = useState<'present' | 'late' | 'half_day'>('present');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Derive active employees list (from propEmployees or fetched api/employees)
  const displayEmployees = propEmployees && propEmployees.length > 0 ? propEmployees : employees;
  const activeEmpId = selectedEmpId || displayEmployees[0]?.id || '';

  // Fetch real employee list from Employee Directory (api/employees) when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (propEmployees && propEmployees.length > 0) {
      setSelectedEmpId((prev) => {
        if (prev && propEmployees.some((e) => e.id === prev)) {
          return prev;
        }
        return propEmployees[0]?.id || '';
      });
      return;
    }

    let isMounted = true;

    employeeService
      .getEmployees(companyId)
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          const mappedEmployees: ManualAttendanceEmployee[] = data
            .map((emp) => {
              const id = emp.id || emp.employeeId || '';
              const fullName =
                emp.name?.trim() ||
                [emp.firstName, emp.lastName].filter(Boolean).join(' ').trim() ||
                emp.email ||
                id;
              return {
                id,
                name: fullName,
                department: emp.department || 'General',
                designation: emp.designation,
              };
            })
            .filter((emp) => Boolean(emp.id));

          if (mappedEmployees.length > 0) {
            setEmployees(mappedEmployees);
            setSelectedEmpId((prev) => {
              if (prev && mappedEmployees.some((e) => e.id === prev)) {
                return prev;
              }
              return mappedEmployees[0]?.id || '';
            });
          }
        }
      })
      .catch((err) => {
        console.warn('Error fetching employees from api/employees:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, companyId, propEmployees]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a justification for this attendance adjustment.');
      return;
    }

    const emp = displayEmployees.find((item) => item.id === activeEmpId) || displayEmployees[0];
    if (!emp) {
      setError('Please select an employee.');
      return;
    }

    try {
      setError(null);
      await onSubmit({
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        date,
        clockIn,
        clockOut,
        workMode,
        status,
        reason: reason.trim(),
      });
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save adjustment');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Manual Attendance Adjustment"
      description="Record or adjust missing punch records with HR audit justification."
      footer={
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Adjustment'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {error && (
          <div className="alert alert-error" style={{ padding: 'var(--space-2) var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-xs)' }}>{error}</span>
          </div>
        )}

        <div className="input-group">
          <label className="input-label" htmlFor="manual-emp-select">
            Employee <span className="input-required">*</span>
          </label>
          <select
            id="manual-emp-select"
            value={activeEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="select"
          >
            {displayEmployees.length === 0 ? (
              <option value="" disabled>No employees found</option>
            ) : (
              displayEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department || 'General'})
                </option>
              ))
            )}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="manual-date">
              Date <span className="input-required">*</span>
            </label>
            <input
              id="manual-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="manual-work-mode">
              Work Mode
            </label>
            <select
              id="manual-work-mode"
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value as WorkMode)}
              className="select"
            >
              <option value="office">Office</option>
              <option value="remote">Remote</option>
              <option value="field">Field</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="manual-clock-in">
              Clock In Time <span className="input-required">*</span>
            </label>
            <input
              id="manual-clock-in"
              type="text"
              placeholder="e.g. 09:00 AM"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="manual-clock-out">
              Clock Out Time <span className="input-required">*</span>
            </label>
            <input
              id="manual-clock-out"
              type="text"
              placeholder="e.g. 06:00 PM"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
              className="input"
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="manual-status">
            Attendance Status
          </label>
          <select
            id="manual-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'present' | 'late' | 'half_day')}
            className="select"
          >
            <option value="present">Present (On-Time)</option>
            <option value="late">Late Arrival</option>
            <option value="half_day">Half Day</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="manual-reason">
            Adjustment Reason & Notes <span className="input-required">*</span>
          </label>
          <textarea
            id="manual-reason"
            rows={3}
            placeholder="Specify reason (e.g. Biometric scanner offline, forgot keycard, onsite client visit)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="input"
            required
            style={{ resize: 'vertical' }}
          />
        </div>
      </form>
    </Modal>
  );
}
