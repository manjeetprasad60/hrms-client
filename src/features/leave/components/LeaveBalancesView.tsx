import { useState, useMemo } from 'react';
import type { EmployeeLeaveBalance } from '../types';
import { Button, Input, Select } from '../../../components/ui';

interface LeaveBalancesViewProps {
  readonly balances: readonly EmployeeLeaveBalance[];
  readonly onAdjustBalance: (employee: EmployeeLeaveBalance) => void;
  readonly onApplyForEmployee: (employeeId: string) => void;
}

export function LeaveBalancesView({
  balances,
  onAdjustBalance,
  onApplyForEmployee,
}: LeaveBalancesViewProps) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const departments = useMemo(() => {
    const set = new Set<string>();
    balances.forEach((b) => {
      if (b.department) set.add(b.department);
    });
    return Array.from(set).sort();
  }, [balances]);

  const filtered = useMemo(() => {
    return balances.filter((b) => {
      if (selectedDept !== 'all' && b.department.toLowerCase() !== selectedDept.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !b.employeeName.toLowerCase().includes(q) &&
          !b.employeeEmail.toLowerCase().includes(q) &&
          !b.designation.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [balances, selectedDept, search]);

  // Aggregate stats across organization
  const aggregate = useMemo(() => {
    const totalEntitled = balances.reduce((sum, b) => sum + b.totalEntitled, 0);
    const totalTaken = balances.reduce((sum, b) => sum + b.totalTaken, 0);
    const totalPending = balances.reduce((sum, b) => sum + b.totalPending, 0);
    const totalAvailable = balances.reduce((sum, b) => sum + b.totalAvailable, 0);
    return { totalEntitled, totalTaken, totalPending, totalAvailable };
  }, [balances]);

  // Export Balances CSV
  const handleExportCSV = () => {
    const filename = `leave_balances_${new Date().toISOString().slice(0, 10)}.csv`;
    const headers = [
      'Employee Name',
      'Email',
      'Department',
      'Designation',
      'Fiscal Year',
      'Total Entitled',
      'Taken',
      'Pending Approval',
      'Available Remaining',
    ];
    const rows = filtered.map((b) => [
      `"${b.employeeName}"`,
      `"${b.employeeEmail}"`,
      `"${b.department}"`,
      `"${b.designation}"`,
      `"${b.fiscalYear}"`,
      b.totalEntitled,
      b.totalTaken,
      b.totalPending,
      b.totalAvailable,
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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Top Organization Summary Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        <div
          className="card"
          style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-surface)' }}
        >
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Total Entitled Pool
          </span>
          <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
            {aggregate.totalEntitled} days
          </p>
        </div>

        <div
          className="card"
          style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-surface)' }}
        >
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Leaves Consumed (Taken)
          </span>
          <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
            {aggregate.totalTaken} days
          </p>
        </div>

        <div
          className="card"
          style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-surface)' }}
        >
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Pending in Approvals
          </span>
          <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: '#b45309', marginTop: '0.2rem' }}>
            {aggregate.totalPending} days
          </p>
        </div>

        <div
          className="card"
          style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-surface)' }}
        >
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Available Quota
          </span>
          <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.2rem' }}>
            {aggregate.totalAvailable} days
          </p>
        </div>
      </div>

      {/* Filter and Action Toolbar */}
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
              placeholder="Search employee by name, email, or designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search employee balances"
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
              aria-label="Filter department balances"
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Button variant="secondary" size="md" onClick={handleExportCSV}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Balances (CSV)
          </Button>
        </div>
      </div>

      {/* Balances Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ minWidth: '220px' }}>Employee</th>
              <th style={{ minWidth: '130px' }}>Department</th>
              <th style={{ minWidth: '340px' }}>Time-Off Breakdown (Taken / Entitled)</th>
              <th style={{ minWidth: '180px' }}>Available Balance</th>
              <th style={{ minWidth: '170px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <p style={{ color: 'var(--color-text-muted)' }}>No employee balances matching your search criteria.</p>
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const consumedPercent =
                  b.totalEntitled > 0 ? Math.round((b.totalTaken / b.totalEntitled) * 100) : 0;

                return (
                  <tr key={b.employeeId}>
                    {/* Employee Profile */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#e0e7ff',
                            color: '#4338ca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: 'var(--text-sm)',
                            flexShrink: 0,
                          }}
                        >
                          {b.employeeName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                            {b.employeeName}
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {b.employeeEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td>
                      <div>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {b.department}
                        </span>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {b.designation}
                        </div>
                      </div>
                    </td>

                    {/* Per Policy Capsule Badges */}
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {b.balances.map((p) => (
                          <div
                            key={p.policyId}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--color-bg-subtle)',
                              border: '1px solid var(--color-border-default)',
                              fontSize: 'var(--text-xs)',
                            }}
                          >
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: p.color,
                                display: 'inline-block',
                              }}
                            />
                            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              {p.policyCode}:
                            </span>
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                              {p.taken} / {p.totalEntitled}d
                            </span>
                            {p.pending > 0 && (
                              <span style={{ color: '#b45309', fontWeight: 600 }}>
                                ({p.pending}d pend)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Available Balance with Visual Meter */}
                    <td>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary)' }}>
                            {b.totalAvailable} days
                          </span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {consumedPercent}% used
                          </span>
                        </div>
                        <div
                          style={{
                            height: '6px',
                            backgroundColor: 'var(--color-border-default)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, consumedPercent)}%`,
                              backgroundColor:
                                consumedPercent > 80
                                  ? 'var(--color-error-text)'
                                  : consumedPercent > 50
                                  ? '#d97706'
                                  : 'var(--color-primary)',
                              borderRadius: 'var(--radius-full)',
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApplyForEmployee(b.employeeId)}
                          title="Apply leave on behalf of employee"
                        >
                          + Apply
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onAdjustBalance(b)}
                          title="Adjust or credit/debit leave balance"
                        >
                          Adjust
                        </Button>
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
