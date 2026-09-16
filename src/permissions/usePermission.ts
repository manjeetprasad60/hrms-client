import { useContext, useMemo } from 'react';
import { ClientContext } from '../routes/ClientContext';
import { AuthContext } from '../routes/AuthContext';
import {
  can as evalCan,
  cannot as evalCannot,
  canAny as evalCanAny,
  canAll as evalCanAll,
  hasRole as evalHasRole,
  getEffectivePermissions,
} from './can';
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
export function usePermission(options?: UsePermissionOptions): PermissionContextValue {
  const clientCtx = useContext(ClientContext);
  const authCtx = useContext(AuthContext);

  const isAuthenticated = authCtx?.isAuthenticated ?? Boolean(clientCtx?.firebaseUser);
  const user = clientCtx?.clientUser ?? authCtx?.user ?? null;
  const role = options?.currentRole ?? clientCtx?.role ?? user?.role ?? null;
  const customPermissions = options?.customPermissions ?? user?.customPermissions;

  const permissions = useMemo(() => {
    if (!options?.currentRole && !options?.customPermissions && clientCtx?.permissions) {
      return clientCtx.permissions;
    }
    return getEffectivePermissions(user ?? role, customPermissions);
  }, [user, role, customPermissions, options?.currentRole, options?.customPermissions, clientCtx?.permissions]);

  return useMemo(
    () => ({
      user,
      role,
      permissions,
      isAuthenticated,
      can: (permission: string) => evalCan(user ?? role, permission, customPermissions),
      cannot: (permission: string) => evalCannot(user ?? role, permission, customPermissions),
      canAny: (reqPermissions: readonly string[]) => evalCanAny(user ?? role, reqPermissions, customPermissions),
      canAll: (reqPermissions: readonly string[]) => evalCanAll(user ?? role, reqPermissions, customPermissions),
      is: (allowed: ClientRole | readonly ClientRole[]) => evalHasRole(user ?? role, allowed),
    }),
    [user, role, permissions, isAuthenticated, customPermissions]
  );
}
