/**
 * Authentication Service Contracts & Data Transfer Objects
 *
 * Defines the service abstraction separating UI components from Firebase Auth.
 * Architecture: UI -> Feature -> AuthService -> Firebase Auth
 */

import type { User as FirebaseUser } from 'firebase/auth';
import type { ClientUser, AuthSession } from '../../types/auth';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated' | 'error';

export interface LoginCredentials {
  readonly email: string;
  readonly password?: string;
}

export type AuthErrorCode =
  | 'auth/invalid-credential'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/too-many-requests'
  | 'auth/network-request-failed'
  | 'auth/unconfigured'
  | 'auth/unknown';

export interface AuthError {
  readonly code: AuthErrorCode;
  readonly message: string;
}

export type AuthStateListener = (
  session: AuthSession | null,
  status: AuthStatus,
  error: string | null
) => void;

export interface AuthService {
  /**
   * Signs in a user using email and password credentials.
   */
  signInWithEmail(credentials: LoginCredentials): Promise<AuthSession>;

  /**
   * Signs out the active user session.
   */
  signOut(): Promise<void>;

  /**
   * Sends a password reset verification link to the target email.
   */
  sendPasswordResetEmail(email: string): Promise<void>;

  /**
   * Completes account registration for an invited user.
   */
  signUpWithInvitation(email: string, password: string): Promise<AuthSession>;

  /**
   * Returns current cached in-memory session if active.
   */
  getCurrentSession(): AuthSession | null;

  /**
   * Returns the underlying Firebase User if authenticated.
   */
  getCurrentFirebaseUser(): FirebaseUser | null;

  /**
   * Returns the current lifecycle state of authentication.
   */
  getAuthStatus(): AuthStatus;

  /**
   * Subscribes to authentication state transitions.
   * Returns unsubscribe cleanup function.
   */
  onAuthStateChanged(callback: AuthStateListener): () => void;

  /**
   * Reports whether the underlying Firebase Auth service is active and configured.
   */
  isConfigured(): boolean;
}

export type { ClientUser, AuthSession, FirebaseUser };
