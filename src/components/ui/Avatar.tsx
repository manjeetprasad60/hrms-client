import { useState } from 'react';
import { formatInitials } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarPresence = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps {
  readonly src?: string;
  readonly alt?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly size?: AvatarSize;
  readonly presence?: AvatarPresence;
  readonly className?: string;
}

const sizeConfig: Record<AvatarSize, { dimension: number; fontSize: string; dotSize: number }> = {
  xs: { dimension: 24, fontSize: '10px', dotSize: 6 },
  sm: { dimension: 32, fontSize: '12px', dotSize: 8 },
  md: { dimension: 40, fontSize: '14px', dotSize: 10 },
  lg: { dimension: 48, fontSize: '16px', dotSize: 12 },
  xl: { dimension: 64, fontSize: '20px', dotSize: 14 },
};

const presenceColors: Record<AvatarPresence, string> = {
  online: 'var(--color-success-text)',
  away: 'var(--color-warning-text)',
  busy: 'var(--color-error-text)',
  offline: 'var(--color-text-muted)',
};

export function Avatar({
  src,
  alt,
  firstName,
  lastName,
  size = 'md',
  presence,
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const cfg = sizeConfig[size];
  const initials = formatInitials(firstName, lastName);
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || alt || 'User avatar';

  return (
    <div
      className={cn('avatar-container', className)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        width: `${cfg.dimension}px`,
        height: `${cfg.dimension}px`,
        flexShrink: 0,
      }}
      title={displayName}
      aria-label={displayName}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || displayName}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 'var(--radius-full)',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: cfg.fontSize,
            border: '1px solid var(--color-primary-ring)',
            userSelect: 'none',
          }}
          aria-hidden="true"
        >
          {initials}
        </div>
      )}

      {presence && (
        <span
          className="avatar-presence"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: `${cfg.dotSize}px`,
            height: `${cfg.dotSize}px`,
            borderRadius: 'var(--radius-full)',
            backgroundColor: presenceColors[presence],
            border: '2px solid #ffffff',
          }}
          title={`Status: ${presence}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
