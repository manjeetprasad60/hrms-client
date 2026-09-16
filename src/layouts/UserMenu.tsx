import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { formatInitials, formatRoleLabel } from '../utils/formatters';
import { useAuth } from '../routes/AuthContext';
import { useClient } from '../routes/ClientContext';
import { ROUTE_PATHS } from '../routes/routePaths';
import { useToast } from '../components/feedback/ToastContext';

export interface UserMenuProps {
  readonly userName?: string;
  readonly userRole?: string;
  readonly userEmail?: string;
  readonly organizationName?: string;
}

export function UserMenu({
  userName,
  userRole,
  userEmail,
  organizationName,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { user, logout } = useAuth();
  const { organization, clientUser, role } = useClient();
  const navigate = useNavigate();
  const toast = useToast();

  const activeUserName =
    userName ??
    (clientUser
      ? `${clientUser.firstName} ${clientUser.lastName}`
      : user
      ? `${user.firstName} ${user.lastName}`
      : 'User');

  const activeUserRole =
    userRole ??
    (role
      ? formatRoleLabel(role)
      : clientUser?.role
      ? formatRoleLabel(clientUser.role)
      : formatRoleLabel(user?.role));

  const activeUserEmail =
    userEmail ?? clientUser?.email ?? user?.email ?? 'user@client.internal';

  const activeOrgName =
    organizationName ?? organization?.name ?? 'Workspace';

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const initials = formatInitials(
    activeUserName.split(' ')[0],
    activeUserName.split(' ')[1]
  );

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setIsOpen(false);
    try {
      await logout();
      navigate(`${ROUTE_PATHS.LOGIN}?reason=logged-out`, { replace: true });
    } catch (err) {
      console.warn('[UserMenu] Logout notice:', err);
      navigate(`${ROUTE_PATHS.LOGIN}?reason=logged-out`, { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="user-dropdown-menu"
        aria-label={`User menu for ${activeUserName}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-md)',
          transition: 'background-color var(--transition-fast)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: 'var(--text-xs)',
            border: '1px solid var(--color-primary-ring)',
          }}
        >
          {initials}
        </div>

        <div
          className="user-menu-meta"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
          }}
        >
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              lineHeight: 1.2,
            }}
          >
            {activeUserName}
          </span>
          <Badge variant="neutral" style={{ fontSize: '10px', padding: '1px 6px', marginTop: '2px' }}>
            {activeUserRole}
          </Badge>
        </div>

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
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          id="user-dropdown-menu"
          role="menu"
          aria-label="User account actions"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + var(--space-2))',
            width: '260px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--elevation-2)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {/* Identity Header */}
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: '1px solid var(--color-border-default)',
              backgroundColor: 'var(--color-bg-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {activeUserName}
              </span>
              <Badge variant="neutral" style={{ fontSize: '10px', padding: '1px 6px' }}>
                {activeUserRole}
              </Badge>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {activeUserEmail}
            </div>

            {/* Active Organization Context */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: 'var(--space-2)',
                paddingTop: 'var(--space-2)',
                borderTop: '1px dashed var(--color-border-default)',
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
                <path d="M9 9h1" />
                <path d="M9 13h1" />
                <path d="M9 17h1" />
              </svg>
              <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{activeOrgName}</span>
            </div>
          </div>

          {/* Action Links */}
          <div style={{ padding: 'var(--space-1) 0' }}>
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setIsOpen(false);
                toast.info('User profile details will be manageable in Organization Settings.', 'My Profile');
              }}
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-4)',
                textAlign: 'left',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>My Profile</span>
            </button>

            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setIsOpen(false);
                toast.info('Portal preferences and appearance will be configurable in upcoming phase.', 'Preferences');
              }}
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-4)',
                textAlign: 'left',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Preferences</span>
            </button>
          </div>

          {/* Logout Action */}
          <div style={{ borderTop: '1px solid var(--color-border-default)', padding: 'var(--space-1) 0' }}>
            <button
              role="menuitem"
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-busy={isSigningOut}
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-4)',
                textAlign: 'left',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-error-text)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: isSigningOut ? 'not-allowed' : 'pointer',
                opacity: isSigningOut ? 0.7 : 1,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
