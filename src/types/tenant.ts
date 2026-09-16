/**
 * Multi-Tenant SaaS Domain Contracts
 *
 * Defines the contracts for tenant organization resolution, user-to-tenant mapping,
 * and tenant context state throughout the Client Admin Web.
 */

import type { ClientOrganization } from './organization';
import type { EntityStatus } from './common';
import type { ClientRole } from '../permissions/roles';

/**
 * Root user identity lookup record in Realtime Database: users/{uid}
 * Maps an authenticated Firebase Auth identity to their assigned client organization.
 */
export interface TenantMappingRecord {
  readonly uid: string;
  readonly organizationId: string;
  readonly role: ClientRole;
  readonly email: string;
  readonly status: EntityStatus;
  readonly assignedAt: string;
}

/**
 * React Tenant Context state and operations exposed to UI components.
 */
export interface TenantContextValue {
  /**
   * Verified client organization domain model.
   */
  readonly organization: ClientOrganization | null;

  /**
   * Verified tenant identifier (e.g. "org_acme_corp_01").
   */
  readonly organizationId: string | null;

  /**
   * Organization operational lifecycle state.
   */
  readonly status: EntityStatus | null;

  /**
   * Whether tenant record is actively being loaded from Realtime Database.
   */
  readonly isLoading: boolean;

  /**
   * Error message if tenant verification or fetching failed.
   */
  readonly error: string | null;

  /**
   * Tenant default currency (ISO 4217, defaults to "USD").
   */
  readonly currency: string;

  /**
   * Tenant default timezone (IANA, defaults to "UTC").
   */
  readonly timezone: string;

  /**
   * Tenant country (defaults to "US" or configured value).
   */
  readonly country: string;

  /**
   * Re-fetches the active tenant record from the database.
   */
  readonly refreshTenant: () => Promise<void>;
}
