import React from 'react';
import { NavLink } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { usePermission } from '../../../permissions/usePermission';
import { SETTINGS_CATEGORIES, type SettingsCategoryId } from '../types';

export interface SettingsLayoutProps {
  readonly activeCategory: SettingsCategoryId;
  readonly onSelectCategory: (category: SettingsCategoryId) => void;
  readonly children: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  activeCategory,
  onSelectCategory,
  children,
}) => {
  const { can, canAny } = usePermission();

  const accessibleCategories = SETTINGS_CATEGORIES.filter((cat) => {
    if (cat.requiredPermission && !can(cat.requiredPermission)) {
      return false;
    }
    if (cat.anyPermissions && cat.anyPermissions.length > 0 && !canAny(cat.anyPermissions)) {
      return false;
    }
    return true;
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(240px, 280px) 1fr',
        gap: 'var(--space-6)',
        alignItems: 'start',
      }}
      className="settings-layout-grid"
    >
      {/* Settings Navigation Sidebar */}
      <aside
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
          padding: 'var(--space-3)',
        }}
      >
        <div style={{ padding: 'var(--space-2) var(--space-3)', marginBottom: 'var(--space-1)' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-muted)',
            }}
          >
            Settings Categories
          </span>
        </div>

        {/* Dynamic extensible category links (filtered from SETTINGS_CATEGORIES.map by permissions) */}
        {accessibleCategories.map((cat) => {
          if (cat.path) {
            // External routes like /settings/organization, /users, /roles
            return (
              <NavLink
                key={cat.id}
                to={cat.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item-active' : ''}`
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                <span>{cat.shortTitle}</span>
                {cat.badge && (
                  <Badge variant={cat.badgeVariant || 'neutral'} style={{ fontSize: '10px', padding: '1px 5px' }}>
                    {cat.badge}
                  </Badge>
                )}
              </NavLink>
            );
          }

          const isSelected = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: isSelected ? 600 : 500,
                color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span>{cat.shortTitle}</span>
              {cat.badge && (
                <Badge
                  variant={cat.badgeVariant || 'neutral'}
                  style={{ fontSize: '10px', padding: '1px 5px' }}
                >
                  {cat.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </aside>

      {/* Main Category Workspace */}
      <main style={{ minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
};
