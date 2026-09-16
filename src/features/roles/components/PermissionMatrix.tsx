import React from 'react';
import {
  groupPermissionsByCategory,
  getAllPermissionCategories,
  type PermissionCategory,
} from '../../../permissions/registry';
import type { PermissionKey } from '../../../permissions/permissions';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Badge } from '../../../components/ui/Badge';

export interface PermissionMatrixProps {
  readonly selectedPermissions: readonly PermissionKey[];
  readonly onChange?: (permissions: PermissionKey[]) => void;
  readonly readOnly?: boolean;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  selectedPermissions,
  onChange,
  readOnly = false,
}) => {
  const grouped = groupPermissionsByCategory();
  const categories = getAllPermissionCategories();
  const selectedSet = new Set(selectedPermissions);

  const handleToggle = (key: PermissionKey) => {
    if (readOnly || !onChange) return;
    if (selectedSet.has(key)) {
      onChange(selectedPermissions.filter((p) => p !== key));
    } else {
      onChange([...selectedPermissions, key]);
    }
  };

  const handleSelectAllCategory = (cat: PermissionCategory) => {
    if (readOnly || !onChange) return;
    const catKeys = grouped[cat].map((d) => d.key);
    const newSelected = new Set([...selectedPermissions, ...catKeys]);
    onChange(Array.from(newSelected));
  };

  const handleClearCategory = (cat: PermissionCategory) => {
    if (readOnly || !onChange) return;
    const catKeys = new Set(grouped[cat].map((d) => d.key));
    onChange(selectedPermissions.filter((p) => !catKeys.has(p)));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      {categories.map((category) => {
        const defs = grouped[category];
        if (!defs || defs.length === 0) return null;

        const catSelectedCount = defs.filter((d) => selectedSet.has(d.key)).length;
        const allSelected = defs.length > 0 && catSelectedCount === defs.length;

        return (
          <div
            key={category}
            style={{
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
              backgroundColor: 'var(--color-surface)',
              overflow: 'hidden',
            }}
          >
            {/* Category Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-surface-hover)',
                borderBottom: '1px solid var(--color-border-default)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {category}
                </span>
                <Badge variant={catSelectedCount > 0 ? 'primary' : 'neutral'}>
                  {catSelectedCount} / {defs.length}
                </Badge>
              </div>

              {!readOnly && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => (allSelected ? handleClearCategory(category) : handleSelectAllCategory(category))}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-brand-primary)',
                      cursor: 'pointer',
                      fontWeight: 500,
                      padding: '2px 6px',
                    }}
                  >
                    {allSelected ? 'Clear All' : 'Select All'}
                  </button>
                </div>
              )}
            </div>

            {/* Permission Checkbox List */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
              }}
            >
              {defs.map((def) => {
                const isChecked = selectedSet.has(def.key);

                return (
                  <div
                    key={def.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-2)',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isChecked ? 'var(--color-brand-surface, #eff6ff)' : 'transparent',
                      border: isChecked
                        ? '1px solid var(--color-brand-border, #bfdbfe)'
                        : '1px solid var(--color-border-default)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <Checkbox
                      id={`perm-${def.key}`}
                      checked={isChecked}
                      disabled={readOnly}
                      onChange={() => handleToggle(def.key)}
                      aria-label={def.name}
                      style={{ marginTop: '2px' }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: readOnly ? 'default' : 'pointer',
                      }}
                      onClick={() => !readOnly && handleToggle(def.key)}
                    >
                      <span
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 500,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {def.name}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          marginTop: '2px',
                          lineHeight: 1.3,
                        }}
                      >
                        {def.description}
                      </span>
                      <code
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--color-text-secondary)',
                          marginTop: '4px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {def.key}
                      </code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
