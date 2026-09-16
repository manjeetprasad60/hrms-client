/**
 * Administrative Audit Log Event Model & Action Types
 *
 * Provides a standardized, extensible audit event contract for capturing
 * enterprise administrative changes across workforce, roles, permissions,
 * and organization configuration.
 */

export const AUDIT_ACTIONS = {
  // User Management
  USER_INVITED: "user.invited",
  USER_ROLE_CHANGED: "user.role_changed",
  USER_SUSPENDED: "user.suspended",
  USER_REACTIVATED: "user.reactivated",
  USER_UPDATED: "user.updated",

  // Role Management
  ROLE_CREATED: "role.created",
  ROLE_MODIFIED: "role.modified",
  ROLE_DELETED: "role.deleted",

  // Permissions
  PERMISSIONS_CHANGED: "permissions.changed",

  // Organization & Settings
  ORGANIZATION_SETTINGS_UPDATED: "organization.settings_updated",
  ORGANIZATION_PROFILE_UPDATED: "organization.profile_updated",

  // Invitations Lifecycle
  INVITATION_REVOKED: "invitation.revoked",
  INVITATION_ACCEPTED: "invitation.accepted",
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS] | string;

export type AuditResourceType =
  | "user"
  | "role"
  | "permission"
  | "organization"
  | "settings"
  | "invitation"
  | string;

export interface AuditActor {
  readonly uid: string;
  readonly email?: string;
  readonly displayName?: string;
  readonly role?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export interface AuditEventMetadata {
  readonly previousState?: Record<string, unknown> | null;
  readonly newState?: Record<string, unknown> | null;
  readonly diff?: Record<string, { from: unknown; to: unknown }>;
  readonly reason?: string;
  readonly clientIp?: string;
  readonly userAgent?: string;
  readonly [key: string]: unknown;
}

export interface AuditEvent {
  readonly id: string;
  readonly clientId: string;
  readonly organizationId: string;
  readonly actorUserId: string;
  readonly actor?: AuditActor;
  readonly action: AuditAction;
  readonly resourceType: AuditResourceType;
  readonly resourceId: string;
  readonly timestamp: string; // ISO 8601 UTC
  readonly metadata?: AuditEventMetadata;
}

export interface CreateAuditEventInput {
  readonly action: AuditAction;
  readonly resourceType: AuditResourceType;
  readonly resourceId: string;
  readonly metadata?: AuditEventMetadata;
  readonly actor?: Partial<AuditActor>;
}

export interface AuditEventFilter {
  readonly resourceType?: AuditResourceType;
  readonly action?: AuditAction;
  readonly actorUserId?: string;
  readonly resourceId?: string;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly limit?: number;
}
