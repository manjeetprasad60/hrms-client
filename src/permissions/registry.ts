/**
 * Permission Registry & Scalable Domain Taxonomy
 *
 * Centralized registry defining atomic permissions organized by resource category.
 * Distinguishes currently implemented permissions from planned future HR modules.
 *
 * Structure:
 * resource.action
 */

import { RESOURCES, type Resource, ACTIONS, type Action } from './resources';
import { PERMISSIONS, type PermissionKey } from './permissions';

export const PERMISSION_CATEGORIES = {
  ORGANIZATION: 'Organization',
  USERS: 'Users',
  ROLES: 'Roles',
  EMPLOYEES: 'Employees',
  ATTENDANCE: 'Attendance',
  LEAVE: 'Leave',
  PAYROLL: 'Payroll',
  RECRUITMENT: 'Recruitment',
  REPORTS: 'Reports',
  SETTINGS: 'Settings',
  DASHBOARD: 'Dashboard',
} as const;

export type PermissionCategory = typeof PERMISSION_CATEGORIES[keyof typeof PERMISSION_CATEGORIES];

export interface PermissionDefinition {
  /** Canonical resource.action dot-notation identifier */
  readonly key: PermissionKey;

  /** Domain resource */
  readonly resource: Resource;

  /** Atomic action verb */
  readonly action: Action;

  /** Conceptual business category */
  readonly category: PermissionCategory;

  /** UI-independent display title */
  readonly name: string;

  /** Operational description of what this permission permits */
  readonly description: string;

  /** True if this capability is implemented in the current product phase */
  readonly isImplemented: boolean;
}

/**
 * Authoritative Central Permission Catalog
 */
export const PERMISSION_CATALOG: readonly PermissionDefinition[] = [
  // -------------------------------------------------------------
  // Organization (Implemented)
  // -------------------------------------------------------------
  {
    key: PERMISSIONS.ORGANIZATION_VIEW,
    resource: RESOURCES.ORGANIZATION,
    action: ACTIONS.VIEW,
    category: PERMISSION_CATEGORIES.ORGANIZATION,
    name: 'View Organization Profile',
    description: 'Inspect organization identity, legal details, currency, and timezone configurations.',
    isImplemented: true,
  },
  {
    key: PERMISSIONS.ORGANIZATION_EDIT,
    resource: RESOURCES.ORGANIZATION,
    action: ACTIONS.EDIT,
    category: PERMISSION_CATEGORIES.ORGANIZATION,
    name: 'Edit Organization Profile',
    description: 'Update organization display name, contact info, branding, and regional preferences.',
    isImplemented: true,
  },
  {
    key: PERMISSIONS.ORGANIZATION_MANAGE,
    resource: RESOURCES.ORGANIZATION,
    action: ACTIONS.MANAGE,
    category: PERMISSION_CATEGORIES.ORGANIZATION,
    name: 'Manage Organization',
    description: 'Full administrative control over organizational profile, legal entity, and high-level setup.',
    isImplemented: true,
  },

  // -------------------------------------------------------------
  // Users (Implemented)
  // -------------------------------------------------------------
  {
    key: PERMISSIONS.USERS_VIEW,
    resource: RESOURCES.USERS,
    action: ACTIONS.VIEW,
    category: PERMISSION_CATEGORIES.USERS,
    name: 'View Users',
    description: 'Browse the directory of administrative and workforce user accounts in the organization.',
    isImplemented: true,
  },
  {
    key: PERMISSIONS.USERS_INVITE,
    resource: RESOURCES.USERS,
    action: ACTIONS.INVITE,
    category: PERMISSION_CATEGORIES.USERS,
    name: 'Invite Users',
    description: 'Dispatch onboarding invitations and assign initial roles to new user candidates.',
    isImplemented: true,
  },
  {
    key: PERMISSIONS.USERS_CREATE,
    resource: RESOURCES.USERS,
    action: ACTIONS.CREATE,
    category: PERMISSION_CATEGORIES.USERS,
    name: 'Provision Users',
    description: 'Directly provision users or complete invitation workflows.',
    isImplemented: true,
  },
  {
    key: PERMISSIONS.USERS_EDIT,
    resource: RESOURCES.USERS,
    action: ACTIONS.EDIT,
    category: PERMISSION_CATEGORIES.USERS,
    name: 'Edit User Accounts',
    description: 'Update user profile metadata, departmental associations, and organizational role assignments.',
    isImplemented: true,
  },
  {
    key: PERMISSIONS.USERS_SUSPEND,
    resource: RESOURCES.USERS,
    action: ACTIONS.SUSPEND,
    category: PERMISSION_CATEGORIES.USERS,
    name: 'Suspend Users',
    description: 'Temporarily disable portal access for active users without revoking historical records.',
    isImplemented: true,
  },
  {
    key: PERMISSIONS.USERS_DELETE,
    resource: RESOURCES.USERS,
    action: ACTIONS.DELETE,
    category: PERMISSION_CATEGORIES.USERS,
    name: 'Deactivate Users',
    description: 'Soft-deactivate user accounts while preserving HR compliance and audit histories.',
    isImplemented: true,
  },
  {
    key: PERMISSIONS.USERS_MANAGE,
    resource: RESOURCES.USERS,
    action: ACTIONS.MANAGE,
    category: PERMISSION_CATEGORIES.USERS,
    name: 'Manage All Users',
    description: 'Full administrative authority over organizational users and credential lifecycles.',
    isImplemented: true,
  },

  // -------------------------------------------------------------
  // Roles (Implemented)
  // -------------------------------------------------------------
  {
    key: PERMISSIONS.ROLES_VIEW,
    resource: RESOURCES.ROLES,
    action: ACTIONS.VIEW,
    category: PERMISSION_CATEGORIES.ROLES,
    name: 'View Roles',
    description: 'Inspect built-in platform system roles and tenant-configured custom roles.',
    isImplemented: true,
  },
  {
    key: PERMISSIONS.ROLES_CREATE,
    resource: RESOURCES.ROLES,
    action: ACTIONS.CREATE,
    category: PERMISSION_CATEGORIES.ROLES,
    name: 'Create Custom Roles',
    description: 'Configure new custom roles with bounded, non-escalating permission assignments.',
    isImplemented: true,
  },
  {
    key: PERMISSIONS.ROLES_EDIT,
    resource: RESOURCES.ROLES,
    action: ACTIONS.EDIT,
    category: PERMISSION_CATEGORIES.ROLES,
    name: 'Edit Custom Roles',
    description: 'Modify display name, operational description, and permission sets of custom roles.',
    isImplemented: true,
  },
  {
    key: PERMISSIONS.ROLES_DELETE,
    resource: RESOURCES.ROLES,
    action: ACTIONS.DELETE,
    category: PERMISSION_CATEGORIES.ROLES,
    name: 'Delete Custom Roles',
    description: 'Remove unused custom roles that are not assigned to active user accounts.',
    isImplemented: true,
  },
  {
    key: PERMISSIONS.ROLES_MANAGE,
    resource: RESOURCES.ROLES,
    action: ACTIONS.MANAGE,
    category: PERMISSION_CATEGORIES.ROLES,
    name: 'Manage Roles',
    description: 'Full authority to configure, update, and manage tenant role definitions.',
    isImplemented: true,
  },

  // -------------------------------------------------------------
  // Settings (Implemented)
  // -------------------------------------------------------------
  {
    key: PERMISSIONS.SETTINGS_VIEW,
    resource: RESOURCES.SETTINGS,
    action: ACTIONS.VIEW,
    category: PERMISSION_CATEGORIES.SETTINGS,
    name: 'View Settings',
    description: 'Inspect organization settings catalog and active configurations.',
    isImplemented: true,
  },
  {
    key: PERMISSIONS.SETTINGS_MANAGE,
    resource: RESOURCES.SETTINGS,
    action: ACTIONS.MANAGE,
    category: PERMISSION_CATEGORIES.SETTINGS,
    name: 'Manage Settings',
    description: 'Modify organizational configuration, localization, and working calendars.',
    isImplemented: true,
  },

  // -------------------------------------------------------------
  // Dashboard (Implemented)
  // -------------------------------------------------------------
  {
    key: PERMISSIONS.DASHBOARD_VIEW,
    resource: RESOURCES.DASHBOARD,
    action: ACTIONS.VIEW,
    category: PERMISSION_CATEGORIES.DASHBOARD,
    name: 'View Dashboard',
    description: 'Access organizational overview, workforce stats, and operational metrics.',
    isImplemented: true,
  },

  // -------------------------------------------------------------
  // Employees (Future Module)
  // -------------------------------------------------------------
  {
    key: PERMISSIONS.EMPLOYEES_VIEW,
    resource: RESOURCES.EMPLOYEES,
    action: ACTIONS.VIEW,
    category: PERMISSION_CATEGORIES.EMPLOYEES,
    name: 'View Employees',
    description: 'Browse full employee directory, profiles, and job assignments.',
    isImplemented: false,
  },
  {
    key: PERMISSIONS.EMPLOYEES_CREATE,
    resource: RESOURCES.EMPLOYEES,
    action: ACTIONS.CREATE,
    category: PERMISSION_CATEGORIES.EMPLOYEES,
    name: 'Add Employees',
    description: 'Create and onboard new employee records in the directory.',
    isImplemented: false,
  },
  {
    key: PERMISSIONS.EMPLOYEES_EDIT,
    resource: RESOURCES.EMPLOYEES,
    action: ACTIONS.EDIT,
    category: PERMISSION_CATEGORIES.EMPLOYEES,
    name: 'Edit Employees',
    description: 'Update employee job details, departmental affiliations, and compensation tier.',
    isImplemented: false,
  },
  {
    key: PERMISSIONS.EMPLOYEES_DELETE,
    resource: RESOURCES.EMPLOYEES,
    action: ACTIONS.DELETE,
    category: PERMISSION_CATEGORIES.EMPLOYEES,
    name: 'Delete Employees',
    description: 'Process employee termination and archive employment records.',
    isImplemented: false,
  },

  // -------------------------------------------------------------
  // Attendance (Future Module)
  // -------------------------------------------------------------
  {
    key: PERMISSIONS.ATTENDANCE_VIEW,
    resource: RESOURCES.ATTENDANCE,
    action: ACTIONS.VIEW,
    category: PERMISSION_CATEGORIES.ATTENDANCE,
    name: 'View Attendance',
    description: 'Review employee daily clock records, timesheets, and attendance logs.',
    isImplemented: false,
  },
  {
    key: PERMISSIONS.ATTENDANCE_RECORD,
    resource: RESOURCES.ATTENDANCE,
    action: ACTIONS.RECORD,
    category: PERMISSION_CATEGORIES.ATTENDANCE,
    name: 'Record Attendance',
    description: 'Record clock-in, clock-out, and break timestamps.',
    isImplemented: false,
  },
  {
    key: PERMISSIONS.ATTENDANCE_MANAGE,
    resource: RESOURCES.ATTENDANCE,
    action: ACTIONS.MANAGE,
    category: PERMISSION_CATEGORIES.ATTENDANCE,
    name: 'Manage Attendance',
    description: 'Adjust attendance logs, resolve punch anomalies, and configure shift policies.',
    isImplemented: false,
  },

  // -------------------------------------------------------------
  // Leave (Future Module)
  // -------------------------------------------------------------
  {
    key: PERMISSIONS.LEAVE_VIEW,
    resource: RESOURCES.LEAVE,
    action: ACTIONS.VIEW,
    category: PERMISSION_CATEGORIES.LEAVE,
    name: 'View Leave',
    description: 'Inspect time-off balances, historical requests, and team leave calendars.',
    isImplemented: false,
  },
  {
    key: PERMISSIONS.LEAVE_CREATE,
    resource: RESOURCES.LEAVE,
    action: ACTIONS.CREATE,
    category: PERMISSION_CATEGORIES.LEAVE,
    name: 'Create Leave Policies',
    description: 'Define vacation, sick, and personal leave accrual policies.',
    isImplemented: false,
  },
  {
    key: PERMISSIONS.LEAVE_APPLY,
    resource: RESOURCES.LEAVE,
    action: ACTIONS.APPLY,
    category: PERMISSION_CATEGORIES.LEAVE,
    name: 'Apply for Leave',
    description: 'Submit time-off requests for supervisor review.',
    isImplemented: false,
  },
  {
    key: PERMISSIONS.LEAVE_APPROVE,
    resource: RESOURCES.LEAVE,
    action: ACTIONS.APPROVE,
    category: PERMISSION_CATEGORIES.LEAVE,
    name: 'Approve Leave',
    description: 'Review and approve/reject pending leave applications for subordinates.',
    isImplemented: false,
  },
  {
    key: PERMISSIONS.LEAVE_MANAGE,
    resource: RESOURCES.LEAVE,
    action: ACTIONS.MANAGE,
    category: PERMISSION_CATEGORIES.LEAVE,
    name: 'Manage Leave',
    description: 'Perform manual balance adjustments, policy overrides, and holiday calendar configuration.',
    isImplemented: false,
  },

  // -------------------------------------------------------------
  // Payroll (Future Module)
  // -------------------------------------------------------------
  {
    key: PERMISSIONS.PAYROLL_VIEW,
    resource: RESOURCES.PAYROLL,
    action: ACTIONS.VIEW,
    category: PERMISSION_CATEGORIES.PAYROLL,
    name: 'View Payroll',
    description: 'Inspect compensation summaries, historical payslips, and payroll disbursement logs.',
    isImplemented: false,
  },
  {
    key: PERMISSIONS.PAYROLL_PROCESS,
    resource: RESOURCES.PAYROLL,
    action: ACTIONS.PROCESS,
    category: PERMISSION_CATEGORIES.PAYROLL,
    name: 'Process Payroll',
    description: 'Execute regular and off-cycle payroll compensation calculation and distribution.',
    isImplemented: false,
  },
  {
    key: PERMISSIONS.PAYROLL_MANAGE,
    resource: RESOURCES.PAYROLL,
    action: ACTIONS.MANAGE,
    category: PERMISSION_CATEGORIES.PAYROLL,
    name: 'Manage Payroll',
    description: 'Configure salary bands, statutory tax tables, and payment gateway connections.',
    isImplemented: false,
  },

  // -------------------------------------------------------------
  // Recruitment (Future Module)
  // -------------------------------------------------------------
  {
    key: PERMISSIONS.RECRUITMENT_VIEW,
    resource: RESOURCES.RECRUITMENT,
    action: ACTIONS.VIEW,
    category: PERMISSION_CATEGORIES.RECRUITMENT,
    name: 'View Recruitment',
    description: 'Inspect open job requisitions, candidate profiles, and candidate pipeline stages.',
    isImplemented: false,
  },
  {
    key: PERMISSIONS.RECRUITMENT_MANAGE,
    resource: RESOURCES.RECRUITMENT,
    action: ACTIONS.MANAGE,
    category: PERMISSION_CATEGORIES.RECRUITMENT,
    name: 'Manage Recruitment',
    description: 'Create job postings, schedule candidate interviews, and manage hiring workflows.',
    isImplemented: false,
  },

  // -------------------------------------------------------------
  // Reports (Future Module)
  // -------------------------------------------------------------
  {
    key: PERMISSIONS.REPORTS_VIEW,
    resource: RESOURCES.REPORTS,
    action: ACTIONS.VIEW,
    category: PERMISSION_CATEGORIES.REPORTS,
    name: 'View Reports',
    description: 'Inspect standard organizational, attendance, turnover, and operational reports.',
    isImplemented: false,
  },
  {
    key: PERMISSIONS.REPORTS_EXPORT,
    resource: RESOURCES.REPORTS,
    action: ACTIONS.EXPORT,
    category: PERMISSION_CATEGORIES.REPORTS,
    name: 'Export Reports',
    description: 'Download CSV and PDF data exports containing workforce and administrative metrics.',
    isImplemented: false,
  },
];

// Lookup Map by canonical key for O(1) retrieval
const PERMISSION_MAP = new Map<string, PermissionDefinition>(
  PERMISSION_CATALOG.map((def) => [def.key, def])
);

/**
 * Resolves full metadata definition for a given permission key.
 */
export function getPermissionDefinition(key: string): PermissionDefinition | undefined {
  if (!key) return undefined;
  return PERMISSION_MAP.get(key.trim());
}

/**
 * Returns all permission definitions belonging to a specific conceptual category.
 */
export function getPermissionsByCategory(category: PermissionCategory): readonly PermissionDefinition[] {
  return PERMISSION_CATALOG.filter((def) => def.category === category);
}

/**
 * Returns all recognized permission category names.
 */
export function getAllPermissionCategories(): readonly PermissionCategory[] {
  return Object.values(PERMISSION_CATEGORIES);
}

/**
 * Returns only permissions that are active/implemented in the current product phase.
 */
export function getImplementedPermissions(): readonly PermissionDefinition[] {
  return PERMISSION_CATALOG.filter((def) => def.isImplemented);
}

/**
 * Groups all permissions into a record keyed by category name.
 */
export function groupPermissionsByCategory(): Record<PermissionCategory, readonly PermissionDefinition[]> {
  const grouped = {} as Record<PermissionCategory, PermissionDefinition[]>;
  for (const cat of getAllPermissionCategories()) {
    grouped[cat] = [];
  }
  for (const def of PERMISSION_CATALOG) {
    if (!grouped[def.category]) {
      grouped[def.category] = [];
    }
    grouped[def.category].push(def);
  }
  return grouped;
}

/**
 * Type guard verifying if a string corresponds to a recognized PermissionKey.
 */
export function isPermissionKey(key: string): key is PermissionKey {
  return PERMISSION_MAP.has(key);
}
