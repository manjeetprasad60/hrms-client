import { useState, useEffect, useCallback, useTransition, useContext, useMemo } from 'react';
import { PageContainer } from '../../../layouts';
import { Button, Spinner } from '../../../components/ui';
import {
  AttendanceOverviewMetrics,
  CheckInLogsTable,
  PunchDetailModal,
  ManualAttendanceModal,
} from '../components';
import { attendanceService } from '../../../services/attendance';
import { employeeService } from '../../../services/employee';
import { ClientContext } from '../../../routes/ClientContext';
import type { ManualAttendanceEmployee } from '../components/ManualAttendanceModal';
import type {
  CheckInPunch,
  AttendanceKPIStats,
  CheckInFilterState,
  ManualAdjustmentPayload,
} from '../types';

const DEFAULT_COMPANY_ID = 'cmp_hrms_28_2886';

export function AttendanceManagementPage() {
  const [, startTransition] = useTransition();
  const clientContext = useContext(ClientContext);
  const companyId = clientContext?.organizationId || clientContext?.clientUser?.companyId || DEFAULT_COMPANY_ID;

  // Attendance Data States
  const [checkIns, setCheckIns] = useState<CheckInPunch[]>([]);
  const [stats, setStats] = useState<AttendanceKPIStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Directory employees state (fetched from api/employees)
  const [directoryEmployees, setDirectoryEmployees] = useState<ManualAttendanceEmployee[]>([]);

  // Fetch employees from Employee Directory (api/employees)
  useEffect(() => {
    let isMounted = true;

    employeeService
      .getEmployees(companyId)
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          const mapped: ManualAttendanceEmployee[] = data
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
            .filter((e) => Boolean(e.id));

          if (mapped.length > 0) {
            setDirectoryEmployees(mapped);
          }
        }
      })
      .catch((err) => {
        console.warn('Error fetching employees from api/employees:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  // Extract unique employees from attendance records (api/attendance) as fallback
  const attendanceEmployees = useMemo(() => {
    const map = new Map<string, { id: string; name: string; department: string }>();
    for (const c of checkIns) {
      if (c.employeeId && !map.has(c.employeeId)) {
        map.set(c.employeeId, {
          id: c.employeeId,
          name: c.employeeName,
          department: c.department,
        });
      }
    }
    return Array.from(map.values());
  }, [checkIns]);

  const manualAdjustmentEmployees = directoryEmployees.length > 0 ? directoryEmployees : attendanceEmployees;

  // Modals
  const [selectedPunch, setSelectedPunch] = useState<CheckInPunch | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Filter States
  const [checkInFilters, setCheckInFilters] = useState<CheckInFilterState>({
    search: '',
    status: '',
    workMode: '',
    department: '',
    employeeId: '',
    date: '',
    month: '',
    startDate: '',
    endDate: '',
  });

  // Fetch data using backend attendance GET API
  const loadData = useCallback(async () => {
    try {
      const [cData, sData] = await Promise.all([
        attendanceService.getAttendance({
          companyId,
          employeeId: checkInFilters.employeeId || undefined,
          date: checkInFilters.date || undefined,
          month: checkInFilters.month || undefined,
          status: checkInFilters.status || undefined,
          startDate: checkInFilters.startDate || undefined,
          endDate: checkInFilters.endDate || undefined,
          workMode: checkInFilters.workMode || undefined,
        }),
        attendanceService.getKPIStats(companyId),
      ]);

      startTransition(() => {
        setCheckIns(cData);
        setStats(sData);
        setIsLoading(false);
      });
    } catch {
      startTransition(() => {
        setIsLoading(false);
      });
    }
  }, [
    companyId,
    checkInFilters.employeeId,
    checkInFilters.date,
    checkInFilters.month,
    checkInFilters.status,
    checkInFilters.startDate,
    checkInFilters.endDate,
    checkInFilters.workMode,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Admin checkout action for an employee
  const handleTableClockOut = async (punchId: string) => {
    try {
      await attendanceService.clockOut(punchId, { companyId });
      showToast('Employee punch out-time recorded successfully');
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Action failed', 'info');
    }
  };

  // Handlers for Manual Adjustments
  const handleManualAdjustment = async (payload: ManualAdjustmentPayload) => {
    setIsSubmitting(true);
    try {
      await attendanceService.addManualAdjustment({ ...payload, companyId });
      showToast(`Adjustment recorded for ${payload.employeeName}`);
      loadData();
      setIsManualModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Export to CSV Functionality
  const handleExportCSV = () => {
    const filename = `attendance_checkins_${new Date().toISOString().slice(0, 10)}.csv`;
    const headers = [
      'Employee Name',
      'Email',
      'Department',
      'Date',
      'Clock In',
      'Clock Out',
      'Duration (hrs)',
      'Break (mins)',
      'Mode',
      'Location',
      'Status',
      'Notes',
    ];
    const rows = checkIns.map((c) => [
      `"${c.employeeName}"`,
      `"${c.employeeEmail}"`,
      `"${c.department}"`,
      `"${c.date}"`,
      `"${c.clockIn}"`,
      `"${c.clockOut || 'Active'}"`,
      c.workDurationHours,
      c.breakDurationMinutes,
      `"${c.workMode}"`,
      `"${c.location}"`,
      `"${c.status}"`,
      `"${c.notes || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename} successfully`);
  };

  return (
    <PageContainer
      title="Time & Attendance"
      description="Review employee check-ins, daily logs, and attendance records."
      breadcrumbs={[{ label: 'Time & Attendance', path: '/attendance' }]}
    >
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`alert alert-${notification.type === 'success' ? 'success' : 'info'}`}
          style={{
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            style={{ color: 'inherit', padding: '0.25rem' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Top Header Actions & Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-bg-subtle)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            📅 Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            • Standard Shift (09:00 AM – 06:00 PM IST)
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={handleExportCSV}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Attendance (CSV)
          </Button>

          <Button variant="primary" onClick={() => setIsManualModalOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Adjust / Add Punch
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      {stats && (
        <AttendanceOverviewMetrics
          stats={stats}
          onQuickFilter={(type) => {
            if (type === 'present' || type === 'late') {
              setCheckInFilters((prev) => ({ ...prev, status: type }));
            } else if (type === 'remote') {
              setCheckInFilters((prev) => ({ ...prev, workMode: 'remote' }));
            }
          }}
        />
      )}

      {/* Check-In Logs & Attendance Table */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Spinner />
        </div>
      ) : (
        <CheckInLogsTable
          records={checkIns}
          filters={checkInFilters}
          onFilterChange={setCheckInFilters}
          onViewDetails={(rec) => setSelectedPunch(rec)}
          onClockOut={handleTableClockOut}
          onOpenManualModal={() => setIsManualModalOpen(true)}
        />
      )}

      {/* Audit Detail Modal */}
      <PunchDetailModal
        record={selectedPunch}
        isOpen={Boolean(selectedPunch)}
        onClose={() => setSelectedPunch(null)}
      />

      {/* Manual Attendance Adjustment Modal */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={handleManualAdjustment}
        isSubmitting={isSubmitting}
        companyId={companyId}
        employees={manualAdjustmentEmployees}
      />
    </PageContainer>
  );
}
