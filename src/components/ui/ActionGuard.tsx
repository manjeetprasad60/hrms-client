import React from 'react';
import { usePermission } from '../../permissions/usePermission';
import type { ClientRole } from '../../permissions/roles';

export interface ActionGuardProps {
  readonly children: React.ReactNode;
  readonly permission?: string;
  readonly anyPermissions?: readonly string[];
  readonly allPermissions?: readonly string[];
  readonly role?: ClientRole | readonly ClientRole[];
  readonly fallback?: React.ReactNode;
}

/**
 * Declarative component for conditional action rendering based on permissions or roles.
 *
 * Keeps UI components clean and decouples authorization checks from component markup.
 *
 * Example:
 * <ActionGuard permission="employees.edit" fallback={<Badge>View Only</Badge>}>
 *   <Button size="sm">Edit Employee</Button>
 * </ActionGuard>
 */
export function ActionGuard({
  children,
  permission,
  anyPermissions,
  allPermissions,
  role,
  fallback = null,
}: ActionGuardProps) {
  const { can, canAny, canAll, is } = usePermission();

  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  if (anyPermissions && anyPermissions.length > 0 && !canAny(anyPermissions)) {
    return <>{fallback}</>;
  }

  if (allPermissions && allPermissions.length > 0 && !canAll(allPermissions)) {
    return <>{fallback}</>;
  }

  if (role && !is(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
