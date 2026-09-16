import { useState, useRef, useEffect, useId } from 'react';
import { cn } from '../../utils/cn';

export interface MultiSelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface MultiSelectProps {
  readonly options: readonly MultiSelectOption[];
  readonly value: readonly string[];
  readonly onChange: (values: readonly string[]) => void;
  readonly label?: string;
  readonly placeholder?: string;
  readonly error?: string;
  readonly helperText?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  label,
  placeholder = 'Select options...',
  error,
  helperText,
  disabled = false,
  required = false,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleOption = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const removeValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const describedBy = [
    helperText ? helperId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div
      ref={containerRef}
      className={cn('input-group', className)}
      style={{ position: 'relative' }}
    >
      {label && (
        <label htmlFor={selectId} className="input-label">
          <span>{label}</span>
          {required && (
            <span className="input-required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Trigger Box */}
      <div
        id={selectId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={cn('input', error && 'input-error')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '40px',
          height: 'auto',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '4px 8px',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', flex: 1 }}>
          {selectedOptions.length === 0 ? (
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)', padding: '2px 4px' }}>
              {placeholder}
            </span>
          ) : (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-primary-ring)',
                }}
              >
                <span>{opt.label}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => removeValue(opt.value, e)}
                    aria-label={`Remove ${opt.label}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                      color: 'inherit',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </span>
            ))
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
          {selectedOptions.length > 0 && !disabled && (
            <button
              type="button"
              onClick={clearAll}
              aria-label="Clear all selections"
              style={{
                color: 'var(--color-text-muted)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              color: 'var(--color-text-muted)',
              transition: 'transform var(--transition-fast)',
              transform: isOpen ? 'rotate(180deg)' : 'none',
            }}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          role="listbox"
          aria-multiselectable="true"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--elevation-2)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {/* Search Input Filter */}
          <div style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--color-border-default)' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search options..."
              className="input"
              style={{ height: '32px', fontSize: 'var(--text-xs)', padding: '4px 8px' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px 0' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '8px 12px', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                No options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = value.includes(opt.value);

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isChecked}
                    onClick={() => {
                      if (!opt.disabled) toggleOption(opt.value);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      opacity: opt.disabled ? 0.5 : 1,
                      backgroundColor: isChecked ? 'var(--color-bg-subtle)' : 'transparent',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      style={{ accentColor: 'var(--color-primary)' }}
                      tabIndex={-1}
                    />
                    <span style={{ color: 'var(--color-text-primary)' }}>{opt.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

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
