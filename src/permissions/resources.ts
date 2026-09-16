/**
 * Domain Resources and Actions
 *
 * Defines the atomic resources and operations for the client-admin permission taxonomy.
 * Forms the base building blocks of the Resource + Action model:
 * User -> Role -> Permissions -> Resource + Action
 */

export const RESOURCES = {
  DASHBOARD: 'dashboard',
  EMPLOYEES: 'employees',
  ATTENDANCE: 'attendance',
  LEAVE: 'leave',
  PAYROLL: 'payroll',
  RECRUITMENT: 'recruitment',
  PERFORMANCE: 'performance',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  ORGANIZATION: 'organization',
  DEPARTMENTS: 'departments',
  LOCATIONS: 'locations',
  USERS: 'users',
  ROLES: 'roles',
  AUDIT: 'audit',
} as const;

export type Resource = typeof RESOURCES[keyof typeof RESOURCES];

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  MANAGE: 'manage',
  RECORD: 'record',
  APPLY: 'apply',
  APPROVE: 'approve',
  PROCESS: 'process',
  EXPORT: 'export',
  INVITE: 'invite',
  SUSPEND: 'suspend',
} as const;

export type Action = typeof ACTIONS[keyof typeof ACTIONS];
