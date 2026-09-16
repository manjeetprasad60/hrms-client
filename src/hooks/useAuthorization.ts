import type { ClientRole } from '../permissions/roles';
import { usePermission, type UsePermissionOptions } from '../permissions/usePermission';
import type { Permission } from '../permissions/permissions';

export type UseAuthorizationOptions = UsePermissionOptions;

export interface AuthorizationResult {
  readonly role: ClientRole | null;
  readonly permissions: readonly Permission[];
  readonly can: (permission: string) => boolean;
  readonly cannot: (permission: string) => boolean;
  readonly canAny: (permissions: readonly string[]) => boolean;
  readonly canAll: (permissions: readonly string[]) => boolean;
  readonly is: (allowedRoles: ClientRole | readonly ClientRole[]) => boolean;
}

/**
 * Hook for component-level role and permission verification.
 * Enables UI components to render or restrict capabilities dynamically.
 *
 * Backed by the centralized permission engine in src/permissions/.
 */
export function useAuthorization(options?: UseAuthorizationOptions): AuthorizationResult {
  const perm = usePermission(options);

  return {
    role: perm.role,
    permissions: perm.permissions,
    can: perm.can,
    cannot: perm.cannot,
    canAny: perm.canAny,
    canAll: perm.canAll,
    is: perm.is,
  };
}
