/**
 * Workplace / Branch Location Model
 *
 * Represents physical or remote work locations within a client organization.
 * Used for regional compliance, timezones, and employee grouping.
 */

import type { EntityStatus } from './common';

export interface LocationAddress {
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly stateOrProvince: string;
  readonly postalCode: string;
  readonly country: string;
}

export interface LocationContact {
  readonly phone?: string;
  readonly email?: string;
}

export interface Location {
  readonly id: string;
  readonly organizationId: string;
  readonly code: string;
  readonly name: string;
  readonly address: LocationAddress;
  readonly timezone: string;
  readonly isHeadquarters: boolean;
  readonly contact?: LocationContact;
  readonly status: EntityStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateLocationInput {
  readonly code: string;
  readonly name: string;
  readonly address: LocationAddress;
  readonly timezone: string;
  readonly isHeadquarters?: boolean;
  readonly contact?: LocationContact;
}

export interface UpdateLocationInput extends Partial<CreateLocationInput> {
  readonly status?: EntityStatus;
}
