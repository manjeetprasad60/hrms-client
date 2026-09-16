import { useId } from 'react';
import { cn } from '../../utils/cn';

export interface SwitchProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly label?: string;
  readonly description?: string;
  readonly disabled?: boolean;
  readonly id?: string;
  readonly className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className,
}: SwitchProps) {
  const generatedId = useId();
  const switchId = id || generatedId;
  const labelId = `${switchId}-label`;
  const descId = `${switchId}-desc`;

  return (
    <div
      className={cn('switch-wrap', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        userSelect: 'none',
      }}
      onClick={() => {
        if (!disabled) {
          onChange(!checked);
        }
      }}
    >
      {/* Visual Switch Button */}
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        style={{
          width: '40px',
          height: '22px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-border-strong)',
          position: 'relative',
          padding: 0,
          border: 'none',
          transition: 'background-color var(--transition-fast)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          flexShrink: 0,
          marginTop: '2px',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '20px' : '2px',
            width: '18px',
            height: '18px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--elevation-1)',
            transition: 'left var(--transition-fast)',
          }}
          aria-hidden="true"
        />
      </button>

      {(label || description) && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {label && (
            <span
              id={labelId}
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
              }}
            >
              {label}
            </span>
          )}
          {description && (
            <span
              id={descId}
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                marginTop: '2px',
              }}
            >
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
