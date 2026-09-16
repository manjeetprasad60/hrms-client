/**
 * Firebase Authentication Service Implementation
 *
 * Implements the AuthService boundary separating UI and features from Firebase Auth.
 * Architecture:
 * UI -> Feature/Context -> AuthService -> Firebase Auth (Modular SDK v12)
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { firebaseClient, getFirebaseAuth } from '../firebase';
import { databaseService } from '../database/databaseService';
import { CLIENT_ROLES, type ClientRole } from '../../permissions/roles';
import { mapFirebaseErrorToMessage } from './authErrors';
import type {
  AuthService,
  LoginCredentials,
  AuthSession,
  ClientUser,
  AuthStatus,
  AuthStateListener,
} from './auth.types';

export class AuthServiceImpl implements AuthService {
  private currentSession: AuthSession | null = null;
  private currentFirebaseUser: FirebaseUser | null = null;
  private status: AuthStatus = 'initializing';
  private lastError: string | null = null;
  private readonly listeners = new Set<AuthStateListener>();
  private unsubscribeFirebase: (() => void) | null = null;

  constructor() {
    this.initAuthListener();
  }

  /**
   * Initializes real Firebase Auth state subscription or handles unconfigured state.
   */
  private initAuthListener(): void {
    const auth = getFirebaseAuth();

    if (!auth) {
      // Firebase is unconfigured; resolve initialization immediately to unauthenticated
      this.status = 'unauthenticated';
      this.currentFirebaseUser = null;
      this.currentSession = null;
      return;
    }

    try {
      this.unsubscribeFirebase = firebaseOnAuthStateChanged(
        auth,
        async (user: FirebaseUser | null) => {
          if (user) {
            try {
              this.currentFirebaseUser = user;
              this.currentSession = await this.mapFirebaseUserToSession(user);
              this.status = 'authenticated';
              this.lastError = null;
            } catch (err) {
              this.status = 'error';
              this.lastError = mapFirebaseErrorToMessage(err);
              this.currentFirebaseUser = null;
              this.currentSession = null;
            }
          } else {
            this.currentFirebaseUser = null;
            this.currentSession = null;
            this.status = 'unauthenticated';
            this.lastError = null;
          }
          this.notifyListeners();
        },
        (error) => {
          this.status = 'error';
          this.lastError = mapFirebaseErrorToMessage(error);
          this.currentFirebaseUser = null;
          this.currentSession = null;
          this.notifyListeners();
        }
      );
    } catch (err) {
      this.status = 'error';
      this.lastError = mapFirebaseErrorToMessage(err);
      this.notifyListeners();
    }
  }

  public isConfigured(): boolean {
    return firebaseClient.isReady() && Boolean(getFirebaseAuth());
  }

  public getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  public getCurrentFirebaseUser(): FirebaseUser | null {
    return this.currentFirebaseUser;
  }

  public getAuthStatus(): AuthStatus {
    return this.status;
  }

  public async signInWithEmail(credentials: LoginCredentials): Promise<AuthSession> {
    const auth = getFirebaseAuth();
    if (!auth) {
      const error = new Error('Firebase Authentication is not configured. Please set environment variables.');
      (error as { code?: string }).code = 'auth/unconfigured';
      this.lastError = mapFirebaseErrorToMessage(error);
      this.status = 'error';
      this.notifyListeners();
      throw error;
    }

    const email = credentials.email?.trim();
    const password = credentials.password;

    if (!email || !password) {
      const error = new Error('Email and password are required.');
      (error as { code?: string }).code = 'auth/invalid-email';
      this.lastError = mapFirebaseErrorToMessage(error);
      this.notifyListeners();
      throw error;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      this.currentFirebaseUser = user;
      this.currentSession = await this.mapFirebaseUserToSession(user);
      this.status = 'authenticated';
      this.lastError = null;
      this.notifyListeners();
      return this.currentSession;
    } catch (err) {
      this.status = 'error';
      this.lastError = mapFirebaseErrorToMessage(err);
      this.notifyListeners();
      throw err;
    }
  }

  public async signOut(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn('[AuthService] Sign out warning:', err);
      }
    }

    this.currentFirebaseUser = null;
    this.currentSession = null;
    this.status = 'unauthenticated';
    this.lastError = null;
    this.notifyListeners();
  }

  public async sendPasswordResetEmail(email: string): Promise<void> {
    const auth = getFirebaseAuth();
    if (!auth) {
      const error = new Error('Firebase Authentication is not configured.');
      (error as { code?: string }).code = 'auth/unconfigured';
      throw error;
    }

    const cleanEmail = email?.trim();
    if (!cleanEmail) {
      const error = new Error('Email is required to send password reset.');
      (error as { code?: string }).code = 'auth/invalid-email';
      throw error;
    }

    await firebaseSendPasswordResetEmail(auth, cleanEmail);
  }

  public async signUpWithInvitation(email: string, password: string): Promise<AuthSession> {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !password) {
      const error = new Error('Email and password are required.');
      (error as { code?: string }).code = 'auth/invalid-credential';
      throw error;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      // Offline / development fallback session
      const fallbackUid = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const localPart = cleanEmail.split('@')[0] || 'user';
      const nameParts = localPart.split('.');
      const part0 = nameParts[0] || 'user';
      const firstName = part0.charAt(0).toUpperCase() + part0.slice(1);
      const part1 = nameParts[1];
      const lastName = part1 ? part1.charAt(0).toUpperCase() + part1.slice(1) : 'User';

      const mockSession: AuthSession = {
        user: {
          id: fallbackUid,
          authUid: fallbackUid,
          organizationId: 'org_client_01',
          clientId: 'org_client_01',
          email: cleanEmail,
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
          role: CLIENT_ROLES.EMPLOYEE,
          roleId: CLIENT_ROLES.EMPLOYEE,
          roleIds: [CLIENT_ROLES.EMPLOYEE],
          customPermissions: [],
          departmentIds: [],
          locationIds: [],
          isEmailVerified: true,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        organization: {
          id: 'org_client_01',
          name: 'Client Workspace',
          slug: 'client-workspace',
        },
        token: `mock_tok_${Date.now()}`,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24,
      };

      this.currentSession = mockSession;
      this.status = 'authenticated';
      this.lastError = null;
      this.notifyListeners();
      return mockSession;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;
      this.currentFirebaseUser = user;
      this.currentSession = await this.mapFirebaseUserToSession(user);
      this.status = 'authenticated';
      this.lastError = null;
      this.notifyListeners();
      return this.currentSession;
    } catch (err) {
      this.status = 'error';
      this.lastError = mapFirebaseErrorToMessage(err);
      this.notifyListeners();
      throw err;
    }
  }

  public onAuthStateChanged(callback: AuthStateListener): () => void {
    this.listeners.add(callback);
    // Immediately deliver current cached state upon listener attachment
    callback(this.currentSession, this.status, this.lastError);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Transforms a validated Firebase User into ClientUser and in-memory AuthSession.
   * Multi-tenant company authorization will enrich this in Step 4.
   */
  private async mapFirebaseUserToSession(user: FirebaseUser): Promise<AuthSession> {
    let token: string;
    try {
      token = await user.getIdToken();
    } catch {
      token = '';
    }

    const displayName = user.displayName?.trim() || '';
    const nameParts = displayName ? displayName.split(/\s+/) : [];
    const emailPrefix = user.email ? user.email.split('@')[0] : '';
    const fallbackName = emailPrefix || 'Client';
    const firstName = nameParts[0] || (fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1));
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Admin';

    let orgId = 'org_client_01';
    let role: ClientRole = CLIENT_ROLES.ORG_ADMIN;
    let orgName = 'Client Workspace';
    let orgSlug = 'client-workspace';

    // 1. Resolve from custom claims on token if present
    try {
      const tokenResult = await user.getIdTokenResult();
      const claimOrgId = (tokenResult.claims['organizationId'] || tokenResult.claims['orgId']) as string | undefined;
      const claimRole = tokenResult.claims['role'] as ClientRole | undefined;
      if (claimOrgId) {
        orgId = claimOrgId;
      }
      if (claimRole && (Object.values(CLIENT_ROLES) as ClientRole[]).includes(claimRole)) {
        role = claimRole;
      }
    } catch {
      // Token claims evaluation non-blocking
    }

    // 2. Query root database index (users/{uid}) if database is configured
    if (databaseService.isConfigured()) {
      try {
        const rootUser = await databaseService.get<{
          organizationId?: string;
          role?: ClientRole;
          organizationName?: string;
        }>(`users/${user.uid}`);

        if (rootUser?.organizationId) {
          orgId = rootUser.organizationId;
        } else if (orgId === 'org_client_01') {
          // If no custom claims and user not found in root index, user has no assigned client
          orgId = 'org_unassigned';
        }
        if (rootUser?.role && (Object.values(CLIENT_ROLES) as ClientRole[]).includes(rootUser.role)) {
          role = rootUser.role;
        }
        if (rootUser?.organizationName) {
          orgName = rootUser.organizationName;
          orgSlug = rootUser.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }
      } catch (err) {
        console.warn('[AuthService] Root user mapping notice:', err);
      }
    }

    const clientUser: ClientUser = {
      id: user.uid,
      authUid: user.uid,
      organizationId: orgId,
      clientId: orgId,
      email: user.email || '',
      firstName,
      lastName,
      displayName: user.displayName || `${firstName} ${lastName}`.trim() || 'User',
      photoURL: user.photoURL || undefined,
      avatarUrl: user.photoURL || undefined,
      phone: user.phoneNumber || undefined,
      phoneNumber: user.phoneNumber || undefined,
      role,
      roleIds: [role],
      departmentIds: ['dept_all'],
      locationIds: ['loc_all'],
      isEmailVerified: user.emailVerified,
      status: 'active',
      lastLoginAt: user.metadata.lastSignInTime || new Date().toISOString(),
      createdAt: user.metadata.creationTime || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      user: clientUser,
      organization: {
        id: orgId,
        name: orgName,
        slug: orgSlug,
      },
      token,
      expiresAt: Date.now() + 3600000,
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.currentSession, this.status, this.lastError);
      } catch (err) {
        console.error('[AuthService] Error in auth state listener callback:', err);
      }
    }
  }

  /**
   * Cleanup method to detach Firebase listener if needed.
   */
  public destroy(): void {
    if (this.unsubscribeFirebase) {
      this.unsubscribeFirebase();
      this.unsubscribeFirebase = null;
    }
    this.listeners.clear();
  }
}

export const authService: AuthService = new AuthServiceImpl();
