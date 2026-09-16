import React from 'react';
import { cn } from '../../utils/cn';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly variant?: SkeletonVariant;
  readonly width?: string | number;
  readonly height?: string | number;
  readonly count?: number;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  className,
  style,
  ...props
}: SkeletonProps) {
  const getBorderRadius = () => {
    if (variant === 'circular') return 'var(--radius-full)';
    if (variant === 'text') return 'var(--radius-sm)';
    return 'var(--radius-md)';
  };

  const getDefaultHeight = () => {
    if (variant === 'text') return '1rem';
    if (variant === 'circular') return width || '40px';
    return '80px';
  };

  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      aria-hidden="true"
      className={cn('skeleton', `skeleton-${variant}`, className)}
      style={{
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || getDefaultHeight(),
        borderRadius: getBorderRadius(),
        backgroundColor: 'var(--color-bg-subtle)',
        ...style,
      }}
      {...props}
    />
  ));

  if (count === 1) {
    return elements[0] ?? null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%' }}>
      {elements}
    </div>
  );
}
