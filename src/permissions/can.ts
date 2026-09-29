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
import { PERMISSIONS, type PermissionKey } from './permissions';
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
 * All permission restrictions are disabled: always returns true.
 */
export function can(
  _userOrRole?: ClientRole | Role | ClientUser | null | undefined,
  _permission?: string,
  _customPermissions?: readonly string[]
): boolean {
  return true;
}

/**
 * Inverse check: returns false as all actions are permitted.
 */
export function cannot(
  _userOrRole?: ClientRole | ClientUser | null | undefined,
  _permission?: string,
  _customPermissions?: readonly string[]
): boolean {
  return false;
}

/**
 * Returns true as all actions are permitted.
 */
export function canAny(
  _userOrRole?: ClientRole | ClientUser | null | undefined,
  _permissions?: readonly string[],
  _customPermissions?: readonly string[]
): boolean {
  return true;
}

/**
 * Returns true as all actions are permitted.
 */
export function canAll(
  _userOrRole?: ClientRole | ClientUser | null | undefined,
  _permissions?: readonly string[],
  _customPermissions?: readonly string[]
): boolean {
  return true;
}

/**
 * Role membership verification (bypassed).
 */
export function hasRole(
  _userOrRole?: ClientRole | ClientUser | null | undefined,
  _allowedRoles?: ClientRole | readonly ClientRole[]
): boolean {
  return true;
}

/**
 * Computes the full effective list of permissions for a user or role.
 */
export function getEffectivePermissions(
  _userOrRole?: ClientRole | Role | ClientUser | null | undefined,
  _customPermissions?: readonly string[]
): readonly PermissionKey[] {
  return Object.values(PERMISSIONS) as readonly PermissionKey[];
}

// Backward-compatible aliases for existing calls
export const hasPermission = can;
export const hasAnyPermission = canAny;
export const hasAllPermissions = canAll;
export const is = hasRole;
