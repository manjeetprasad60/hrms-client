import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { PermissionButton } from '../../../components/ui/PermissionButton';
import { PERMISSIONS } from '../../../permissions/permissions';
import { usePermission } from '../../../permissions/usePermission';
import { useToast } from '../../../components/feedback/ToastContext';
import type { DashboardQuickAction } from '../types';

export function DashboardQuickActions() {
  const toast = useToast();
  const { can } = usePermission();

  const handleActionClick = (actionName: string, destination: string) => {
    toast.info(
      `${destination} module foundation will handle this operation in upcoming phase.`,
      actionName
    );
  };

  const actions: readonly DashboardQuickAction[] = [
    {
      id: 'action-add-employee',
      title: 'Add New Employee',
      description: 'Register a new team member and provision organization access',
      permission: PERMISSIONS.EMPLOYEES_CREATE,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      ),
      onClick: () => handleActionClick('Add Employee', 'Workforce Directory'),
    },
    {
      id: 'action-review-leave',
      title: 'Review Leave Requests',
      description: 'Review and approve pending vacation and sick leave requests',
      permission: PERMISSIONS.LEAVE_APPROVE,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <polyline points="9 16 11 18 15 14" />
        </svg>
      ),
      onClick: () => handleActionClick('Review Leave', 'Time Off'),
    },
    {
      id: 'action-record-attendance',
      title: 'Record Attendance',
      description: 'Log manual check-in entries or shifts for staff members',
      permission: PERMISSIONS.ATTENDANCE_RECORD,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      onClick: () => handleActionClick('Record Attendance', 'Attendance'),
    },
    {
      id: 'action-export-reports',
      title: 'Generate HR Reports',
      description: 'Export compliance, attendance, and headcount reports to CSV/PDF',
      permission: PERMISSIONS.REPORTS_EXPORT,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      onClick: () => handleActionClick('Generate Reports', 'Reports'),
    },
    {
      id: 'action-payroll',
      title: 'Run Payroll Cycle',
      description: 'Review disbursements, deductions, and execute company pay run',
      permission: PERMISSIONS.PAYROLL_PROCESS,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
      onClick: () => handleActionClick('Run Payroll', 'Payroll Cycle'),
    },
    {
      id: 'action-departments',
      title: 'Manage Departments',
      description: 'Review organizational structure, divisions, and team leads',
      permission: PERMISSIONS.DEPARTMENTS_VIEW,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
      onClick: () => handleActionClick('Manage Departments', 'Departments'),
    },
    {
      id: 'action-settings',
      title: 'Organization Settings',
      description: 'Configure company profile, security policies, and holidays',
      permission: PERMISSIONS.SETTINGS_MANAGE,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      onClick: () => handleActionClick('Organization Settings', 'Settings'),
    },
  ];

  const accessibleActions = actions.filter(
    (action) => !action.permission || can(action.permission)
  );

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-section-title">Quick Operational Actions</h2>
          <p className="text-small" style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>
            Core administrative workflows guarded by role permissions
          </p>
        </div>
        <Badge variant="primary">RBAC Guarded</Badge>
      </CardHeader>
      <CardBody>
        {accessibleActions.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-8) var(--space-4)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
            }}
          >
            No quick operational actions currently require your attention.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {accessibleActions.map((action) => (
              <div
                key={action.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-subtle)',
                  gap: 'var(--space-3)',
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border-default)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: 'var(--elevation-1)',
                    }}
                    aria-hidden="true"
                  >
                    {action.icon}
                  </div>

                  <div>
                    <h3
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--color-text-primary)',
                        lineHeight: 'var(--leading-snug)',
                      }}
                    >
                      {action.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-secondary)',
                        marginTop: 'var(--space-1)',
                        lineHeight: 'var(--leading-relaxed)',
                      }}
                    >
                      {action.description}
                    </p>
                  </div>
                </div>

                <PermissionButton
                  permission={action.permission}
                  variant="secondary"
                  size="sm"
                  onClick={action.onClick}
                  style={{ flexShrink: 0, alignSelf: 'center' }}
                >
                  Launch
                </PermissionButton>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
