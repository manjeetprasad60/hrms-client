import { type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  readonly orientation?: 'horizontal' | 'vertical';
}

export function Divider({ orientation = 'horizontal', className, ...props }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={cn('divider-vertical', className)}
        style={{
          display: 'inline-block',
          width: '1px',
          backgroundColor: 'var(--color-border-default)',
          alignSelf: 'stretch',
          margin: '0 var(--space-3)',
        }}
        {...props}
      />
    );
  }

  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={cn('divider', className)}
      {...props}
    />
  );
}
