/**
 * Firebase Realtime Database Service Implementation
 *
 * Implements the DatabaseService boundary separating UI and features from Firebase Realtime Database.
 * Enforces tenant-isolated path hierarchies:
 * organizations/{organizationId}/{resource}/{entityId}
 */

import { firebaseClient, getFirebaseDatabase } from '../firebase';
import type { DatabaseService, DatabaseQueryOptions } from './database.types';

export class DatabaseServiceImpl implements DatabaseService {
  public isConfigured(): boolean {
    return firebaseClient.isReady() && Boolean(getFirebaseDatabase());
  }

  public buildTenantPath(organizationId: string, resource: string, entityId?: string): string {
    const cleanOrg = organizationId.trim().replace(/^\/+|\/+$/g, '');
    const cleanResource = resource.trim().replace(/^\/+|\/+$/g, '');

    if (!cleanOrg) {
      throw new Error('Tenant organization ID is required to construct database path.');
    }
    if (!cleanResource) {
      throw new Error('Resource identifier is required to construct database path.');
    }

    if (entityId) {
      const cleanEntity = entityId.trim().replace(/^\/+|\/+$/g, '');
      return `organizations/${cleanOrg}/${cleanResource}/${cleanEntity}`;
    }

    return `organizations/${cleanOrg}/${cleanResource}`;
  }

  public async get<T>(path: string): Promise<T | null> {
    if (!this.isConfigured()) {
      console.warn(`[DatabaseService] Realtime Database not configured. Read skipped for path: ${path}`);
      return null;
    }

    // In upcoming phase:
    // const snapshot = await get(ref(getDatabase(), path));
    // return snapshot.exists() ? snapshot.val() as T : null;
    return null;
  }

  public async set<T>(path: string, data: T): Promise<void> {
    if (!this.isConfigured()) {
      console.warn(`[DatabaseService] Realtime Database not configured. Write skipped for path: ${path}`, data);
      return;
    }

    // In upcoming phase: await set(ref(getDatabase(), path), data);
  }

  public async update<T extends object>(path: string, updates: Partial<T>): Promise<void> {
    if (!this.isConfigured()) {
      console.warn(`[DatabaseService] Realtime Database not configured. Update skipped for path: ${path}`, updates);
      return;
    }

    // In upcoming phase: await update(ref(getDatabase(), path), updates);
  }

  public async remove(path: string): Promise<void> {
    if (!this.isConfigured()) {
      console.warn(`[DatabaseService] Realtime Database not configured. Delete skipped for path: ${path}`);
      return;
    }

    // In upcoming phase: await remove(ref(getDatabase(), path));
  }

  public async push<T>(path: string, data: T): Promise<{ key: string }> {
    if (!this.isConfigured()) {
      console.warn(`[DatabaseService] Realtime Database not configured. Push skipped for path: ${path}`, data);
      return { key: `mock_key_${Date.now()}` };
    }

    // In upcoming phase:
    // const newRef = push(ref(getDatabase(), path));
    // await set(newRef, data);
    // return { key: newRef.key! };
    return { key: `db_key_${Date.now()}` };
  }

  public subscribe<T>(
    path: string,
    callback: (data: T | null) => void,
    queryOptions?: DatabaseQueryOptions
  ): () => void {
    void path;
    void queryOptions;
    if (!this.isConfigured()) {
      callback(null);
      return () => {};
    }

    // In upcoming phase:
    // const dbRef = ref(getDatabase(), path);
    // const unsubscribe = onValue(dbRef, (snapshot) => {
    //   callback(snapshot.exists() ? snapshot.val() as T : null);
    // });
    // return unsubscribe;
    return () => {};
  }
}

export const databaseService: DatabaseService = new DatabaseServiceImpl();
