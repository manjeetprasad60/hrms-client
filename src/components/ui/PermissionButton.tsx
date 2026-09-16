import React from 'react';
import { Button, type ButtonProps } from './Button';
import { usePermission } from '../../permissions/usePermission';

export interface PermissionButtonProps extends ButtonProps {
  /**
   * Action permission required to perform this action (e.g. "employees.create").
   */
  readonly permission?: string;
  /**
   * Alternative: user must possess at least one of these permissions.
   */
  readonly anyPermissions?: readonly string[];
  /**
   * Alternative: user must possess all of these permissions.
   */
  readonly allPermissions?: readonly string[];
  /**
   * If true, renders the button in disabled state with explanatory title tooltip instead of hiding it.
   * Default: false (button is hidden when unauthorized).
   */
  readonly disableUnauthorized?: boolean;
  /**
   * Optional custom explanation shown in tooltip when button is disabled due to missing permission.
   */
  readonly unauthorizedTooltip?: string;
}

/**
 * Permission-Aware Button Component
 *
 * Automatically inspects the current user's permissions and either:
 * 1. Hides the button entirely (default: progressive disclosure)
 * 2. Renders a disabled button with an explanatory tooltip (`disableUnauthorized: true`)
 *
 * Example:
 * <PermissionButton permission="employees.create" variant="primary">
 *   Add Employee
 * </PermissionButton>
 */
export const PermissionButton = React.forwardRef<HTMLButtonElement, PermissionButtonProps>(
  (
    {
      permission,
      anyPermissions,
      allPermissions,
      disableUnauthorized = false,
      unauthorizedTooltip,
      disabled,
      title,
      ...buttonProps
    },
    ref
  ) => {
    const { can, canAny, canAll } = usePermission();

    let isAuthorized = true;

    if (permission && !can(permission)) {
      isAuthorized = false;
    } else if (anyPermissions && anyPermissions.length > 0 && !canAny(anyPermissions)) {
      isAuthorized = false;
    } else if (allPermissions && allPermissions.length > 0 && !canAll(allPermissions)) {
      isAuthorized = false;
    }

    if (!isAuthorized) {
      if (!disableUnauthorized) {
        return null;
      }

      const defaultTooltip = permission
        ? `Permission required: ${permission}`
        : 'You do not have permission to perform this action';

      return (
        <Button
          ref={ref}
          {...buttonProps}
          disabled={true}
          aria-disabled="true"
          title={unauthorizedTooltip ?? defaultTooltip}
          style={{
            cursor: 'not-allowed',
            opacity: 0.6,
            ...buttonProps.style,
          }}
        />
      );
    }

    return <Button ref={ref} disabled={disabled} title={title} {...buttonProps} />;
  }
);

PermissionButton.displayName = 'PermissionButton';
