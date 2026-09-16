import React, { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      icon,
      type = 'button',
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    // Map destructive alias to danger
    const resolvedVariant = variant === 'destructive' ? 'danger' : variant;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? 'true' : undefined}
        aria-disabled={disabled || isLoading ? 'true' : undefined}
        aria-label={ariaLabel}
        className={cn(
          'btn',
          `btn-${resolvedVariant}`,
          `btn-${size}`,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span
            className="spinner"
            style={{ width: '1rem', height: '1rem' }}
            aria-hidden="true"
          />
        ) : (
          icon && <span style={{ display: 'inline-flex', alignItems: 'center' }} aria-hidden="true">{icon}</span>
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
