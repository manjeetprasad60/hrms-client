import { createContext, useContext } from 'react';
import type { AuthContextValue } from './authContextTypes';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Hook to access current authentication state and session operations.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
