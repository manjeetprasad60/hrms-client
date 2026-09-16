/**
 * Department Hierarchy Model
 *
 * Represents business units, divisions, and teams within a client organization.
 * Supports parent-child tree structures and multi-location associations.
 */

import type { EntityStatus } from './common';

export interface Department {
  readonly id: string;
  readonly organizationId: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly parentDepartmentId?: string;
  readonly headEmployeeId?: string;
  readonly locationIds: readonly string[];
  readonly status: EntityStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface DepartmentTreeNode extends Department {
  readonly children: readonly DepartmentTreeNode[];
  readonly employeeCount?: number;
}

export interface CreateDepartmentInput {
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly parentDepartmentId?: string;
  readonly headEmployeeId?: string;
  readonly locationIds?: readonly string[];
}

export interface UpdateDepartmentInput extends Partial<CreateDepartmentInput> {
  readonly status?: EntityStatus;
}
