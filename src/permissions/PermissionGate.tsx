import React from 'react';
import { usePermission } from './usePermission';
import type { ClientRole } from './roles';

export interface PermissionGateProps {
  readonly children: React.ReactNode;
  /**
   * Action permission to verify (e.g. "employees.create", "leave.approve")
   */
  readonly I?: string;
  /**
   * Alternative alias for I
   */
  readonly do?: string;
  /**
   * Explicit permission prop
   */
  readonly permission?: string;
  /**
   * User must have at least one of these permissions
   */
  readonly anyOf?: readonly string[];
  /**
   * User must have all of these permissions
   */
  readonly allOf?: readonly string[];
  /**
   * Role membership check
   */
  readonly role?: ClientRole | readonly ClientRole[];
  /**
   * Fallback rendered when permission check fails
   */
  readonly fallback?: React.ReactNode;
}

/**
 * Declarative component for conditional UI rendering based on permissions.
 *
 * Can also be imported and used as `<Can>`:
 *
 * Examples:
 * <Can I="employees.create">
 *   <Button>Add Employee</Button>
 * </Can>
 *
 * <PermissionGate permission="leave.approve" fallback={<span>Approval pending</span>}>
 *   <Button>Approve Request</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  I,
  do: doAction,
  permission,
  anyOf,
  allOf,
  role,
  fallback = null,
}: PermissionGateProps) {
  const { can, canAny, canAll, is } = usePermission();

  const targetPermission = I ?? doAction ?? permission;

  if (targetPermission && !can(targetPermission)) {
    return <>{fallback}</>;
  }

  if (anyOf && anyOf.length > 0 && !canAny(anyOf)) {
    return <>{fallback}</>;
  }

  if (allOf && allOf.length > 0 && !canAll(allOf)) {
    return <>{fallback}</>;
  }

  if (role && !is(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export const Can = PermissionGate;
export type CanProps = PermissionGateProps;
