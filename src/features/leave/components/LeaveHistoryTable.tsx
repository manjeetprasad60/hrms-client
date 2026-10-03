import { useState, useMemo } from 'react';
import type { LeaveRequest } from '../types';
import { Button, Badge, Input, Select } from '../../../components/ui';

interface LeaveHistoryTableProps {
  readonly requests: readonly LeaveRequest[];
  readonly onViewDetails: (request: LeaveRequest) => void;
}

export function LeaveHistoryTable({ requests, onViewDetails }: LeaveHistoryTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Filter out pending requests to only show resolved history
  const historyRecords = useMemo(() => {
    return requests.filter((r) => r.status !== 'pending');
  }, [requests]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    historyRecords.forEach((r) => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set).sort();
  }, [historyRecords]);

  const filtered = useMemo(() => {
    return historyRecords.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (deptFilter !== 'all' && r.department.toLowerCase() !== deptFilter.toLowerCase()) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !r.employeeName.toLowerCase().includes(q) &&
          !r.leaveTypeName.toLowerCase().includes(q) &&
          !r.reason.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [historyRecords, statusFilter, deptFilter, search]);

  const handleExportCSV = () => {
    const filename = `leave_history_${new Date().toISOString().slice(0, 10)}.csv`;
    const headers = [
      'Employee Name',
      'Department',
      'Leave Type',
      'Start Date',
      'End Date',
      'Duration (Days)',
      'Status',
      'Reason',
      'Reviewed By',
      'Review Note',
    ];
    const rows = filtered.map((r) => [
      `"${r.employeeName}"`,
      `"${r.department}"`,
      `"${r.leaveTypeName}"`,
      `"${r.startDate}"`,
      `"${r.endDate}"`,
      r.durationDays,
      `"${r.status}"`,
      `"${r.reason}"`,
      `"${r.reviewedBy || ''}"`,
      `"${r.reviewNote || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
          <div style={{ minWidth: '240px', flex: 1 }}>
            <Input
              placeholder="Search historical records by employee or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search leave history"
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              aria-label="Filter status"
            />
          </div>

          <div style={{ minWidth: '170px' }}>
            <Select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Departments' },
                ...departments.map((d) => ({ value: d, label: d })),
              ]}
              aria-label="Filter department"
            />
          </div>
        </div>

        <Button variant="secondary" size="md" onClick={handleExportCSV}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export History (CSV)
        </Button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ minWidth: '220px' }}>Employee</th>
              <th style={{ minWidth: '150px' }}>Leave Type</th>
              <th style={{ minWidth: '180px' }}>Date Window</th>
              <th style={{ minWidth: '110px' }}>Duration</th>
              <th style={{ minWidth: '120px' }}>Status</th>
              <th style={{ minWidth: '220px' }}>Resolution &amp; Reviewer</th>
              <th style={{ minWidth: '100px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <p style={{ color: 'var(--color-text-muted)' }}>No historical leave records matching your filter.</p>
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                        {r.employeeName}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {r.department} • {r.designation}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        color: r.color,
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: r.color,
                        }}
                      />
                      {r.leaveTypeName}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                      {r.startDate === r.endDate ? r.startDate : `${r.startDate} → ${r.endDate}`}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      {r.durationDays}d {r.isHalfDay ? '(Half)' : ''}
                    </span>
                  </td>

                  <td>
                    <Badge variant={r.status === 'approved' ? 'success' : 'danger'}>
                      {r.status.toUpperCase()}
                    </Badge>
                  </td>

                  <td>
                    <div style={{ fontSize: 'var(--text-xs)' }}>
                      {r.reviewedBy ? (
                        <>
                          <span style={{ color: 'var(--color-text-muted)' }}>By: </span>
                          <strong style={{ color: 'var(--color-text-primary)' }}>{r.reviewedBy}</strong>
                          {r.reviewNote && (
                            <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px', fontStyle: 'italic' }}>
                              &ldquo;{r.reviewNote}&rdquo;
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Auto-Resolved</span>
                      )}
                    </div>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <Button variant="ghost" size="sm" onClick={() => onViewDetails(r)}>
                      Audit
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
