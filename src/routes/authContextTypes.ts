import type { ClientUser, AuthSession } from '../types/auth';
import type { AuthStatus, LoginCredentials, FirebaseUser } from '../services/auth/auth.types';

export type { AuthStatus, LoginCredentials, FirebaseUser };

export interface AuthContextValue {
  readonly status: AuthStatus;
  readonly firebaseUser: FirebaseUser | null;
  readonly user: ClientUser | null;
  readonly session: AuthSession | null;
  readonly isAuthenticated: boolean;
  readonly isInitializing: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly login: (credentials: LoginCredentials) => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly sendPasswordReset: (email: string) => Promise<void>;
  readonly clearError: () => void;
}
