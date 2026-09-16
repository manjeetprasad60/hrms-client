import React, { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonShape = 'square' | 'circle';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  readonly 'aria-label': string; // Strictly required for accessibility
  readonly icon: React.ReactNode;
  readonly variant?: IconButtonVariant;
  readonly size?: IconButtonSize;
  readonly shape?: IconButtonShape;
  readonly isLoading?: boolean;
}

const sizeDimensions: Record<IconButtonSize, { size: string; padding: string }> = {
  sm: { size: '32px', padding: '0.375rem' },
  md: { size: '36px', padding: '0.5rem' },
  lg: { size: '42px', padding: '0.625rem' },
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      variant = 'secondary',
      size = 'md',
      shape = 'square',
      isLoading = false,
      disabled,
      className,
      type = 'button',
      'aria-label': ariaLabel,
      style,
      ...props
    },
    ref
  ) => {
    const dim = sizeDimensions[size];

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? 'true' : undefined}
        aria-disabled={disabled || isLoading ? 'true' : undefined}
        className={cn(
          'btn',
          `btn-${variant}`,
          'btn-icon',
          shape === 'circle' && 'btn-icon-circle',
          className
        )}
        style={{
          width: dim.size,
          height: dim.size,
          padding: 0,
          borderRadius: shape === 'circle' ? 'var(--radius-full)' : 'var(--radius-md)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...style,
        }}
        {...props}
      >
        {isLoading ? (
          <span
            className="spinner"
            style={{ width: '1rem', height: '1rem' }}
            aria-hidden="true"
          />
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center' }} aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
