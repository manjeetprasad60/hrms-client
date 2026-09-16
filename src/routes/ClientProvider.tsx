import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ClientContextValue } from '../types/client';
import type { ClientOrganization } from '../types/organization';
import type { ClientUser } from '../types/auth';
import { ClientContext } from './ClientContext';
import { useAuth } from './AuthContext';
import { databaseService } from '../services/database';
import { clientDataService } from '../services/client';
import { can as evalCan, cannot as evalCannot, getEffectivePermissions } from '../permissions/can';

export interface ClientProviderProps {
  readonly children: React.ReactNode;
}

/**
 * Client Context Provider
 *
 * Implements the authenticated multi-tenant pipeline:
 * Firebase User -> Firebase UID -> Client User Record -> Client Organization -> Role -> Permissions
 *
 * Enforces zero-trust of client-side identifiers (no localStorage.clientId, no URL parameter trust).
 * Distinguishes loading, active, unconfigured (missing client), and suspended tenant states.
 */
export function ClientProvider({ children }: ClientProviderProps) {
  const { isAuthenticated, firebaseUser, user, session } = useAuth();
  const [rawClientUser, setRawClientUser] = useState<ClientUser | null>(null);
  const [rawOrganization, setRawOrganization] = useState<ClientOrganization | null>(null);
  const [isClientLoading, setIsClientLoading] = useState<boolean>(false);
  const [rawError, setRawError] = useState<string | null>(null);

  // Derive verified organization ID strictly from authenticated session/user
  const rawOrgId = user?.organizationId ?? session?.organization?.id ?? null;
  const organizationId = rawOrgId && rawOrgId !== 'org_unassigned' && rawOrgId !== 'null' ? rawOrgId : null;

  // Derive clientUser and organization strictly under authenticated state
  const clientUser = (isAuthenticated && organizationId)
    ? (rawClientUser ?? (databaseService.isConfigured() ? null : user) ?? null)
    : null;
  const organization = (isAuthenticated && organizationId) ? rawOrganization : null;

  const role = clientUser?.role ?? null;
  const customPermissions = clientUser?.customPermissions;
  const permissions = useMemo(() => getEffectivePermissions(role, customPermissions), [role, customPermissions]);
  const clientStatus = organization?.status ?? null;
  const clientError = (isAuthenticated && organizationId) ? rawError : null;

  const hasClient = Boolean(isAuthenticated && organizationId && organization && clientUser);
  const isUserSuspended = Boolean(
    clientUser && (clientUser.status === 'suspended' || clientUser.status === 'disabled')
  );
  const isSuspended = Boolean(
    hasClient && (clientStatus === 'suspended' || clientStatus === 'inactive' || isUserSuspended)
  );

  const fetchClientData = useCallback(async (orgId: string, uid: string) => {
    setIsClientLoading(true);
    setRawError(null);

    // 10-second timeout safeguard to prevent infinite loading on network hang
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), 10000);
    });

    try {
      await Promise.race([
        (async () => {
          if (databaseService.isConfigured()) {
            // 1. Fetch tenant organization profile
            const orgPath = databaseService.buildTenantPath(orgId, 'organization');
            const dbOrg = await databaseService.get<ClientOrganization>(orgPath);

            if (!dbOrg) {
              // Edge Case: Organization record is missing or deleted
              setRawOrganization(null);
              setRawClientUser(null);
              setRawError('Client organization record not found or has been deleted.');
              return;
            }

            setRawOrganization(dbOrg);

            // 2. Fetch tenant-scoped client user record
            const userPath = databaseService.buildTenantPath(orgId, 'users', uid);
            const dbUser = await databaseService.get<ClientUser>(userPath);

            if (!dbUser) {
              // Edge Case: Client user record is missing / unprovisioned
              setRawClientUser(null);
              setRawError('Your user account is not provisioned in this client organization.');
              return;
            }

            setRawClientUser(dbUser);
            return;
          }

          // Safe fallback when database is unconfigured or during local development
          const fallbackOrg: ClientOrganization = {
            id: orgId,
            name: session?.organization?.name || 'Acme Corp',
            slug: session?.organization?.slug || 'acme-corp',
            defaultCurrency: 'USD',
            defaultTimezone: 'UTC',
            country: 'US',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setRawOrganization(fallbackOrg);
          if (user) {
            setRawClientUser(user);
          }
        })(),
        timeoutPromise,
      ]);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'TIMEOUT') {
        console.warn('[ClientProvider] Network timeout loading client workspace');
        setRawError('Unable to connect to client workspace. Please check your connection.');
      } else {
        console.warn('[ClientProvider] Error loading client organization context:', err);
        setRawError('Unable to resolve client organization details.');
      }
    } finally {
      setIsClientLoading(false);
    }
  }, [session, user]);

  useEffect(() => {
    if (!isAuthenticated || !organizationId) {
      return;
    }

    let isMounted = true;
    const uid = firebaseUser?.uid || user?.id || 'usr_client_default';

    queueMicrotask(() => {
      if (isMounted) {
        void fetchClientData(organizationId, uid);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, organizationId, firebaseUser?.uid, user?.id, fetchClientData]);

  // Synchronize clientDataService with trusted active client session
  useEffect(() => {
    if (isAuthenticated && organizationId) {
      const uid = firebaseUser?.uid || user?.id || 'usr_client_default';
      clientDataService.setTrustedContext({
        organizationId,
        userId: clientUser?.id || uid,
        role: clientUser?.role ?? role,
        customPermissions: clientUser?.customPermissions,
      });
    } else {
      clientDataService.clearTrustedContext();
    }

    return () => {
      clientDataService.clearTrustedContext();
    };
  }, [isAuthenticated, organizationId, firebaseUser?.uid, user?.id, clientUser, role]);

  const refreshClient = useCallback(async () => {
    if (organizationId) {
      const uid = firebaseUser?.uid || user?.id || 'usr_client_default';
      await fetchClientData(organizationId, uid);
    }
  }, [organizationId, firebaseUser?.uid, user?.id, fetchClientData]);

  const value: ClientContextValue = useMemo(() => ({
    firebaseUser,
    clientUser,
    organization,
    organizationId,
    role,
    permissions,
    clientStatus,
    isClientLoading,
    clientError,
    hasClient,
    isSuspended,
    can: (permission: string) => evalCan(role, permission, customPermissions),
    cannot: (permission: string) => evalCannot(role, permission, customPermissions),
    refreshClient,
    currency: organization?.defaultCurrency ?? organization?.currency ?? 'USD',
    timezone: organization?.defaultTimezone ?? organization?.timezone ?? 'UTC',
    country: organization?.country ?? 'US',
  }), [
    firebaseUser,
    clientUser,
    organization,
    organizationId,
    role,
    customPermissions,
    permissions,
    clientStatus,
    isClientLoading,
    clientError,
    hasClient,
    isSuspended,
    refreshClient,
  ]);

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

/**
 * Backward compatibility alias for TenantProvider
 */
export const TenantProvider = ClientProvider;
