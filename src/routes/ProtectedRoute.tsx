import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useClient } from './ClientContext';
import { ROUTE_PATHS } from './routePaths';
import { AppLoading } from '../components/feedback/Loading/AppLoading';
import { AccountNotConfigured } from '../components/feedback/AccountNotConfigured';
import { OrganizationSuspended } from '../components/feedback/OrganizationSuspended';

export interface ProtectedRouteProps {
  readonly children: React.ReactNode;
}

/**
 * Route guard enforcing authentication and client context resolution.
 *
 * Implements the lifecycle pipeline:
 * 1. Firebase Auth Initializing -> Loading Screen ("Verifying session...")
 * 2. Unauthenticated -> Redirect to /login
 * 3. Authenticated + Client Context Loading -> Loading Screen ("Loading client workspace...")
 * 4. Missing Client Organization -> AccountNotConfigured Screen
 * 5. Suspended / Inactive Client -> OrganizationSuspended Screen
 * 6. Authorized Active Client -> Children (AppShell & modules)
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isInitializing, logout, user } = useAuth();
  const { isClientLoading, hasClient, isSuspended, organization, clientStatus, clientError, clientUser } = useClient();
  const location = useLocation();

  // Stage 1: Firebase Auth initializing
  if (isInitializing) {
    return (
      <AppLoading
        message="Verifying session..."
        submessage="Connecting to secure workspace..."
      />
    );
  }

  // Stage 2: Redirect unauthenticated visitors
  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} state={{ from: location }} replace />;
  }

  // Stage 3: Authenticated, but client organization context is resolving
  if (isClientLoading) {
    return (
      <AppLoading
        message="Loading client workspace..."
        submessage="Resolving organization profile and permissions..."
      />
    );
  }

  // Stage 4: Missing client relationship (Account Not Configured)
  if (!hasClient) {
    return (
      <AccountNotConfigured
        userEmail={user?.email}
        title={clientError ? 'Workspace Access Restricted' : 'Account Not Configured'}
        message={clientError ? clientError : undefined}
        onSignOut={() => void logout()}
      />
    );
  }

  // Stage 5: Inactive or Suspended Client Organization / User Account
  if (isSuspended) {
    const isUserSuspended = Boolean(
      clientUser && (clientUser.status === 'suspended' || clientUser.status === 'disabled')
    );
    return (
      <OrganizationSuspended
        organizationName={organization?.name}
        status={isUserSuspended ? 'suspended' : (clientStatus ?? 'suspended')}
        title={isUserSuspended ? 'User Account Suspended' : undefined}
        message={
          isUserSuspended
            ? 'Your client user account has been suspended or disabled by an administrator. Please contact your organization administrator to restore access.'
            : undefined
        }
        onSignOut={() => void logout()}
      />
    );
  }

  // Stage 6: Client context ready and authorized
  return <>{children}</>;
}
