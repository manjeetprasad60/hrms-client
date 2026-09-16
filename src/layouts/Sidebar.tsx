import { useEffect } from 'react';
import { Navigation } from './Navigation';
import { cn } from '../utils/cn';

export interface SidebarProps {
  readonly isCollapsed: boolean;
  readonly onToggleCollapse: () => void;
  readonly isMobileOpen?: boolean;
  readonly onCloseMobile?: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  // Close mobile sidebar on Escape key
  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onCloseMobile) {
        onCloseMobile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen, onCloseMobile]);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 45,
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'app-sidebar',
          isCollapsed && 'collapsed',
          isMobileOpen && 'sidebar-mobile-open'
        )}
      >
        {/* Sidebar Header / Controls */}
        <div
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '0' : '0 var(--space-4)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {!isCollapsed && (
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wider)',
                color: '#64748b',
              }}
            >
              Navigation
            </span>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="sidebar-collapse-btn"
            style={{
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-sm)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {isCollapsed ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Navigation
            isCollapsed={isCollapsed}
            onItemClick={onCloseMobile}
          />
        </div>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: isCollapsed ? 'var(--space-3) 0' : 'var(--space-3) var(--space-4)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: 'var(--text-xs)',
            color: '#64748b',
            textAlign: isCollapsed ? 'center' : 'left',
          }}
        >
          {!isCollapsed ? (
            <div>HR Operations Portal</div>
          ) : (
            <div>v0.1</div>
          )}
        </div>
      </aside>
    </>
  );
}
