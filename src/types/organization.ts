/**
 * Client Organization Domain Model
 *
 * Represents the top-level tenant boundary for an HRIS client company.
 */

import type { EntityStatus } from './common';
import type { OrganizationSettings } from './settings';

export type OrganizationStatus = 'active' | 'suspended' | 'inactive';

export const ORGANIZATION_STATUS: Record<string, OrganizationStatus> = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
} as const;

export interface OrganizationContactInformation {
  readonly primaryEmail?: string;
  readonly phoneNumber?: string;
  readonly website?: string;
  readonly addressLine1?: string;
  readonly addressLine2?: string;
  readonly city?: string;
  readonly stateOrProvince?: string;
  readonly postalCode?: string;
  readonly country?: string;
}

export interface ClientOrganization {
  readonly id: string;
  readonly name: string;
  readonly legalName?: string;
  readonly slug: string;
  readonly domain?: string;
  readonly logoUrl?: string;
  readonly logo?: string;
  readonly headquartersLocationId?: string;
  readonly taxIdentifier?: string;
  readonly defaultCurrency: string;
  readonly currency?: string;
  readonly defaultTimezone: string;
  readonly timezone?: string;
  readonly country?: string;
  readonly contactInformation?: OrganizationContactInformation;
  readonly status: EntityStatus;
  readonly settings?: OrganizationSettings;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UpdateOrganizationProfileInput {
  readonly name?: string;
  readonly legalName?: string;
  readonly domain?: string;
  readonly logoUrl?: string;
  readonly headquartersLocationId?: string;
  readonly taxIdentifier?: string;
  readonly defaultCurrency?: string;
  readonly defaultTimezone?: string;
  readonly country?: string;
  readonly contactInformation?: Partial<OrganizationContactInformation>;
}

export interface SubscriptionSummary {
  readonly planId: string;
  readonly planName: string;
  readonly status: 'active' | 'trialing' | 'past_due' | 'canceled';
  readonly currentPeriodEnd: string;
  readonly seatLimit: number;
  readonly activeSeats: number;
}
