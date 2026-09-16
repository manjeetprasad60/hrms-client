/**
 * Role Service Types & Interfaces
 *
 * Defines the contract for Role-Based Access Control management:
 * User -> Role -> Permissions
 */

import type { Role, CreateRoleInput, UpdateRoleInput, RoleFilterParams } from '../../types/role';
import type { PermissionKey } from '../../permissions/permissions';
import type { ClientUser } from '../../types/auth';

export interface RoleService {
  /**
   * Retrieves all roles for the active client organization.
   * Includes both built-in system archetypes and tenant-configured custom roles.
   */
  listRoles(params?: RoleFilterParams): Promise<Role[]>;

  /**
   * Retrieves a single role by its unique ID.
   */
  getRoleById(roleId: string): Promise<Role | null>;

  /**
   * Retrieves a single role by its slug/code (e.g. 'org_admin', 'hr_manager').
   */
  getRoleByCode(code: string): Promise<Role | null>;

  /**
   * Provisions a new tenant-specific custom role.
   * Validates against privilege escalation: creator cannot grant permissions they do not possess.
   */
  createCustomRole(input: CreateRoleInput): Promise<Role>;

  /**
   * Updates an existing custom role.
   * Immutable system roles cannot be modified.
   * Validates against privilege escalation.
   */
  updateRole(roleId: string, updates: UpdateRoleInput): Promise<Role>;

  /**
   * Deletes an existing custom role.
   * Immutable system roles cannot be deleted.
   * Roles assigned to active users cannot be deleted.
   */
  deleteRole(roleId: string): Promise<void>;

  /**
   * Computes the combined effective permissions for a user across assigned roles.
   */
  getEffectiveUserPermissions(user: ClientUser): Promise<readonly PermissionKey[]>;
}
