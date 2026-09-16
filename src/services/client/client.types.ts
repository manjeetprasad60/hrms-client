/**
 * Client-Aware Firebase Service Contracts
 *
 * Defines the service interfaces and data transfer objects for tenant-scoped operations:
 * Trusted Client Context -> ClientDataService -> DatabaseService/StorageService -> Firebase
 *
 * Enforces zero-trust of client-supplied IDs: all operations are strictly bound
 * to the authenticated client context.
 */

import type { ClientRole } from '../../permissions/roles';
import type { ClientUser, ClientUserStatus, CreateClientUserInput, UpdateClientUserInput } from '../../types/auth';
import type { ClientOrganization } from '../../types/organization';
import type { ClientSettings } from '../../types/settings';
import type { DatabaseQueryOptions } from '../database/database.types';
import type { StorageUploadOptions, StorageUploadResult } from '../storage/storage.types';

export interface TrustedClientContext {
  /**
   * Verified client organization ID derived strictly from authenticated server claims.
   */
  readonly organizationId: string;

  /**
   * Verified user ID of the active authenticated session.
   */
  readonly userId: string;

  /**
   * Assigned client operational role.
   */
  readonly role?: ClientRole | null;

  /**
   * Optional custom granular permission overrides.
   */
  readonly customPermissions?: readonly string[];
}

export type ClientServiceErrorCode =
  | 'client/permission-denied'
  | 'client/not-found'
  | 'client/network-error'
  | 'client/unavailable'
  | 'client/invalid-data'
  | 'client/unauthorized';

export interface ClientDataService {
  /**
   * Configures or updates the trusted client context for all tenant-scoped data queries.
   */
  setTrustedContext(context: TrustedClientContext | null): void;

  /**
   * Returns the current trusted client context or throws ClientUnauthorizedError if missing.
   */
  getTrustedContext(): TrustedClientContext;

  /**
   * Clears the active trusted client context (e.g. upon sign out).
   */
  clearTrustedContext(): void;

  /**
   * Checks whether a valid trusted client context is currently registered.
   */
  hasTrustedContext(): boolean;

  /**
   * Retrieves the current client organization profile.
   */
  getClient(): Promise<ClientOrganization>;

  /**
   * Updates client organization details within the active client workspace.
   */
  updateClient(updates: Partial<ClientOrganization>): Promise<void>;

  /**
   * Retrieves a client user record within the active client organization.
   * If userId is omitted, retrieves the active user's own profile.
   */
  getClientUser(userId?: string): Promise<ClientUser>;

  /**
   * Retrieves all client user records belonging to the active client organization.
   */
  listClientUsers(): Promise<ClientUser[]>;

  /**
   * Provisions a new client user within the active client organization.
   * Non-destructive: sets status to 'invited' by default.
   */
  createClientUser(input: CreateClientUserInput): Promise<ClientUser>;

  /**
   * Updates an existing client user record within the active client organization.
   */
  updateClientUser(userId: string, updates: UpdateClientUserInput): Promise<ClientUser>;

  /**
   * Updates the lifecycle status of a client user (active, invited, suspended, disabled).
   * Soft transition only; no permanent deletion.
   */
  setClientUserStatus(userId: string, status: ClientUserStatus): Promise<void>;

  /**
   * Retrieves organizational settings and localization parameters.
   */
  getClientSettings(): Promise<ClientSettings | null>;

  /**
   * Updates organizational settings within the active client workspace.
   */
  updateClientSettings(settings: Partial<ClientSettings>): Promise<void>;

  /**
   * Reads client-scoped data for a resource.
   */
  get<T>(resource: string, entityId?: string): Promise<T | null>;

  /**
   * Writes client-scoped data for a resource.
   */
  set<T>(resource: string, entityId: string, data: T): Promise<void>;

  /**
   * Applies partial updates to an entity within the active client organization.
   */
  update<T extends object>(resource: string, entityId: string, updates: Partial<T>): Promise<void>;

  /**
   * Removes an entity from the active client organization.
   */
  remove(resource: string, entityId: string): Promise<void>;

  /**
   * Appends an auto-keyed item under a client-scoped resource path.
   */
  push<T>(resource: string, data: T): Promise<{ key: string }>;

  /**
   * Subscribes to real-time changes on a client-scoped resource path.
   */
  subscribe<T>(
    resource: string,
    callback: (data: T | null) => void,
    entityId?: string,
    queryOptions?: DatabaseQueryOptions
  ): () => void;

  /**
   * Uploads a file scoped to the current client organization.
   * Path: organizations/{organizationId}/{category}/{filename}
   */
  uploadClientFile(
    category: string,
    filename: string,
    file: Blob | File,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult>;

  /**
   * Deletes a client-scoped file from storage.
   */
  deleteClientFile(category: string, filename: string): Promise<void>;

  /**
   * Constructs a validated client-scoped path: organizations/{organizationId}/{resource}[/{entityId}]
   */
  buildClientPath(resource: string, entityId?: string): string;

  /**
   * Reports whether the underlying Firebase service is configured.
   */
  isConfigured(): boolean;
}
