/**
 * Audit Service Types & Interface Boundary
 */

import type { AuditEvent, CreateAuditEventInput, AuditEventFilter } from "../../types/audit";

export interface AuditService {
  /**
   * Records an immutable administrative audit event.
   * Scoped authoritatively to the authenticated client organization.
   */
  recordEvent(input: CreateAuditEventInput): Promise<AuditEvent>;

  /**
   * Queries audit events within the authenticated client organization.
   * Supports filtering by resource type, action, actor, resource ID, and date range.
   */
  listEvents(filter?: AuditEventFilter): Promise<readonly AuditEvent[]>;

  /**
   * Retrieves a specific audit event by ID within the current tenant.
   */
  getEventById(eventId: string): Promise<AuditEvent | null>;
}
