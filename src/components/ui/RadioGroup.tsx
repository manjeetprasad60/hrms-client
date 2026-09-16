import { useId } from 'react';
import { cn } from '../../utils/cn';

export interface RadioOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
}

export interface RadioGroupProps {
  readonly name: string;
  readonly label?: string;
  readonly value?: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly RadioOption[];
  readonly error?: string;
  readonly helperText?: string;
  readonly disabled?: boolean;
  readonly direction?: 'vertical' | 'horizontal';
  readonly className?: string;
}

export function RadioGroup({
  name,
  label,
  value,
  onChange,
  options,
  error,
  helperText,
  disabled = false,
  direction = 'vertical',
  className,
}: RadioGroupProps) {
  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const errorId = `${generatedId}-error`;
  const helperId = `${generatedId}-helper`;

  const describedBy = [
    helperText ? helperId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div
      role="radiogroup"
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={describedBy}
      className={cn('radio-group', className)}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
    >
      {label && (
        <span id={labelId} className="input-label">
          {label}
        </span>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
          gap: direction === 'horizontal' ? 'var(--space-4)' : 'var(--space-2)',
          flexWrap: 'wrap',
        }}
      >
        {options.map((opt) => {
          const optId = `${name}-${opt.value}`;
          const isSelected = value === opt.value;
          const isOptDisabled = disabled || opt.disabled;

          return (
            <label
              key={opt.value}
              htmlFor={optId}
              style={{
                display: 'inline-flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                cursor: isOptDisabled ? 'not-allowed' : 'pointer',
                opacity: isOptDisabled ? 0.6 : 1,
                userSelect: 'none',
              }}
            >
              <input
                id={optId}
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                disabled={isOptDisabled}
                onChange={() => onChange(opt.value)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--color-primary)',
                  marginTop: '2px',
                  cursor: isOptDisabled ? 'not-allowed' : 'pointer',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-primary)',
                    fontWeight: isSelected ? 500 : 400,
                  }}
                >
                  {opt.label}
                </span>
                {opt.description && (
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      marginTop: '2px',
                    }}
                  >
                    {opt.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <span id={errorId} className="error-text" role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={helperId} className="helper-text">
          {helperText}
        </span>
      )}
    </div>
  );
}
