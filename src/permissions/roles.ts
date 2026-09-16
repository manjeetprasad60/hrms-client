/**
 * Client-level Role Definitions & Metadata
 *
 * System roles predefined by the platform for client organizations.
 * Supports custom role extension by organization admins.
 */

import type { Role } from '../types/role';
import { PERMISSIONS, type PermissionKey } from './permissions';

export const CLIENT_ROLES = {
  ORG_ADMIN: 'org_admin',
  HR_MANAGER: 'hr_manager',
  PAYROLL_ADMIN: 'payroll_admin',
  DEPARTMENT_HEAD: 'dept_head',
  EMPLOYEE: 'employee',
} as const;

export type ClientRole = typeof CLIENT_ROLES[keyof typeof CLIENT_ROLES];

export interface ClientRoleMetadata {
  readonly code: ClientRole;
  readonly name: string;
  readonly description: string;
  readonly isSystemRole: boolean;
}

export const CLIENT_ROLE_METADATA: Record<ClientRole, ClientRoleMetadata> = {
  [CLIENT_ROLES.ORG_ADMIN]: {
    code: CLIENT_ROLES.ORG_ADMIN,
    name: 'Organization Admin',
    description: 'Full administrative access to manage all organization settings, workforce, and operational workflows.',
    isSystemRole: true,
  },
  [CLIENT_ROLES.HR_MANAGER]: {
    code: CLIENT_ROLES.HR_MANAGER,
    name: 'HR Manager',
    description: 'Manages employee directory, departments, leave policies, attendance tracking, and HR reporting.',
    isSystemRole: true,
  },
  [CLIENT_ROLES.PAYROLL_ADMIN]: {
    code: CLIENT_ROLES.PAYROLL_ADMIN,
    name: 'Payroll Administrator',
    description: 'Processes compensation runs, reviews timesheet approvals, and generates payroll compliance summaries.',
    isSystemRole: true,
  },
  [CLIENT_ROLES.DEPARTMENT_HEAD]: {
    code: CLIENT_ROLES.DEPARTMENT_HEAD,
    name: 'Department Head',
    description: 'Oversees departmental staff, reviews time logs, and handles leave request approvals for assigned teams.',
    isSystemRole: true,
  },
  [CLIENT_ROLES.EMPLOYEE]: {
    code: CLIENT_ROLES.EMPLOYEE,
    name: 'Employee',
    description: 'Standard workforce self-service access for clock-ins, leave submissions, and personal profile viewing.',
    isSystemRole: true,
  },
};

export const CLIENT_ROLE_LABELS: Record<ClientRole, string> = {
  [CLIENT_ROLES.ORG_ADMIN]: CLIENT_ROLE_METADATA[CLIENT_ROLES.ORG_ADMIN].name,
  [CLIENT_ROLES.HR_MANAGER]: CLIENT_ROLE_METADATA[CLIENT_ROLES.HR_MANAGER].name,
  [CLIENT_ROLES.PAYROLL_ADMIN]: CLIENT_ROLE_METADATA[CLIENT_ROLES.PAYROLL_ADMIN].name,
  [CLIENT_ROLES.DEPARTMENT_HEAD]: CLIENT_ROLE_METADATA[CLIENT_ROLES.DEPARTMENT_HEAD].name,
  [CLIENT_ROLES.EMPLOYEE]: CLIENT_ROLE_METADATA[CLIENT_ROLES.EMPLOYEE].name,
};

/**
 * Standard baseline permissions mapped to each system role.
 */
export const SYSTEM_ROLE_PERMISSIONS: Record<ClientRole, readonly PermissionKey[]> = {
  [CLIENT_ROLES.ORG_ADMIN]: Array.from(new Set(Object.values(PERMISSIONS))),

  [CLIENT_ROLES.HR_MANAGER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.DEPARTMENTS_VIEW,
    PERMISSIONS.DEPARTMENTS_CREATE,
    PERMISSIONS.DEPARTMENTS_EDIT,
    PERMISSIONS.LOCATIONS_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_INVITE,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_EDIT,
    PERMISSIONS.EMPLOYEES_DELETE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_RECORD,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_CREATE,
    PERMISSIONS.LEAVE_APPLY,
    PERMISSIONS.LEAVE_APPROVE,
    PERMISSIONS.LEAVE_MANAGE,
    PERMISSIONS.RECRUITMENT_VIEW,
    PERMISSIONS.RECRUITMENT_MANAGE,
    PERMISSIONS.PERFORMANCE_VIEW,
    PERMISSIONS.PERFORMANCE_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.AUDIT_VIEW,
  ],

  [CLIENT_ROLES.PAYROLL_ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.PAYROLL_PROCESS,
    PERMISSIONS.PAYROLL_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  [CLIENT_ROLES.DEPARTMENT_HEAD]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.DEPARTMENTS_VIEW,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_RECORD,
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_CREATE,
    PERMISSIONS.LEAVE_APPLY,
    PERMISSIONS.LEAVE_APPROVE,
    PERMISSIONS.PERFORMANCE_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],

  [CLIENT_ROLES.EMPLOYEE]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ATTENDANCE_RECORD,
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_CREATE,
    PERMISSIONS.LEAVE_APPLY,
  ],
};

/**
 * Returns the list of roles that a given administrator is authorized to delegate.
 * Enforces role delegation hierarchy preventing privilege escalation.
 */
export function getAllowedAssignableRoles(actorRole?: ClientRole | null): readonly ClientRole[] {
  if (!actorRole) return [];
  switch (actorRole) {
    case CLIENT_ROLES.ORG_ADMIN:
      return [
        CLIENT_ROLES.ORG_ADMIN,
        CLIENT_ROLES.HR_MANAGER,
        CLIENT_ROLES.PAYROLL_ADMIN,
        CLIENT_ROLES.DEPARTMENT_HEAD,
        CLIENT_ROLES.EMPLOYEE,
      ];
    case CLIENT_ROLES.HR_MANAGER:
      return [
        CLIENT_ROLES.HR_MANAGER,
        CLIENT_ROLES.PAYROLL_ADMIN,
        CLIENT_ROLES.DEPARTMENT_HEAD,
        CLIENT_ROLES.EMPLOYEE,
      ];
    case CLIENT_ROLES.DEPARTMENT_HEAD:
      return [CLIENT_ROLES.EMPLOYEE];
    default:
      return [];
  }
}

/**
 * Checks whether an actor with actorRole is authorized to assign targetRole to another user.
 */
export function canAssignRole(actorRole: ClientRole | null | undefined, targetRole: ClientRole): boolean {
  const allowed = getAllowedAssignableRoles(actorRole);
  return allowed.includes(targetRole);
}

/**
 * Complete, immutable System Role definitions for client organizations.
 */
export const SYSTEM_ROLES: readonly Role[] = [
  {
    id: 'role_org_admin',
    organizationId: 'system',
    clientId: 'system',
    code: CLIENT_ROLES.ORG_ADMIN,
    name: CLIENT_ROLE_METADATA[CLIENT_ROLES.ORG_ADMIN].name,
    description: CLIENT_ROLE_METADATA[CLIENT_ROLES.ORG_ADMIN].description,
    permissionIds: SYSTEM_ROLE_PERMISSIONS[CLIENT_ROLES.ORG_ADMIN],
    permissions: SYSTEM_ROLE_PERMISSIONS[CLIENT_ROLES.ORG_ADMIN],
    status: 'active',
    isSystemRole: true,
    isCustomRole: false,
    allowedAssignableRoles: getAllowedAssignableRoles(CLIENT_ROLES.ORG_ADMIN),
    hierarchyLevel: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role_hr_manager',
    organizationId: 'system',
    clientId: 'system',
    code: CLIENT_ROLES.HR_MANAGER,
    name: CLIENT_ROLE_METADATA[CLIENT_ROLES.HR_MANAGER].name,
    description: CLIENT_ROLE_METADATA[CLIENT_ROLES.HR_MANAGER].description,
    permissionIds: SYSTEM_ROLE_PERMISSIONS[CLIENT_ROLES.HR_MANAGER],
    permissions: SYSTEM_ROLE_PERMISSIONS[CLIENT_ROLES.HR_MANAGER],
    status: 'active',
    isSystemRole: true,
    isCustomRole: false,
    allowedAssignableRoles: getAllowedAssignableRoles(CLIENT_ROLES.HR_MANAGER),
    hierarchyLevel: 80,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role_payroll_admin',
    organizationId: 'system',
    clientId: 'system',
    code: CLIENT_ROLES.PAYROLL_ADMIN,
    name: CLIENT_ROLE_METADATA[CLIENT_ROLES.PAYROLL_ADMIN].name,
    description: CLIENT_ROLE_METADATA[CLIENT_ROLES.PAYROLL_ADMIN].description,
    permissionIds: SYSTEM_ROLE_PERMISSIONS[CLIENT_ROLES.PAYROLL_ADMIN],
    permissions: SYSTEM_ROLE_PERMISSIONS[CLIENT_ROLES.PAYROLL_ADMIN],
    status: 'active',
    isSystemRole: true,
    isCustomRole: false,
    allowedAssignableRoles: getAllowedAssignableRoles(CLIENT_ROLES.PAYROLL_ADMIN),
    hierarchyLevel: 70,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role_dept_head',
    organizationId: 'system',
    clientId: 'system',
    code: CLIENT_ROLES.DEPARTMENT_HEAD,
    name: CLIENT_ROLE_METADATA[CLIENT_ROLES.DEPARTMENT_HEAD].name,
    description: CLIENT_ROLE_METADATA[CLIENT_ROLES.DEPARTMENT_HEAD].description,
    permissionIds: SYSTEM_ROLE_PERMISSIONS[CLIENT_ROLES.DEPARTMENT_HEAD],
    permissions: SYSTEM_ROLE_PERMISSIONS[CLIENT_ROLES.DEPARTMENT_HEAD],
    status: 'active',
    isSystemRole: true,
    isCustomRole: false,
    allowedAssignableRoles: getAllowedAssignableRoles(CLIENT_ROLES.DEPARTMENT_HEAD),
    hierarchyLevel: 50,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role_employee',
    organizationId: 'system',
    clientId: 'system',
    code: CLIENT_ROLES.EMPLOYEE,
    name: CLIENT_ROLE_METADATA[CLIENT_ROLES.EMPLOYEE].name,
    description: CLIENT_ROLE_METADATA[CLIENT_ROLES.EMPLOYEE].description,
    permissionIds: SYSTEM_ROLE_PERMISSIONS[CLIENT_ROLES.EMPLOYEE],
    permissions: SYSTEM_ROLE_PERMISSIONS[CLIENT_ROLES.EMPLOYEE],
    status: 'active',
    isSystemRole: true,
    isCustomRole: false,
    allowedAssignableRoles: getAllowedAssignableRoles(CLIENT_ROLES.EMPLOYEE),
    hierarchyLevel: 10,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * Returns true if the given identifier or code represents a built-in protected system role.
 */
export function isSystemRole(roleIdOrCode: string): boolean {
  if (!roleIdOrCode) return false;
  const clean = roleIdOrCode.trim();
  return (
    clean.startsWith('role_') && SYSTEM_ROLES.some((r) => r.id === clean) ||
    Object.values(CLIENT_ROLES).includes(clean as ClientRole)
  );
}

/**
 * Returns true if the given identifier represents a tenant-created custom role.
 */
export function isCustomRole(roleIdOrCode: string): boolean {
  return !isSystemRole(roleIdOrCode);
}

/**
 * Retrieves immutable definitions of all platform system roles.
 */
export function getSystemRoleDefinitions(): readonly Role[] {
  return SYSTEM_ROLES;
}

/**
 * Finds a system role definition by its programmatic code.
 */
export function getSystemRoleByCode(code: string): Role | null {
  return SYSTEM_ROLES.find((r) => r.code === code) ?? null;
}

/**
 * Finds a system role definition by its unique identifier.
 */
export function getSystemRoleById(id: string): Role | null {
  return SYSTEM_ROLES.find((r) => r.id === id) ?? null;
}

/**
 * Anti-Privilege Escalation Validator:
 * Verifies that candidatePermissions are a strict subset of the actor's effective permissions.
 * Prevents an administrator from delegating permissions they do not possess.
 */
export function validateRolePermissionsSubset(
  candidatePermissions: readonly string[],
  actorPermissions: readonly string[]
): boolean {
  if (!candidatePermissions || candidatePermissions.length === 0) {
    return true;
  }
  const actorSet = new Set(actorPermissions);
  return candidatePermissions.every((p) => actorSet.has(p));
}

/**
 * Advanced Anti-Privilege Escalation Validator for Role Assignment:
 *
 * Verifies whether an actor is authorized to assign a target role to a user.
 * - If actor is ORG_ADMIN: authorized to assign any valid organizational role.
 * - Non-ORG_ADMIN actors can NEVER assign ORG_ADMIN.
 * - Target role's permissions must be a strict subset of the actor's effective permissions.
 * - For system roles: must be in the actor's allowed assignable roles.
 */
export function canActorAssignRole(
  actorRole: ClientRole | string | null | undefined,
  actorPermissions: readonly string[],
  targetRoleCodeOrId: string,
  targetRolePermissions: readonly string[]
): boolean {
  if (!actorRole || !targetRoleCodeOrId) return false;

  // 1. Organization Administrator can assign any valid role
  if (actorRole === CLIENT_ROLES.ORG_ADMIN) {
    return true;
  }

  // 2. Non-org_admin can NEVER assign the org_admin role
  if (targetRoleCodeOrId === CLIENT_ROLES.ORG_ADMIN || targetRoleCodeOrId === 'role_org_admin') {
    return false;
  }

  // 3. For built-in system roles, check hierarchical delegation
  if (Object.values(CLIENT_ROLES).includes(targetRoleCodeOrId as ClientRole)) {
    const allowed = getAllowedAssignableRoles(actorRole as ClientRole);
    if (!allowed.includes(targetRoleCodeOrId as ClientRole)) {
      return false;
    }
  }

  // 4. Strict Subset Check: target permissions must not exceed actor's active permissions
  return validateRolePermissionsSubset(targetRolePermissions, actorPermissions);
}



