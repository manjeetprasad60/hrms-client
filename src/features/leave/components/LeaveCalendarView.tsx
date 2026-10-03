import { useState, useMemo } from 'react';
import type { LeaveRequest, LeavePolicy } from '../types';
import { Button, Select } from '../../../components/ui';

interface LeaveCalendarViewProps {
  readonly requests: readonly LeaveRequest[];
  readonly policies: readonly LeavePolicy[];
}

export function LeaveCalendarView({ requests, policies }: LeaveCalendarViewProps) {
  // Current viewing date (defaulting to Oct 2026 to match simulated date)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedDayDetails, setSelectedDayDetails] = useState<string | null>('2026-10-01');

  const departments = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set).sort();
  }, [requests]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9);
    setSelectedDayDetails('2026-10-01');
  };

  // Calendar cells generation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  // Filter requests that are approved or pending and overlap with selected department
  const relevantRequests = useMemo(() => {
    return requests.filter((r) => {
      if (r.status !== 'approved' && r.status !== 'pending') return false;
      if (selectedDept !== 'all' && r.department.toLowerCase() !== selectedDept.toLowerCase()) return false;
      return true;
    });
  }, [requests, selectedDept]);

  // Build map of YYYY-MM-DD -> LeaveRequest[]
  const dateLeavesMap = useMemo(() => {
    const map = new Map<string, LeaveRequest[]>();

    relevantRequests.forEach((req) => {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);

      const cur = new Date(start);
      while (cur <= end) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, '0');
        const d = String(cur.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${d}`;

        const list = map.get(key) || [];
        list.push(req);
        map.set(key, list);

        cur.setDate(cur.getDate() + 1);
      }
    });

    return map;
  }, [relevantRequests]);

  // Selected date detail requests
  const selectedDateLeaves = selectedDayDetails ? dateLeavesMap.get(selectedDayDetails) || [] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Top Calendar Toolbar */}
      <div
        className="card"
        style={{
          padding: 'var(--space-4) var(--space-5)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {monthNames[currentMonth]} {currentYear}
          </h3>

          <div style={{ display: 'inline-flex', gap: 'var(--space-1)' }}>
            <Button variant="secondary" size="sm" onClick={handlePrevMonth} aria-label="Previous month">
              ‹
            </Button>
            <Button variant="secondary" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="secondary" size="sm" onClick={handleNextMonth} aria-label="Next month">
              ›
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ minWidth: '180px' }}>
            <Select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              options={[
                { value: 'all', label: 'All Departments' },
                ...departments.map((d) => ({ value: d, label: d })),
              ]}
              aria-label="Filter calendar by department"
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selectedDayDetails ? '1fr 340px' : '1fr',
          gap: 'var(--space-4)',
        }}
      >
        {/* Calendar Grid Container */}
        <div className="card" style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-surface)' }}>
          {/* Day of Week Headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-wider)',
              paddingBottom: 'var(--space-2)',
              borderBottom: '1px solid var(--color-border-default)',
            }}
          >
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '1px',
              backgroundColor: 'var(--color-border-subtle)',
              marginTop: '1px',
            }}
          >
            {/* Empty offset days for beginning of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  minHeight: '85px',
                  backgroundColor: 'var(--color-bg-subtle)',
                  opacity: 0.4,
                }}
              />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayLeaves = dateLeavesMap.get(dateStr) || [];
              const isSelected = selectedDayDetails === dateStr;
              const isToday = dateStr === '2026-10-01';

              const dayOfWeek = (firstDayOfWeek + i) % 7;
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDayDetails(dateStr)}
                  role="button"
                  tabIndex={0}
                  style={{
                    minHeight: '85px',
                    padding: 'var(--space-2)',
                    backgroundColor: isSelected
                      ? 'var(--color-primary-light)'
                      : isWeekend
                      ? 'var(--color-bg-app)'
                      : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'background-color var(--transition-fast)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    outline: isSelected ? '2px solid var(--color-primary)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: isToday ? 700 : 500,
                        color: isToday
                          ? '#ffffff'
                          : isWeekend
                          ? 'var(--color-text-muted)'
                          : 'var(--color-text-primary)',
                        backgroundColor: isToday ? 'var(--color-primary)' : 'transparent',
                        width: isToday ? '20px' : 'auto',
                        height: isToday ? '20px' : 'auto',
                        borderRadius: isToday ? '50%' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {dayNum}
                    </span>

                    {dayLeaves.length > 0 && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#ffffff',
                          backgroundColor: '#475569',
                          borderRadius: 'var(--radius-full)',
                          padding: '0 4px',
                        }}
                      >
                        {dayLeaves.length} away
                      </span>
                    )}
                  </div>

                  {/* Pills representing employees away */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                    {dayLeaves.slice(0, 2).map((req) => (
                      <div
                        key={req.id}
                        title={`${req.employeeName} (${req.leaveTypeName}): ${req.reason}`}
                        style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          padding: '2px 4px',
                          borderRadius: '3px',
                          backgroundColor: `${req.color}1c`,
                          color: req.color,
                          borderLeft: `2px solid ${req.color}`,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {req.employeeName.split(' ')[0]} ({req.leaveTypeCode})
                      </div>
                    ))}
                    {dayLeaves.length > 2 && (
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                        +{dayLeaves.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Policy Color Legend */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 'var(--space-4)',
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid var(--color-border-default)',
            }}
          >
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Legend:
            </span>
            {policies.map((pol) => (
              <div key={pol.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: 'var(--text-xs)' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    backgroundColor: pol.color,
                    display: 'inline-block',
                  }}
                />
                <span style={{ color: 'var(--color-text-secondary)' }}>{pol.name} ({pol.code})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Out-of-Office Details Panel */}
        {selectedDayDetails && (
          <div className="card" style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                📅 {selectedDayDetails}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedDayDetails(null)}
                style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-md)', padding: '0.2rem' }}
                aria-label="Close day details"
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
              {selectedDateLeaves.length} employee{selectedDateLeaves.length === 1 ? '' : 's'} on leave / away
            </p>

            {selectedDateLeaves.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-6) 0',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                🌱 Full attendance scheduled. No approved or pending leaves for this date.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {selectedDateLeaves.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-subtle)',
                      borderLeft: `3px solid ${req.color}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                        {req.employeeName}
                      </strong>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: req.status === 'approved' ? 'var(--color-success-text)' : '#b45309',
                        }}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {req.department} • {req.designation}
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: req.color,
                        marginTop: '6px',
                      }}
                    >
                      {req.leaveTypeName} ({req.durationDays}d{req.isHalfDay ? ' Half' : ''})
                    </div>

                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                      &ldquo;{req.reason}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
