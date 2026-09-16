/**
 * Granular Client Permission Keys
 *
 * Scoped strictly to client-organization operations.
 * Implements the Resource + Action model:
 * User -> Role -> Permissions -> Resource + Action
 *
 * Example:
 * employees.view, employees.create, employees.edit, employees.delete
 * attendance.view, attendance.manage
 * leave.view, leave.approve
 */

import { RESOURCES, ACTIONS } from './resources';

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: `${RESOURCES.DASHBOARD}.${ACTIONS.VIEW}` as const,

  // Organization Core
  ORGANIZATION_VIEW: `${RESOURCES.ORGANIZATION}.${ACTIONS.VIEW}` as const,
  ORGANIZATION_EDIT: `${RESOURCES.ORGANIZATION}.${ACTIONS.EDIT}` as const,
  ORGANIZATION_MANAGE: `${RESOURCES.ORGANIZATION}.${ACTIONS.MANAGE}` as const,
  ORG_VIEW: `${RESOURCES.ORGANIZATION}.${ACTIONS.VIEW}` as const,
  ORG_EDIT: `${RESOURCES.ORGANIZATION}.${ACTIONS.EDIT}` as const,
  ORG_MANAGE: `${RESOURCES.ORGANIZATION}.${ACTIONS.MANAGE}` as const,

  // Departments
  DEPARTMENTS_VIEW: `${RESOURCES.DEPARTMENTS}.${ACTIONS.VIEW}` as const,
  DEPARTMENTS_CREATE: `${RESOURCES.DEPARTMENTS}.${ACTIONS.CREATE}` as const,
  DEPARTMENTS_EDIT: `${RESOURCES.DEPARTMENTS}.${ACTIONS.EDIT}` as const,
  DEPARTMENTS_UPDATE: `${RESOURCES.DEPARTMENTS}.${ACTIONS.EDIT}` as const,
  DEPARTMENTS_DELETE: `${RESOURCES.DEPARTMENTS}.${ACTIONS.DELETE}` as const,

  // Locations
  LOCATIONS_VIEW: `${RESOURCES.LOCATIONS}.${ACTIONS.VIEW}` as const,
  LOCATIONS_CREATE: `${RESOURCES.LOCATIONS}.${ACTIONS.CREATE}` as const,
  LOCATIONS_EDIT: `${RESOURCES.LOCATIONS}.${ACTIONS.EDIT}` as const,
  LOCATIONS_UPDATE: `${RESOURCES.LOCATIONS}.${ACTIONS.EDIT}` as const,
  LOCATIONS_DELETE: `${RESOURCES.LOCATIONS}.${ACTIONS.DELETE}` as const,

  // Client Users & Roles
  USERS_VIEW: `${RESOURCES.USERS}.${ACTIONS.VIEW}` as const,
  USERS_INVITE: `${RESOURCES.USERS}.${ACTIONS.INVITE}` as const,
  USERS_CREATE: `${RESOURCES.USERS}.${ACTIONS.CREATE}` as const,
  USERS_EDIT: `${RESOURCES.USERS}.${ACTIONS.EDIT}` as const,
  USERS_SUSPEND: `${RESOURCES.USERS}.${ACTIONS.SUSPEND}` as const,
  USERS_UPDATE: `${RESOURCES.USERS}.${ACTIONS.EDIT}` as const,
  USERS_DELETE: `${RESOURCES.USERS}.${ACTIONS.DELETE}` as const,
  USERS_MANAGE: `${RESOURCES.USERS}.${ACTIONS.MANAGE}` as const,
  ROLES_VIEW: `${RESOURCES.ROLES}.${ACTIONS.VIEW}` as const,
  ROLES_CREATE: `${RESOURCES.ROLES}.${ACTIONS.CREATE}` as const,
  ROLES_EDIT: `${RESOURCES.ROLES}.${ACTIONS.EDIT}` as const,
  ROLES_DELETE: `${RESOURCES.ROLES}.${ACTIONS.DELETE}` as const,
  ROLES_MANAGE: `${RESOURCES.ROLES}.${ACTIONS.MANAGE}` as const,

  // Employees & Directory
  EMPLOYEES_VIEW: `${RESOURCES.EMPLOYEES}.${ACTIONS.VIEW}` as const,
  EMPLOYEES_CREATE: `${RESOURCES.EMPLOYEES}.${ACTIONS.CREATE}` as const,
  EMPLOYEES_EDIT: `${RESOURCES.EMPLOYEES}.${ACTIONS.EDIT}` as const,
  EMPLOYEES_UPDATE: `${RESOURCES.EMPLOYEES}.${ACTIONS.EDIT}` as const,
  EMPLOYEES_DELETE: `${RESOURCES.EMPLOYEES}.${ACTIONS.DELETE}` as const,

  // Attendance & Time
  ATTENDANCE_VIEW: `${RESOURCES.ATTENDANCE}.${ACTIONS.VIEW}` as const,
  ATTENDANCE_RECORD: `${RESOURCES.ATTENDANCE}.${ACTIONS.RECORD}` as const,
  ATTENDANCE_MANAGE: `${RESOURCES.ATTENDANCE}.${ACTIONS.MANAGE}` as const,

  // Leave & Time Off
  LEAVE_VIEW: `${RESOURCES.LEAVE}.${ACTIONS.VIEW}` as const,
  LEAVE_CREATE: `${RESOURCES.LEAVE}.${ACTIONS.CREATE}` as const,
  LEAVE_APPLY: `${RESOURCES.LEAVE}.${ACTIONS.APPLY}` as const,
  LEAVE_APPROVE: `${RESOURCES.LEAVE}.${ACTIONS.APPROVE}` as const,
  LEAVE_MANAGE: `${RESOURCES.LEAVE}.${ACTIONS.MANAGE}` as const,
  LEAVES_VIEW: `${RESOURCES.LEAVE}.${ACTIONS.VIEW}` as const,
  LEAVES_CREATE: `${RESOURCES.LEAVE}.${ACTIONS.CREATE}` as const,
  LEAVES_APPLY: `${RESOURCES.LEAVE}.${ACTIONS.APPLY}` as const,
  LEAVES_APPROVE: `${RESOURCES.LEAVE}.${ACTIONS.APPROVE}` as const,
  LEAVES_MANAGE: `${RESOURCES.LEAVE}.${ACTIONS.MANAGE}` as const,

  // Payroll
  PAYROLL_VIEW: `${RESOURCES.PAYROLL}.${ACTIONS.VIEW}` as const,
  PAYROLL_PROCESS: `${RESOURCES.PAYROLL}.${ACTIONS.PROCESS}` as const,
  PAYROLL_MANAGE: `${RESOURCES.PAYROLL}.${ACTIONS.MANAGE}` as const,

  // Recruitment
  RECRUITMENT_VIEW: `${RESOURCES.RECRUITMENT}.${ACTIONS.VIEW}` as const,
  RECRUITMENT_MANAGE: `${RESOURCES.RECRUITMENT}.${ACTIONS.MANAGE}` as const,

  // Performance
  PERFORMANCE_VIEW: `${RESOURCES.PERFORMANCE}.${ACTIONS.VIEW}` as const,
  PERFORMANCE_MANAGE: `${RESOURCES.PERFORMANCE}.${ACTIONS.MANAGE}` as const,

  // Reports
  REPORTS_VIEW: `${RESOURCES.REPORTS}.${ACTIONS.VIEW}` as const,
  REPORTS_EXPORT: `${RESOURCES.REPORTS}.${ACTIONS.EXPORT}` as const,

  // Settings
  SETTINGS_VIEW: `${RESOURCES.SETTINGS}.${ACTIONS.VIEW}` as const,
  SETTINGS_MANAGE: `${RESOURCES.SETTINGS}.${ACTIONS.MANAGE}` as const,

  // Audit Logs
  AUDIT_VIEW: `${RESOURCES.AUDIT}.${ACTIONS.VIEW}` as const,
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type Permission = PermissionKey;


/**
 * Normalizes legacy colon-based or plural formats to canonical dot-notation keys.
 * e.g. "employees:view" -> "employees.view"
 *      "leaves:view"    -> "leave.view"
 *      "leave.approve"  -> "leave.approve"
 */
export function normalizePermissionKey(key: string): PermissionKey {
  const normalized = key
    .trim()
    .replace(/:/g, '.')
    .replace(/^org\./, 'organization.')
    .replace(/^leaves\./, 'leave.')
    .replace(/\.update$/, '.edit');

  return normalized as PermissionKey;
}
