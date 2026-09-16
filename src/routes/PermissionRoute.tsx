import React from 'react';
import { usePermission } from '../permissions/usePermission';
import { PermissionDenied } from '../components/feedback/PermissionDenied';
import type { ClientRole } from '../permissions/roles';

export interface PermissionRouteProps {
  readonly children: React.ReactNode;
  readonly requiredPermission?: string;
  readonly anyPermissions?: readonly string[];
  readonly allPermissions?: readonly string[];
  readonly requiredRole?: ClientRole | readonly ClientRole[];
}

/**
 * Route guard enforcing granular permission or role access control.
 *
 * Implements the layered architecture:
 * Authentication -> Protected Route -> Permission Check -> Page
 *
 * Renders an accessible 403 Access Restricted state if unauthorized.
 */
export function PermissionRoute({
  children,
  requiredPermission,
  anyPermissions,
  allPermissions,
  requiredRole,
}: PermissionRouteProps) {
  const { can, canAny, canAll, is, role } = usePermission();

  let isAuthorized = true;

  if (anyPermissions && anyPermissions.length > 0) {
    if (!canAny(anyPermissions)) {
      isAuthorized = false;
    }
  } else if (requiredPermission && !can(requiredPermission)) {
    isAuthorized = false;
  } else if (allPermissions && allPermissions.length > 0 && !canAll(allPermissions)) {
    isAuthorized = false;
  } else if (requiredRole && !is(requiredRole)) {
    isAuthorized = false;
  }

  if (!isAuthorized) {
    const roleString = requiredRole
      ? Array.isArray(requiredRole)
        ? (requiredRole as readonly string[]).join(', ')
        : (requiredRole as string)
      : undefined;

    const displayRequired =
      requiredPermission ||
      (anyPermissions && anyPermissions.length > 0
        ? anyPermissions.join(' or ')
        : allPermissions && allPermissions.length > 0
        ? allPermissions.join(' and ')
        : undefined);

    return (
      <PermissionDenied
        requiredPermission={displayRequired}
        requiredRole={roleString}
        currentRole={role ?? undefined}
      />
    );
  }

  return <>{children}</>;
}
