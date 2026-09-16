/**
 * Centralized Permission Evaluation Engine
 *
 * Implements the Resource + Action permission resolution logic:
 * User -> Role -> Permissions -> Resource + Action
 *
 * Evaluates questions of the form:
 * "Can this user perform this action?"
 * e.g. can("employees.view"), can("employees.create"), can("leave.approve")
 *
 * NOTE: Frontend checks are strictly for user experience, visibility, and progressive disclosure.
 * They are not a tamper-proof security barrier; server-side rules are the authoritative boundary.
 */

import { SYSTEM_ROLE_PERMISSIONS, type ClientRole } from './roles';
import { type PermissionKey, normalizePermissionKey } from './permissions';
import type { ClientUser } from '../types/auth';
import type { Role } from '../types/role';

/**
 * Role-to-permission mapping defining standard capabilities for each system role.
 */
export const ROLE_DEFAULT_PERMISSIONS: Record<ClientRole, readonly PermissionKey[]> = SYSTEM_ROLE_PERMISSIONS;

// Dynamic custom role registry for runtime lookup
const DYNAMIC_ROLE_REGISTRY = new Map<string, Role>();

/**
 * Registers a dynamic or tenant-configured role into the evaluation engine.
 */
export function registerDynamicRole(role: Role): void {
  DYNAMIC_ROLE_REGISTRY.set(role.id, role);
  if (role.code) {
    DYNAMIC_ROLE_REGISTRY.set(role.code, role);
  }
}

/**
 * Removes a custom role from the runtime evaluation engine.
 */
export function unregisterDynamicRole(roleIdOrCode: string): void {
  DYNAMIC_ROLE_REGISTRY.delete(roleIdOrCode);
}

// Pre-computed Set lookups for O(1) performance during frequent renders
const ROLE_PERMISSION_SETS = new Map<ClientRole, Set<PermissionKey>>(
  Object.entries(ROLE_DEFAULT_PERMISSIONS).map(([role, perms]) => [
    role as ClientRole,
    new Set(perms),
  ])
);

/**
 * Extracts role from a ClientRole string, Role object, or ClientUser object.
 */
function extractRole(userOrRole: ClientRole | Role | ClientUser | null | undefined): ClientRole | null {
  if (!userOrRole) return null;
  if (typeof userOrRole === 'string') return userOrRole;
  if ('code' in userOrRole && typeof userOrRole.code === 'string') {
    return userOrRole.code as ClientRole;
  }
  return (userOrRole as ClientUser).role ?? null;
}

/**
 * Returns the default permission catalog for a given client role or role ID.
 */
export function getPermissionsForRole(roleOrCode: ClientRole | string): readonly PermissionKey[] {
  const dynamic = DYNAMIC_ROLE_REGISTRY.get(roleOrCode);
  if (dynamic) {
    return dynamic.permissionIds || (dynamic.permissions as readonly PermissionKey[]) || [];
  }
  return ROLE_DEFAULT_PERMISSIONS[roleOrCode as ClientRole] ?? [];
}

/**
 * Centralized Permission Evaluator
 *
 * Core engine answering: "Can this user perform this action?"
 * Examples:
 * - can(user, "employees.view")
 * - can(user, "employees.create")
 * - can(user, "leave.approve")
 */
export function can(
  userOrRole: ClientRole | Role | ClientUser | null | undefined,
  permission: string,
  customPermissions?: readonly string[]
): boolean {
  if (!userOrRole) return false;

  const normalized = normalizePermissionKey(permission);

  // Check custom granted permissions if present
  if (customPermissions && customPermissions.length > 0) {
    const hasCustom = customPermissions.some(
      (p) => normalizePermissionKey(p) === normalized
    );
    if (hasCustom) return true;
  }

  // If a full Role object is passed directly
  if (typeof userOrRole === 'object' && 'permissionIds' in userOrRole) {
    const rolePerms = userOrRole.permissionIds || (userOrRole.permissions as readonly PermissionKey[]) || [];
    return rolePerms.some((p) => normalizePermissionKey(p) === normalized);
  }

  // If user has a registered custom roleId
  if (typeof userOrRole === 'object' && 'roleId' in userOrRole && userOrRole.roleId) {
    const dynamic = DYNAMIC_ROLE_REGISTRY.get(userOrRole.roleId);
    if (dynamic) {
      const dynamicPerms = dynamic.permissionIds || (dynamic.permissions as readonly PermissionKey[]) || [];
      if (dynamicPerms.some((p) => normalizePermissionKey(p) === normalized)) {
        return true;
      }
    }
  }

  const role = extractRole(userOrRole);
  if (!role) return false;

  // Check role-based permission set
  const roleSet = ROLE_PERMISSION_SETS.get(role);
  if (roleSet && roleSet.has(normalized)) {
    return true;
  }

  // Check dynamic registry by role code or id
  const dynamicByCode = DYNAMIC_ROLE_REGISTRY.get(role);
  if (dynamicByCode) {
    const dynamicPerms = dynamicByCode.permissionIds || (dynamicByCode.permissions as readonly PermissionKey[]) || [];
    return dynamicPerms.some((p) => normalizePermissionKey(p) === normalized);
  }

  return false;
}

/**
 * Inverse check: returns true if the user CANNOT perform this action.
 */
export function cannot(
  userOrRole: ClientRole | ClientUser | null | undefined,
  permission: string,
  customPermissions?: readonly string[]
): boolean {
  return !can(userOrRole, permission, customPermissions);
}

/**
 * Returns true if the user possesses AT LEAST ONE of the specified permissions.
 */
export function canAny(
  userOrRole: ClientRole | ClientUser | null | undefined,
  permissions: readonly string[],
  customPermissions?: readonly string[]
): boolean {
  if (!permissions || permissions.length === 0) return false;
  return permissions.some((perm) => can(userOrRole, perm, customPermissions));
}

/**
 * Returns true if the user possesses ALL of the specified permissions.
 */
export function canAll(
  userOrRole: ClientRole | ClientUser | null | undefined,
  permissions: readonly string[],
  customPermissions?: readonly string[]
): boolean {
  if (!permissions || permissions.length === 0) return false;
  return permissions.every((perm) => can(userOrRole, perm, customPermissions));
}

/**
 * Role membership verification.
 */
export function hasRole(
  userOrRole: ClientRole | ClientUser | null | undefined,
  allowedRoles: ClientRole | readonly ClientRole[]
): boolean {
  const role = extractRole(userOrRole);
  if (!role) return false;

  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(role);
  }
  return role === allowedRoles;
}

/**
 * Computes the full effective list of permissions for a user or role.
 */
export function getEffectivePermissions(
  userOrRole: ClientRole | Role | ClientUser | null | undefined,
  customPermissions?: readonly string[]
): readonly PermissionKey[] {
  if (!userOrRole) return [];

  let basePermissions: readonly PermissionKey[];

  if (typeof userOrRole === 'object' && 'permissionIds' in userOrRole) {
    basePermissions = userOrRole.permissionIds || (userOrRole.permissions as readonly PermissionKey[]) || [];
  } else if (typeof userOrRole === 'object' && 'roleId' in userOrRole && userOrRole.roleId && DYNAMIC_ROLE_REGISTRY.has(userOrRole.roleId)) {
    const dynamic = DYNAMIC_ROLE_REGISTRY.get(userOrRole.roleId)!;
    basePermissions = dynamic.permissionIds || (dynamic.permissions as readonly PermissionKey[]) || [];
  } else {
    const role = extractRole(userOrRole);
    if (!role) return [];
    basePermissions = getPermissionsForRole(role);
  }

  if (!customPermissions || customPermissions.length === 0) {
    return basePermissions;
  }

  const normalizedCustom = customPermissions.map(normalizePermissionKey);
  return Array.from(new Set([...basePermissions, ...normalizedCustom]));
}

// Backward-compatible aliases for existing calls
export const hasPermission = can;
export const hasAnyPermission = canAny;
export const hasAllPermissions = canAll;
export const is = hasRole;
