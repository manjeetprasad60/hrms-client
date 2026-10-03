import type { CheckInPunch } from '../types';
import { Modal, Badge, Button } from '../../../components/ui';

interface PunchDetailModalProps {
  readonly record: CheckInPunch | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function PunchDetailModal({ record, isOpen, onClose }: PunchDetailModalProps) {
  if (!record) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attendance & Check-in Verification"
      description={`Audit record ID: ${record.id}`}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Employee Header Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            {record.employeeName
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {record.employeeName}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {record.department} • {record.designation || 'Staff'} • {record.employeeEmail}
            </div>
          </div>
        </div>

        {/* Core Timestamps & Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Clock In</span>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {record.clockIn}
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Date: {record.date}
            </span>
          </div>

          <div style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Clock Out</span>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {record.clockOut || 'Still Working (Active)'}
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {record.clockOut ? 'Punched out' : 'Punch pending'}
            </span>
          </div>

          <div style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Work Duration</span>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {record.workDurationHours} hours
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Break time: {record.breakDurationMinutes} mins
            </span>
          </div>

          <div style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Overtime</span>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-primary)' }}>
              {record.overtimeHours > 0 ? `+${record.overtimeHours} hrs` : '0.0 hrs'}
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Standard shift 8 hrs
            </span>
          </div>
        </div>

        {/* Verification & Hardware / Geofence Audit */}
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-text-muted)' }}>
              Audit & Verification Details
            </span>
            {record.verified ? (
              <Badge variant="success">Hardware & GPS Verified</Badge>
            ) : (
              <Badge variant="warning">Unverified Source</Badge>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Work Mode:</span>
              <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{record.workMode}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Assigned Location:</span>
              <span style={{ fontWeight: 500 }}>{record.location}</span>
            </div>
            {record.ipAddress && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>IP Address:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{record.ipAddress}</span>
              </div>
            )}
            {record.deviceInfo && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Terminal / Device:</span>
                <span style={{ fontWeight: 500, fontSize: 'var(--text-xs)' }}>{record.deviceInfo}</span>
              </div>
            )}
            {record.notes && (
              <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border-default)' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>Audit Notes:</span>
                <p style={{ fontSize: 'var(--text-xs)', marginTop: '0.125rem' }}>{record.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
