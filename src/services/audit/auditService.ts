/**
 * Administrative Audit Log Service Implementation
 *
 * Implements the tenant-isolated audit boundary:
 * Trusted Client Context -> AuditService -> DatabaseService -> Firebase
 *
 * Guarantees:
 * 1. Strict Immutability: Records are append-only. No update/delete APIs are exposed.
 * 2. Tenant Isolation: All logs are scoped to organizations/{organizationId}/auditLogs/{id}.
 * 3. Authoritative Actor Attribution: Logs automatically bind to the authenticated caller UID.
 * 4. Comprehensive Audit Trail: Captures administrative actions across users, roles, permissions, and settings.
 */

import { databaseService } from "../database";
import { clientDataService } from "../client/clientDataService";
import { authService } from "../auth";
import {
  ClientInvalidDataError,
  ClientUnauthorizedError,
  mapToClientServiceError,
} from "../client/clientErrors";
import type {
  AuditEvent,
  CreateAuditEventInput,
  AuditEventFilter,
  AuditActor,
} from "../../types/audit";
import type { AuditService } from "./audit.types";

export class AuditServiceImpl implements AuditService {
  private mockAuditLogsByOrg = new Map<string, AuditEvent[]>();

  /**
   * Retrieves or initializes mock audit logs for a tenant
   */
  private getMockLogs(orgId: string): AuditEvent[] {
    if (!this.mockAuditLogsByOrg.has(orgId)) {
      this.mockAuditLogsByOrg.set(orgId, []);
    }
    return this.mockAuditLogsByOrg.get(orgId)!;
  }

  /**
   * Records an immutable administrative audit event.
   */
  public async recordEvent(input: CreateAuditEventInput): Promise<AuditEvent> {
    if (!input) {
      throw new ClientInvalidDataError("Audit event input is required.");
    }
    if (!input.action?.trim()) {
      throw new ClientInvalidDataError("Audit action is required.");
    }
    if (!input.resourceType?.trim()) {
      throw new ClientInvalidDataError("Audit resource type is required.");
    }
    if (!input.resourceId?.trim()) {
      throw new ClientInvalidDataError("Audit resource ID is required.");
    }

    const ctx = clientDataService.getTrustedContext();
    const session = authService.getCurrentSession();
    const currentAuthUser = session?.user;

    const eventId = `aud_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const actor: AuditActor = {
      uid: ctx.userId,
      email: currentAuthUser?.email || input.actor?.email,
      displayName: currentAuthUser?.displayName || currentAuthUser?.firstName
        ? `${currentAuthUser?.firstName || ""} ${currentAuthUser?.lastName || ""}`.trim()
        : input.actor?.displayName || "Administrator",
      role: ctx.role || input.actor?.role,
      ipAddress: input.actor?.ipAddress,
      userAgent: input.actor?.userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : undefined),
    };

    const auditEvent: AuditEvent = {
      id: eventId,
      clientId: ctx.organizationId,
      organizationId: ctx.organizationId,
      actorUserId: ctx.userId,
      actor,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      timestamp: nowIso,
      metadata: input.metadata || {},
    };

    try {
      if (databaseService.isConfigured()) {
        const path = `organizations/${ctx.organizationId}/auditLogs/${eventId}`;
        await databaseService.set<AuditEvent>(path, auditEvent);
      } else {
        const mockLogs = this.getMockLogs(ctx.organizationId);
        mockLogs.unshift(auditEvent);
      }

      return auditEvent;
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  /**
   * Queries audit events within the authenticated client organization.
   */
  public async listEvents(filter?: AuditEventFilter): Promise<readonly AuditEvent[]> {
    const ctx = clientDataService.getTrustedContext();

    try {
      let events: AuditEvent[] = [];

      if (databaseService.isConfigured()) {
        const path = `organizations/${ctx.organizationId}/auditLogs`;
        const rawData = await databaseService.get<Record<string, AuditEvent>>(path);
        if (rawData && typeof rawData === "object") {
          events = Object.values(rawData);
        }
      } else {
        events = [...this.getMockLogs(ctx.organizationId)];
      }

      // Apply client-side filtering if filter parameters are supplied
      if (filter) {
        if (filter.resourceType) {
          events = events.filter((e) => e.resourceType === filter.resourceType);
        }
        if (filter.action) {
          events = events.filter((e) => e.action === filter.action);
        }
        if (filter.actorUserId) {
          events = events.filter((e) => e.actorUserId === filter.actorUserId);
        }
        if (filter.resourceId) {
          events = events.filter((e) => e.resourceId === filter.resourceId);
        }
        if (filter.fromDate) {
          const fromTime = new Date(filter.fromDate).getTime();
          events = events.filter((e) => new Date(e.timestamp).getTime() >= fromTime);
        }
        if (filter.toDate) {
          const toTime = new Date(filter.toDate).getTime();
          events = events.filter((e) => new Date(e.timestamp).getTime() <= toTime);
        }
      }

      // Sort by timestamp descending (newest first)
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (filter?.limit && filter.limit > 0) {
        events = events.slice(0, filter.limit);
      }

      return events;
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  /**
   * Retrieves a specific audit event by ID within the current tenant.
   */
  public async getEventById(eventId: string): Promise<AuditEvent | null> {
    if (!eventId?.trim()) {
      throw new ClientInvalidDataError("Audit event ID is required.");
    }

    const ctx = clientDataService.getTrustedContext();

    try {
      if (databaseService.isConfigured()) {
        const path = `organizations/${ctx.organizationId}/auditLogs/${eventId.trim()}`;
        return await databaseService.get<AuditEvent>(path);
      }

      const mockLogs = this.getMockLogs(ctx.organizationId);
      const found = mockLogs.find((e) => e.id === eventId.trim());
      return found || null;
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  /**
   * Explicitly blocks modification of audit records.
   * Throws ClientUnauthorizedError to enforce immutable compliance.
   */
  public async updateEvent(): Promise<never> {
    const ctx = clientDataService.getTrustedContext();
    throw new ClientUnauthorizedError(
      "Audit records are immutable and cannot be modified under any circumstances.",
      ctx.organizationId
    );
  }

  /**
   * Explicitly blocks deletion of audit records.
   * Throws ClientUnauthorizedError to enforce immutable compliance.
   */
  public async deleteEvent(): Promise<never> {
    const ctx = clientDataService.getTrustedContext();
    throw new ClientUnauthorizedError(
      "Audit records are immutable and cannot be deleted.",
      ctx.organizationId
    );
  }
}

export const auditService = new AuditServiceImpl();
