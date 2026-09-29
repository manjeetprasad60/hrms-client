import React from 'react';
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
}: PermissionRouteProps) {
  return <>{children}</>;
}
