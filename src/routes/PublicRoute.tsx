import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ROUTE_PATHS } from './routePaths';
import { AppLoading } from '../components/feedback/Loading/AppLoading';

export interface PublicRouteProps {
  readonly children: React.ReactNode;
}

/**
 * Guard for public authentication routes (e.g. /login).
 * If Firebase Auth is still initializing, waits before redirecting.
 * If the user is already authenticated, redirects them to the dashboard or requested return route.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <AppLoading
        message="Verifying session..."
        submessage="Checking credentials..."
      />
    );
  }

  if (isAuthenticated) {
    const fromState = (location.state as { from?: unknown })?.from;
    let target = ROUTE_PATHS.DASHBOARD as string;

    if (typeof fromState === 'string' && fromState.startsWith('/')) {
      if (fromState !== ROUTE_PATHS.LOGIN && fromState !== ROUTE_PATHS.FORGOT_PASSWORD) {
        target = fromState;
      }
    } else if (fromState && typeof fromState === 'object' && 'pathname' in fromState) {
      const loc = fromState as { pathname?: string; search?: string; hash?: string };
      const path = loc.pathname || ROUTE_PATHS.DASHBOARD;
      if (path !== ROUTE_PATHS.LOGIN && path !== ROUTE_PATHS.FORGOT_PASSWORD) {
        target = `${path}${loc.search || ''}${loc.hash || ''}`;
      }
    }

    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}
