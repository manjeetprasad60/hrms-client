import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTE_PATHS } from '../routes/routePaths';
import { PERMISSIONS, type Permission } from '../permissions/permissions';
import { usePermission } from '../permissions/usePermission';

export interface NavigationProps {
  readonly isCollapsed?: boolean;
  readonly onItemClick?: () => void;
}

interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: React.ReactNode;
  readonly requiredPermission?: Permission;
  readonly anyPermissions?: readonly Permission[];
}

const navItems: readonly NavItem[] = [
  {
    label: 'Dashboard',
    path: ROUTE_PATHS.DASHBOARD,
    requiredPermission: PERMISSIONS.DASHBOARD_VIEW,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Employees',
    path: ROUTE_PATHS.EMPLOYEES,
    requiredPermission: PERMISSIONS.EMPLOYEES_VIEW,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Attendance',
    path: ROUTE_PATHS.ATTENDANCE,
    requiredPermission: PERMISSIONS.ATTENDANCE_VIEW,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: 'Leave',
    path: ROUTE_PATHS.LEAVE,
    requiredPermission: PERMISSIONS.LEAVE_VIEW,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Payroll',
    path: ROUTE_PATHS.PAYROLL,
    requiredPermission: PERMISSIONS.PAYROLL_VIEW,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Recruitment',
    path: ROUTE_PATHS.RECRUITMENT,
    requiredPermission: PERMISSIONS.RECRUITMENT_VIEW,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    label: 'Performance',
    path: ROUTE_PATHS.PERFORMANCE,
    requiredPermission: PERMISSIONS.PERFORMANCE_VIEW,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    label: 'Reports',
    path: ROUTE_PATHS.REPORTS,
    requiredPermission: PERMISSIONS.REPORTS_VIEW,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    path: ROUTE_PATHS.SETTINGS,
    anyPermissions: [
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.ORGANIZATION_VIEW,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.ROLES_VIEW,
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export function Navigation({ isCollapsed = false, onItemClick }: NavigationProps) {
  const { can, canAny } = usePermission();

  const accessibleNavItems = navItems.filter((item) => {
    if (item.requiredPermission && !can(item.requiredPermission)) {
      return false;
    }
    if (item.anyPermissions && item.anyPermissions.length > 0 && !canAny(item.anyPermissions)) {
      return false;
    }
    return true;
  });

  return (
    <nav
      aria-label="Sidebar navigation"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        padding: 'var(--space-3) var(--space-2)',
      }}
    >
      {accessibleNavItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onItemClick}
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''} ${isCollapsed ? 'nav-item-collapsed' : ''}`
          }
          title={isCollapsed ? item.label : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: isCollapsed ? 'var(--space-2)' : 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            transition: 'background-color var(--transition-fast), color var(--transition-fast)',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {item.icon}
          </span>
          {!isCollapsed && <span>{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}
