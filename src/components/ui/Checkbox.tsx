import React, { useId, useEffect, useRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  readonly label?: React.ReactNode;
  readonly helperText?: string;
  readonly error?: string;
  readonly indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      error,
      indeterminate = false,
      checked,
      disabled,
      className,
      id,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLInputElement | null>(null);
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const helperId = `${checkboxId}-helper`;
    const errorId = `${checkboxId}-error`;

    useEffect(() => {
      const el = internalRef.current;
      if (el) {
        el.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const setRefs = (element: HTMLInputElement | null) => {
      internalRef.current = element;
      if (typeof forwardedRef === 'function') {
        forwardedRef(element);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = element;
      }
    };

    const describedBy = [
      helperText ? helperId : null,
      error ? errorId : null,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('checkbox-wrap', className)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <label
          htmlFor={checkboxId}
          style={{
            display: 'inline-flex',
            alignItems: 'flex-start',
            gap: 'var(--space-2)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            userSelect: 'none',
          }}
        >
          <input
            ref={setRefs}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            className={cn('checkbox-input', error && 'checkbox-error')}
            style={{
              width: '18px',
              height: '18px',
              accentColor: 'var(--color-primary)',
              marginTop: '2px',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            {...props}
          />
          {label && (
            <span
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-snug)',
              }}
            >
              {label}
            </span>
          )}
        </label>

        {error && (
          <span id={errorId} className="error-text" role="alert" style={{ marginLeft: '26px' }}>
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={helperId} className="helper-text" style={{ marginLeft: '26px' }}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
