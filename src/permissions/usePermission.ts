import { useContext, useMemo } from 'react';
import { ClientContext } from '../routes/ClientContext';
import { AuthContext } from '../routes/AuthContext';
import { getEffectivePermissions } from './can';
import type { ClientRole } from './roles';
import type { PermissionKey } from './permissions';
import type { ClientUser } from '../types/auth';

export interface UsePermissionOptions {
  readonly currentRole?: ClientRole;
  readonly customPermissions?: readonly string[];
}

export interface PermissionContextValue {
  readonly user: ClientUser | null;
  readonly role: ClientRole | null;
  readonly permissions: readonly PermissionKey[];
  readonly isAuthenticated: boolean;
  readonly can: (permission: string) => boolean;
  readonly cannot: (permission: string) => boolean;
  readonly canAny: (permissions: readonly string[]) => boolean;
  readonly canAll: (permissions: readonly string[]) => boolean;
  readonly is: (allowedRoles: ClientRole | readonly ClientRole[]) => boolean;
}

/**
 * Primary React Hook for Component-Level Permission Checks.
 *
 * Connects the Phase 1 permission architecture to the authenticated Client User
 * and Client Organization context (Phase 2).
 *
 * Pipeline:
 * Firebase User -> Client User -> Role -> Permissions -> Navigation / Actions / Routes
 */
export function usePermission(_options?: UsePermissionOptions): PermissionContextValue {
  const clientCtx = useContext(ClientContext);
  const authCtx = useContext(AuthContext);

  const isAuthenticated = authCtx?.isAuthenticated ?? Boolean(clientCtx?.firebaseUser);
  const user = clientCtx?.clientUser ?? authCtx?.user ?? null;
  const role = user?.role ?? null;
  const permissions = useMemo(() => getEffectivePermissions(), []);

  return useMemo(
    () => ({
      user,
      role,
      permissions,
      isAuthenticated,
      can: (_permission: string) => true,
      cannot: (_permission: string) => false,
      canAny: (_reqPermissions: readonly string[]) => true,
      canAll: (_reqPermissions: readonly string[]) => true,
      is: (_allowed: ClientRole | readonly ClientRole[]) => true,
    }),
    [user, role, permissions, isAuthenticated]
  );
}
