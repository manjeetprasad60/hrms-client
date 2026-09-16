/**
 * Client User Domain Model
 *
 * Represents users authorized to access a client organization's HRIS portal.
 *
 * Distinct from raw Firebase Authentication:
 * - Firebase Auth UID establishes: "Who is this authenticated identity?"
 * - ClientUser record establishes: "What is this user authorized to do inside this client organization?"
 *
 * Core Architecture Pipeline:
 * Firebase Auth UID -> Client User -> Client Organization -> Role(s) -> Permissions
 */

import type { ClientRole } from '../permissions/roles';

export type ClientUserStatus = 'invited' | 'active' | 'suspended' | 'disabled';

export const CLIENT_USER_STATUS = {
  INVITED: 'invited',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DISABLED: 'disabled',
} as const;

export interface ClientUser {
  /**
   * Unique client user record identifier within the tenant database tree.
   * Typically matches the Firebase Authentication UID for 1:1 mapped primary users.
   */
  readonly id: string;

  /**
   * Direct foreign-key reference to the authenticated Firebase Auth identity (UID).
   */
  readonly authUid: string;

  /**
   * Authoritative client organization identifier defining tenant boundary.
   */
  readonly organizationId: string;

  /**
   * Normalized alias for organizationId for cross-module compatibility.
   */
  readonly clientId?: string;

  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;

  /**
   * Formatted full display name for user menus, notifications, and audit logs.
   */
  readonly displayName?: string;

  readonly phone?: string;
  readonly phoneNumber?: string;

  /**
   * Profile photo URL from Firebase Auth or tenant storage.
   */
  readonly photoURL?: string;
  readonly avatarUrl?: string;

  /**
   * Primary organizational role.
   */
  readonly role: ClientRole;

  /**
   * Single role identifier reference.
   */
  readonly roleId?: string;

  /**
   * Role assignment array supporting future multi-role capabilities.
   */
  readonly roleIds?: readonly string[];

  /**
   * Granular permission overrides granted directly to this user.
   */
  readonly customPermissions?: readonly string[];

  /**
   * Assigned operational departments.
   */
  readonly departmentIds: readonly string[];

  /**
   * Assigned operating work locations.
   */
  readonly locationIds: readonly string[];

  /**
   * Reference link to the HR employee profile in the workforce directory.
   */
  readonly employeeId?: string;

  readonly isEmailVerified: boolean;

  /**
   * Lifecycle account status within the client organization.
   * Decoupled from Firebase Auth identity state.
   */
  readonly status: ClientUserStatus;

  /**
   * ISO 8601 audit timestamp of last sign-in.
   */
  readonly lastLoginAt?: string;

  /**
   * ISO 8601 audit timestamp of user provisioning.
   */
  readonly createdAt: string;

  /**
   * ISO 8601 audit timestamp of last profile modification.
   */
  readonly updatedAt: string;
}

export interface CreateClientUserInput {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: ClientRole;
  readonly roleIds?: readonly string[];
  readonly authUid?: string;
  readonly phone?: string;
  readonly departmentIds?: readonly string[];
  readonly locationIds?: readonly string[];
  readonly employeeId?: string;
  readonly customPermissions?: readonly string[];
  readonly status?: ClientUserStatus;
}

export type UpdateClientUserInput = Partial<
  Omit<ClientUser, 'id' | 'authUid' | 'organizationId' | 'clientId' | 'createdAt' | 'updatedAt'>
>;

/**
 * Status evaluation helper functions
 */
export function isUserActive(user: ClientUser | null | undefined): boolean {
  return user?.status === CLIENT_USER_STATUS.ACTIVE;
}

export function isUserSuspended(user: ClientUser | null | undefined): boolean {
  return user?.status === CLIENT_USER_STATUS.SUSPENDED;
}

export function isUserInvited(user: ClientUser | null | undefined): boolean {
  return user?.status === CLIENT_USER_STATUS.INVITED;
}

export function isUserDisabled(user: ClientUser | null | undefined): boolean {
  return user?.status === CLIENT_USER_STATUS.DISABLED;
}

export function formatUserFullName(user: { firstName?: string; lastName?: string; email?: string } | null | undefined): string {
  if (!user) return 'Unknown User';
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.email || 'User';
}
