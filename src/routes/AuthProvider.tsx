import React, { useState, useEffect, useCallback } from 'react';
import type { AuthContextValue, LoginCredentials, AuthStatus, FirebaseUser } from './authContextTypes';
import type { AuthSession } from '../types/auth';
import { AuthContext } from './AuthContext';
import { authService } from '../services/auth/authService';
import { mapFirebaseErrorToMessage } from '../services/auth/authErrors';

export interface AuthProviderProps {
  readonly children: React.ReactNode;
}

/**
 * Authentication Context Provider
 *
 * Implements the architecture:
 * Firebase Auth -> AuthService -> AuthProvider (Context) -> React Application
 *
 * Ensures application distinguishes between:
 * - Initializing (waiting for Firebase onAuthStateChanged callback)
 * - Authenticated (valid session & user active)
 * - Unauthenticated (no session)
 * - Error (authentication exception encountered)
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    authService.getCurrentSession()
  );
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(() =>
    authService.getCurrentFirebaseUser()
  );
  const [status, setStatus] = useState<AuthStatus>(() =>
    authService.getAuthStatus()
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((updatedSession, updatedStatus, authError) => {
      setSession(updatedSession);
      setFirebaseUser(authService.getCurrentFirebaseUser());
      setStatus(updatedStatus);
      if (authError) {
        setError(authError);
      }
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const activeSession = await authService.signInWithEmail(credentials);
      setSession(activeSession);
      setFirebaseUser(authService.getCurrentFirebaseUser());
      setStatus('authenticated');
    } catch (err) {
      const userMessage = mapFirebaseErrorToMessage(err);
      setError(userMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setSession(null);
      setFirebaseUser(null);
      setStatus('unauthenticated');
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.sendPasswordResetEmail(email);
    } catch (err) {
      const userMessage = mapFirebaseErrorToMessage(err);
      setError(userMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextValue = {
    status,
    firebaseUser,
    user: session?.user ?? null,
    session,
    isAuthenticated: status === 'authenticated' && Boolean(session?.user),
    isInitializing: status === 'initializing',
    isLoading,
    error,
    login,
    logout,
    sendPasswordReset,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
