/**
 * Authentication & Client User Models
 *
 * Represents users authorized to access the Client Admin web portal.
 */

import type { EntityStatus } from './common';
import type { ClientRole } from '../permissions/roles';
import type { ClientUserStatus } from './user';

export * from './user';

export interface ClientUser {
  readonly id: string;
  readonly authUid: string;
  readonly organizationId: string;
  readonly clientId?: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName?: string;
  readonly phone?: string;
  readonly phoneNumber?: string;
  readonly photoURL?: string;
  readonly avatarUrl?: string;
  readonly role: ClientRole;
  readonly roleId?: string;
  readonly roleIds?: readonly string[];
  readonly customPermissions?: readonly string[];
  readonly departmentIds: readonly string[];
  readonly locationIds: readonly string[];
  readonly employeeId?: string;
  readonly isEmailVerified: boolean;
  readonly status: ClientUserStatus | EntityStatus;
  readonly lastLoginAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AuthSession {
  readonly user: ClientUser;
  readonly organization: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
  };
  readonly token: string;
  readonly expiresAt: number;
}

export interface TenantContext {
  readonly organizationId: string;
  readonly organizationName: string;
  readonly slug: string;
  readonly planCode: string;
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
