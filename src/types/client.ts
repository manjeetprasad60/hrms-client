/**
 * Client Context Domain Contracts
 *
 * Defines the comprehensive state and capabilities for the authenticated Client Admin Web:
 * Firebase User -> UID -> Client User Record -> Client Organization -> Role -> Permissions -> Application
 */

import type { FirebaseUser } from '../services/auth';
import type { ClientUser } from './auth';
import type { ClientOrganization } from './organization';
import type { ClientRole } from '../permissions/roles';
import type { PermissionKey } from '../permissions/permissions';
import type { EntityStatus } from './common';

export interface ClientContextValue {
  /**
   * The authenticated Firebase user from Firebase Authentication.
   */
  readonly firebaseUser: FirebaseUser | null;

  /**
   * Full tenant-scoped ClientUser profile record.
   */
  readonly clientUser: ClientUser | null;

  /**
   * Verified client organization domain model.
   */
  readonly organization: ClientOrganization | null;

  /**
   * Verified tenant identifier (e.g. "org_acme_corp_01").
   */
  readonly organizationId: string | null;

  /**
   * Assigned client operational role (e.g. "org_admin", "hr_manager").
   */
  readonly role: ClientRole | null;

  /**
   * Resolved list of atomic capability permissions for this user.
   */
  readonly permissions: readonly PermissionKey[];

  /**
   * Client organization status ("active" | "inactive" | "pending" | "suspended").
   */
  readonly clientStatus: EntityStatus | null;

  /**
   * Whether client context is actively being loaded from the database.
   */
  readonly isClientLoading: boolean;

  /**
   * Error message encountered while resolving client context.
   */
  readonly clientError: string | null;

  /**
   * True if the user has a valid, resolved client organization.
   */
  readonly hasClient: boolean;

  /**
   * True if the client organization is inactive or suspended.
   */
  readonly isSuspended: boolean;

  /**
   * Fast permission check: can("employees.view")
   */
  readonly can: (permission: string) => boolean;

  /**
   * Fast negative permission check: cannot("payroll.process")
   */
  readonly cannot: (permission: string) => boolean;

  /**
   * Re-fetches the client user and organization profile from the backend.
   */
  readonly refreshClient: () => Promise<void>;

  /**
   * Tenant currency code (e.g. "USD").
   */
  readonly currency: string;

  /**
   * Tenant IANA timezone string (e.g. "America/New_York").
   */
  readonly timezone: string;

  /**
   * Tenant country code (e.g. "US").
   */
  readonly country: string;
}

export type { FirebaseUser };
