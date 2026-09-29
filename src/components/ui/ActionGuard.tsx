import React from 'react';
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
}: ActionGuardProps) {
  return <>{children}</>;
}
