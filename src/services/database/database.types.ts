/**
 * Firebase Realtime Database Service Contracts
 *
 * Defines the abstract interface and multi-tenant path standards for Realtime Database operations.
 * Architecture: UI -> Feature -> DatabaseService -> Firebase Realtime Database
 */

export interface DatabaseQueryOptions {
  readonly orderByChild?: string;
  readonly equalTo?: string | number | boolean;
  readonly limitToFirst?: number;
  readonly limitToLast?: number;
}

export interface DatabaseService {
  /**
   * Reads a value at the specified path once.
   */
  get<T>(path: string): Promise<T | null>;

  /**
   * Writes data at the specified path, replacing any existing content.
   */
  set<T>(path: string, data: T): Promise<void>;

  /**
   * Applies partial updates to children at the target path without overwriting other sibling nodes.
   */
  update<T extends object>(path: string, updates: Partial<T>): Promise<void>;

  /**
   * Removes data at the target path.
   */
  remove(path: string): Promise<void>;

  /**
   * Generates a new auto-keyed child node under target path with supplied payload.
   */
  push<T>(path: string, data: T): Promise<{ key: string }>;

  /**
   * Subscribes to real-time value changes at the specified path.
   * Returns an unsubscribe callback.
   */
  subscribe<T>(
    path: string,
    callback: (data: T | null) => void,
    queryOptions?: DatabaseQueryOptions
  ): () => void;

  /**
   * Constructs a strictly isolated multi-tenant Realtime Database path.
   * Format: organizations/{organizationId}/{resource}[/{entityId}]
   */
  buildTenantPath(organizationId: string, resource: string, entityId?: string): string;

  /**
   * Reports whether the database service is configured with a valid databaseURL and client.
   */
  isConfigured(): boolean;
}
