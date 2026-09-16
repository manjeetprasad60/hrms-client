/**
 * Role & RBAC Architecture Models
 *
 * Defines organizational roles and their association with granular permissions:
 * User -> Role -> Permissions
 *
 * Distinguishes immutable platform System Roles from tenant Custom Roles.
 */

import type { EntityStatus } from './common';
import type { Permission, PermissionKey } from '../permissions/permissions';

export type RoleStatus = 'active' | 'inactive' | 'archived';

export const ROLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
} as const;

export type RoleType = 'system' | 'custom';

export interface RoleCreator {
  readonly uid: string;
  readonly name?: string;
  readonly email?: string;
}

export interface Role {
  /** Unique role identifier: e.g. 'role_org_admin' or 'role_custom_<uuid>' */
  readonly id: string;

  /** Organization / tenant boundary identifier */
  readonly organizationId: string;

  /** Client ID alias matching organizationId */
  readonly clientId: string;

  /** Programmatic slug or system key: e.g. 'org_admin', 'hr_manager', 'payroll_admin' */
  readonly code: string;

  /** Human-readable display name: e.g. 'Client Administrator', 'HR Manager' */
  readonly name: string;

  /** Operational description of responsibilities and scope */
  readonly description: string;

  /** List of atomic permission keys granted by this role */
  readonly permissionIds: readonly PermissionKey[];

  /** Backward-compatible alias for permissionIds */
  readonly permissions: readonly Permission[];

  /** Lifecycle status of the role */
  readonly status: RoleStatus | EntityStatus;

  /** True if this is an immutable platform-defined archetype */
  readonly isSystemRole: boolean;

  /** True if this is a tenant-configured custom role */
  readonly isCustomRole: boolean;

  /** List of role IDs or codes this role is permitted to delegate/assign */
  readonly allowedAssignableRoles?: readonly string[];

  /** Optional priority / tier ranking for hierarchy comparisons */
  readonly hierarchyLevel?: number;

  /** User who provisioned the role (for custom roles) */
  readonly createdBy?: RoleCreator;

  /** ISO 8601 creation timestamp */
  readonly createdAt: string;

  /** ISO 8601 last update timestamp */
  readonly updatedAt: string;
}

export interface CreateRoleInput {
  readonly code?: string;
  readonly name: string;
  readonly description: string;
  readonly permissionIds: readonly PermissionKey[];
  /** Backward-compatible field */
  readonly permissions?: readonly Permission[];
  readonly allowedAssignableRoles?: readonly string[];
}

export interface UpdateRoleInput {
  readonly name?: string;
  readonly description?: string;
  readonly permissionIds?: readonly PermissionKey[];
  /** Backward-compatible field */
  readonly permissions?: readonly Permission[];
  readonly status?: RoleStatus;
  readonly allowedAssignableRoles?: readonly string[];
}

export interface RoleFilterParams {
  readonly status?: RoleStatus | 'all';
  readonly type?: RoleType | 'all';
  readonly search?: string;
}
