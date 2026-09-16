import React from 'react';
import { cn } from '../../utils/cn';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly size?: 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
  sm: { width: '1rem', height: '1rem', borderWidth: '2px' },
  md: { width: '1.5rem', height: '1.5rem', borderWidth: '2px' },
  lg: { width: '2.25rem', height: '2.25rem', borderWidth: '3px' },
};

export function Spinner({ size = 'md', className, style, ...props }: SpinnerProps) {
  return (
    <span
      className={cn('spinner', className)}
      style={{ ...sizeStyles[size], ...style }}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
}
