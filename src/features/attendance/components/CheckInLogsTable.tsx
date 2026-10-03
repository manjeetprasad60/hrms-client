import { useMemo } from 'react';
import type { CheckInPunch, CheckInFilterState, AttendanceStatus, WorkMode } from '../types';
import { Badge, Button } from '../../../components/ui';

interface CheckInLogsTableProps {
  readonly records: readonly CheckInPunch[];
  readonly filters: CheckInFilterState;
  readonly onFilterChange: (newFilters: CheckInFilterState) => void;
  readonly onViewDetails: (record: CheckInPunch) => void;
  readonly onClockOut?: (punchId: string) => void;
  readonly onOpenManualModal: () => void;
}

export function CheckInLogsTable({
  records,
  filters,
  onFilterChange,
  onViewDetails,
  onClockOut,
  onOpenManualModal,
}: CheckInLogsTableProps) {
  const departments = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filters.status && r.status !== filters.status) return false;
      if (filters.workMode && r.workMode !== filters.workMode) return false;
      if (filters.department && r.department.toLowerCase() !== filters.department.toLowerCase()) return false;
      if (filters.employeeId && r.employeeId !== filters.employeeId) return false;
      if (filters.date && r.date !== filters.date) return false;
      if (filters.month) {
        if (filters.month.includes('-')) {
          if (!r.date.startsWith(filters.month)) return false;
        } else {
          const m = String(filters.month).padStart(2, '0');
          if (r.date.split('-')[1] !== m) return false;
        }
      }
      if (filters.startDate && r.date < filters.startDate) return false;
      if (filters.endDate && r.date > filters.endDate) return false;
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = r.employeeName.toLowerCase().includes(query);
        const matchesEmail = r.employeeEmail.toLowerCase().includes(query);
        const matchesDept = r.department.toLowerCase().includes(query);
        const matchesLoc = r.location.toLowerCase().includes(query);
        const matchesId = r.employeeId.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesDept && !matchesLoc && !matchesId) {
          return false;
        }
      }
      return true;
    });
  }, [records, filters]);

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <Badge variant="success">On-Time</Badge>;
      case 'late':
        return <Badge variant="warning">Late Arrival</Badge>;
      case 'half_day':
        return <Badge variant="info">Half Day</Badge>;
      case 'absent':
        return <Badge variant="danger">Absent</Badge>;
      case 'on_leave':
        return <Badge variant="neutral">On Leave</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getModeBadge = (mode: WorkMode) => {
    switch (mode) {
      case 'office':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
            Office
          </span>
        );
      case 'remote':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', color: 'var(--color-info-text)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-info-text)' }} />
            Remote
          </span>
        );
      case 'field':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', color: '#d97706' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706' }} />
            Field / Client
          </span>
        );
      case 'hybrid':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', color: '#7c3aed' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#7c3aed' }} />
            Hybrid
          </span>
        );
    }
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.status ||
    filters.workMode ||
    filters.department ||
    filters.employeeId ||
    filters.date ||
    filters.month ||
    filters.startDate ||
    filters.endDate
  );

  const resetFilters = () => {
    onFilterChange({
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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Controls & Search Toolbar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', flex: 1, minWidth: '280px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
              <input
                type="text"
                placeholder="Search employee, email, location..."
                value={filters.search}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                className="input"
                style={{ paddingLeft: '2.25rem' }}
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="select"
              style={{ width: 'auto', minWidth: '130px' }}
            >
              <option value="">All Statuses</option>
              <option value="present">On-Time</option>
              <option value="late">Late Arrival</option>
              <option value="half_day">Half Day</option>
              <option value="absent">Absent</option>
            </select>

            {/* Work Mode Filter */}
            <select
              value={filters.workMode}
              onChange={(e) => onFilterChange({ ...filters, workMode: e.target.value })}
              className="select"
              style={{ width: 'auto', minWidth: '130px' }}
            >
              <option value="">All Work Modes</option>
              <option value="office">In-Office</option>
              <option value="remote">Remote</option>
              <option value="field">Field</option>
              <option value="hybrid">Hybrid</option>
            </select>

            {/* Department Filter */}
            <select
              value={filters.department}
              onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
              className="select"
              style={{ width: 'auto', minWidth: '140px' }}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={onOpenManualModal}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.25rem' }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Adjust / Add Punch
            </Button>
          </div>
        </div>

        {/* Date & Range Filtering Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--space-3)',
            paddingTop: 'var(--space-2)',
            borderTop: '1px solid var(--color-border-subtle)',
            fontSize: 'var(--text-xs)',
          }}
        >
          {/* Specific Date Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Date:</span>
            <input
              type="date"
              className="input"
              style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: 'var(--text-xs)' }}
              value={filters.date || ''}
              onChange={(e) => onFilterChange({ ...filters, date: e.target.value, month: '', startDate: '', endDate: '' })}
            />
          </div>

          {/* Month Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Month:</span>
            <input
              type="month"
              className="input"
              style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: 'var(--text-xs)' }}
              value={filters.month || ''}
              onChange={(e) => onFilterChange({ ...filters, month: e.target.value, date: '', startDate: '', endDate: '' })}
            />
          </div>

          {/* Date Range Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>From:</span>
            <input
              type="date"
              className="input"
              style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: 'var(--text-xs)' }}
              value={filters.startDate || ''}
              onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value, date: '', month: '' })}
            />
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>To:</span>
            <input
              type="date"
              className="input"
              style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: 'var(--text-xs)' }}
              value={filters.endDate || ''}
              onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value, date: '', month: '' })}
            />
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                marginLeft: 'auto',
                color: 'var(--color-text-muted)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--text-xs)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>


      {/* Check-in Log Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Work Duration</th>
              <th>Work Mode & Location</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem var(--space-4)', color: 'var(--color-text-muted)' }}>
                  No check-in records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const isWorkingNow = record.clockIn !== '—' && !record.clockOut;

                return (
                  <tr key={record.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-primary-light)',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: 'var(--text-xs)',
                            flexShrink: 0,
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
                            {record.employeeEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                        {record.department}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                          {record.clockIn}
                        </span>
                        {record.verified && record.clockIn !== '—' && (
                          <span title="Verified biometric/GPS punch" style={{ color: 'var(--color-primary)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {record.clockOut ? (
                        <span style={{ fontSize: 'var(--text-sm)' }}>{record.clockOut}</span>
                      ) : isWorkingNow ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            color: 'var(--color-primary)',
                            backgroundColor: 'var(--color-primary-light)',
                            padding: '0.125rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-primary)',
                              animation: 'pulse 1.5s infinite',
                            }}
                          />
                          Active Now
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                          {record.workDurationHours > 0 ? `${record.workDurationHours} hrs` : '0 hrs'}
                        </span>
                        {record.breakDurationMinutes > 0 && (
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {record.breakDurationMinutes}m break
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        {getModeBadge(record.workMode)}
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                          {record.location}
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(record.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(record)}
                          title="View device, verification & audit details"
                        >
                          Details
                        </Button>
                        {isWorkingNow && onClockOut && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onClockOut(record.id)}
                            title="Record out-time for employee"
                          >
                            Record Out-Time
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
