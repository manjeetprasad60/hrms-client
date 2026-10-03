import { useState, useMemo } from 'react';
import type { LeaveRequest } from '../types';
import { Button, Badge, Input, Select } from '../../../components/ui';

interface PendingApprovalsListProps {
  readonly requests: readonly LeaveRequest[];
  readonly onApprove: (id: string) => void;
  readonly onReject: (request: LeaveRequest) => void;
  readonly onBatchApprove: (ids: readonly string[]) => void;
  readonly onBatchReject: (ids: readonly string[]) => void;
  readonly onViewDetails: (request: LeaveRequest) => void;
}

export function PendingApprovalsList({
  requests,
  onApprove,
  onReject,
  onBatchApprove,
  onBatchReject,
  onViewDetails,
}: PendingApprovalsListProps) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set).sort();
  }, [requests]);

  // Filtered pending requests
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (selectedDept !== 'all' && r.department.toLowerCase() !== selectedDept.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = r.employeeName.toLowerCase().includes(q);
        const matchReason = r.reason.toLowerCase().includes(q);
        const matchType = r.leaveTypeName.toLowerCase().includes(q);
        if (!matchName && !matchReason && !matchType) return false;
      }
      return true;
    });
  }, [requests, selectedDept, search]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((r) => selectedIds.includes(r.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((r) => r.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    onBatchApprove(selectedIds);
    setSelectedIds([]);
  };

  const handleBatchReject = () => {
    if (selectedIds.length === 0) return;
    onBatchReject(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Search & Filter Toolbar */}
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
              placeholder="Search by employee, leave type, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search pending leave requests"
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <Select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              options={[
                { value: 'all', label: 'All Departments' },
                ...departments.map((d) => ({ value: d, label: d })),
              ]}
              aria-label="Filter by department"
            />
          </div>
        </div>

        {/* Selected count info & bulk actions */}
        {selectedIds.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              backgroundColor: 'var(--color-bg-subtle)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {selectedIds.length} selected
            </span>
            <Button variant="primary" size="sm" onClick={handleBatchApprove}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Approve All
            </Button>
            <Button variant="danger" size="sm" onClick={handleBatchReject}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Reject All
            </Button>
          </div>
        )}
      </div>

      {/* Select All Checkbox bar if items exist */}
      {filtered.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-2)',
          }}
        >
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={handleToggleSelectAll}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
            <span>Select all {filtered.length} pending requests</span>
          </label>

          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Sorted by submission date (oldest first for SLA prioritization)
          </span>
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 'var(--space-10) var(--space-4)',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success-text)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-3)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            All Clear! No Pending Approvals
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '0.25rem', maxWidth: '420px', marginInline: 'auto' }}>
            All employee leave applications and time-off requests have been reviewed and resolved. New submissions will appear here.
          </p>
        </div>
      ) : (
        /* List of Request Cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filtered.map((req) => {
            const isSelected = selectedIds.includes(req.id);
            const isOverdue =
              Date.now() - new Date(req.appliedAt).getTime() > 48 * 60 * 60 * 1000;

            return (
              <div
                key={req.id}
                className="card"
                style={{
                  padding: 'var(--space-4) var(--space-5)',
                  backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  borderLeft: `4px solid ${req.color || 'var(--color-primary)'}`,
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 'var(--space-4)',
                  }}
                >
                  {/* Left: Checkbox + Employee Info + Request Details */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', flex: 1, minWidth: '300px' }}>
                    <div style={{ paddingTop: '0.25rem' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(req.id)}
                        aria-label={`Select request from ${req.employeeName}`}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Employee Avatar */}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: '#e0e7ff',
                        color: '#4338ca',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 'var(--text-base)',
                        flexShrink: 0,
                      }}
                    >
                      {req.employeeName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>

                    {/* Information Block */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {req.employeeName}
                        </span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          • {req.designation} ({req.department})
                        </span>

                        {/* Leave Type Badge */}
                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: `${req.color}18`,
                            color: req.color,
                            border: `1px solid ${req.color}35`,
                          }}
                        >
                          {req.leaveTypeName}
                        </span>

                        {isOverdue && (
                          <Badge variant="warning">
                            ⏰ Overdue SLA (&gt;48h)
                          </Badge>
                        )}
                      </div>

                      {/* Date Range & Duration Line */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          marginTop: '0.35rem',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 600,
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          📅 {req.startDate === req.endDate ? req.startDate : `${req.startDate} → ${req.endDate}`}
                        </span>

                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            backgroundColor: 'var(--color-bg-subtle)',
                            color: 'var(--color-text-secondary)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 500,
                          }}
                        >
                          {req.durationDays} {req.durationDays === 1 ? 'Business Day' : 'Business Days'}
                          {req.isHalfDay && ` (Half-Day: ${req.halfDaySession || 'Morning'})`}
                        </span>

                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          Applied on: {new Date(req.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Reason Description */}
                      <p
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-secondary)',
                          marginTop: '0.4rem',
                          fontStyle: 'italic',
                        }}
                      >
                        &ldquo;{req.reason}&rdquo;
                      </p>

                      {/* Badges / Warnings / Balance Meta */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          marginTop: '0.5rem',
                          paddingTop: '0.4rem',
                          borderTop: '1px dashed var(--color-border-default)',
                        }}
                      >
                        {/* Balance Glance */}
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span>Balance:</span>
                          <strong style={{ color: 'var(--color-primary)' }}>{req.currentAvailableBalance} days</strong>
                          <span>available</span>
                          <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                          <span><strong>{req.balanceAfterApproval} days</strong> remaining after approval</span>
                        </div>

                        {/* Teammate Conflict Warning */}
                        {typeof req.overlappingTeammatesCount === 'number' && req.overlappingTeammatesCount > 0 && (
                          <span
                            style={{
                              fontSize: 'var(--text-xs)',
                              fontWeight: 600,
                              color: '#b45309',
                              backgroundColor: '#fffbeb',
                              border: '1px solid #fde68a',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            ⚠️ {req.overlappingTeammatesCount} teammate{req.overlappingTeammatesCount > 1 ? 's' : ''} in {req.department} also away
                          </span>
                        )}

                        {/* Attachment badge */}
                        {req.attachmentName && (
                          <span
                            style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--color-info-text)',
                              backgroundColor: 'var(--color-info-bg)',
                              border: '1px solid var(--color-info-border)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            📎 {req.attachmentName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      flexShrink: 0,
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(req)}
                      title="View complete request audit and leave history"
                    >
                      Audit &amp; Details
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onReject(req)}
                      title="Decline this leave request"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Reject
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onApprove(req.id)}
                      title="Approve this leave request immediately"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
