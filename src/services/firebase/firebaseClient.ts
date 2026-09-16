/**
 * Centralized Firebase Client Lifecycle Coordinator
 *
 * Manages Firebase app initialization state and provides access to core services:
 * - Firebase Authentication (getAuth)
 * - Firebase Realtime Database (getDatabase)
 * - Firebase Storage (getStorage)
 *
 * Implements the centralized initialization layer:
 * Config -> Firebase Client Coordinator -> Service Boundaries -> UI
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import {
  checkFirebaseConfig,
  getFirebaseWebConfig,
  type FirebaseConfigStatus,
  type FirebaseWebConfig,
} from '../../config/firebase';

export type FirebaseClientState = 'unconfigured' | 'ready' | 'error';

export interface FirebaseClientStatus {
  readonly state: FirebaseClientState;
  readonly isReady: boolean;
  readonly configStatus: FirebaseConfigStatus;
  readonly options: FirebaseWebConfig;
  readonly error: string | null;
}

export class FirebaseClientCoordinator {
  private clientState: FirebaseClientState = 'unconfigured';
  private appInstance: FirebaseApp | null = null;
  private authInstance: Auth | null = null;
  private databaseInstance: Database | null = null;
  private storageInstance: FirebaseStorage | null = null;
  private initializationError: string | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initializes FirebaseApp and dependent service singletons safely.
   */
  public initialize(): FirebaseClientStatus {
    const configStatus = checkFirebaseConfig();
    const options = getFirebaseWebConfig();

    if (!configStatus.isConfigured) {
      this.clientState = 'unconfigured';
      this.appInstance = null;
      this.authInstance = null;
      this.databaseInstance = null;
      this.storageInstance = null;
      return this.getStatus();
    }

    try {
      if (getApps().length > 0) {
        this.appInstance = getApp();
      } else {
        this.appInstance = initializeApp(options);
      }

      this.authInstance = getAuth(this.appInstance);
      this.databaseInstance = getDatabase(this.appInstance);
      this.storageInstance = getStorage(this.appInstance);
      this.clientState = 'ready';
      this.initializationError = null;
    } catch (err) {
      this.clientState = 'error';
      this.initializationError = err instanceof Error ? err.message : 'Unknown Firebase initialization failure';
      console.warn('[FirebaseClient] Initialization failed gracefully:', this.initializationError);
    }

    return this.getStatus();
  }

  /**
   * Returns whether Firebase services are initialized and ready for production operations.
   */
  public isReady(): boolean {
    return this.clientState === 'ready' && this.appInstance !== null;
  }

  /**
   * Returns detailed diagnostics on the Firebase client state.
   */
  public getStatus(): FirebaseClientStatus {
    return {
      state: this.clientState,
      isReady: this.isReady(),
      configStatus: checkFirebaseConfig(),
      options: getFirebaseWebConfig(),
      error: this.initializationError,
    };
  }

  /**
   * Accesses the underlying FirebaseApp instance if initialized.
   */
  public getApp(): FirebaseApp | null {
    return this.appInstance;
  }

  /**
   * Accesses the Firebase Auth instance if initialized.
   */
  public getAuth(): Auth | null {
    return this.authInstance;
  }

  /**
   * Accesses the Firebase Realtime Database instance if initialized.
   */
  public getDatabase(): Database | null {
    return this.databaseInstance;
  }

  /**
   * Accesses the Firebase Storage instance if initialized.
   */
  public getStorage(): FirebaseStorage | null {
    return this.storageInstance;
  }

  public getError(): string | null {
    return this.initializationError;
  }
}

export const firebaseClient = new FirebaseClientCoordinator();

// Export convenient standalone accessors for service modules
export const getFirebaseApp = (): FirebaseApp | null => firebaseClient.getApp();
export const getFirebaseAuth = (): Auth | null => firebaseClient.getAuth();
export const getFirebaseDatabase = (): Database | null => firebaseClient.getDatabase();
export const getFirebaseStorage = (): FirebaseStorage | null => firebaseClient.getStorage();
export const isFirebaseReady = (): boolean => firebaseClient.isReady();
