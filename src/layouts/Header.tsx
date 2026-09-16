import { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { UserMenu } from './UserMenu';
import { useAuth } from '../routes/AuthContext';
import { useClient } from '../routes/ClientContext';
import { useTenant } from '../routes/TenantContext';
import { formatRoleLabel } from '../utils/formatters';
import { useToast } from '../components/feedback/ToastContext';

export interface HeaderProps {
  readonly organizationName?: string;
  readonly userName?: string;
  readonly userRole?: string;
  readonly onOpenMobileMenu?: () => void;
}

export function Header({
  organizationName,
  userName,
  userRole,
  onOpenMobileMenu,
}: HeaderProps) {
  const { user, session } = useAuth();
  const { organization, clientUser, role } = useClient();
  const { organization: tenantOrg } = useTenant();
  const toast = useToast();
  const [imgError, setImgError] = useState(false);

  // Authoritative organization resolution: strictly from authenticated ClientContext
  const currentOrgName =
    organizationName ??
    organization?.name ??
    tenantOrg?.name ??
    session?.organization.name ??
    'Workspace';

  const currentUserName =
    userName ??
    (clientUser
      ? `${clientUser.firstName} ${clientUser.lastName}`
      : user
      ? `${user.firstName} ${user.lastName}`
      : 'User');

  const currentUserRole =
    userRole ??
    (role
      ? formatRoleLabel(role)
      : clientUser?.role
      ? formatRoleLabel(clientUser.role)
      : formatRoleLabel(user?.role));

  const currentUserEmail =
    clientUser?.email ?? user?.email ?? session?.user.email;

  const logoUrl = organization?.logoUrl || organization?.logo;

  return (
    <header className="app-header-full">
      {/* Left: Mobile Menu Trigger & Company Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {/* Mobile Hamburger Control */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="mobile-menu-btn"
          aria-label="Open mobile navigation menu"
          style={{
            display: 'none', // Controlled via CSS media queries
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-default)',
            backgroundColor: 'var(--color-bg-subtle)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Company Identity / Context */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {logoUrl && !imgError ? (
            <img
              src={logoUrl}
              alt={`${currentOrgName} logo`}
              onError={() => setImgError(true)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover',
                border: '1px solid var(--color-border-default)',
                boxShadow: 'var(--elevation-1)',
              }}
            />
          ) : (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 'var(--text-md)',
                boxShadow: 'var(--elevation-1)',
              }}
              aria-hidden="true"
            >
              {currentOrgName.charAt(0).toUpperCase()}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  maxWidth: '220px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={currentOrgName}
              >
                {currentOrgName}
              </span>
              <Badge variant="primary" style={{ fontSize: '10px', padding: '1px 6px' }}>
                Client Workspace
              </Badge>
            </div>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.2,
              }}
            >
              {organization?.legalName && organization.legalName !== currentOrgName
                ? organization.legalName
                : 'Authorized Workspace'}
            </span>
          </div>
        </div>
      </div>

      {/* Center / Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {/* Search Input Shell */}
        <div className="header-search-wrap" style={{ width: '260px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                position: 'absolute',
                left: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search HR operations..."
              className="input"
              style={{ paddingLeft: '2.25rem', height: '36px', fontSize: 'var(--text-sm)' }}
              aria-label="Search HR operations"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  toast.info('Global search will connect to workforce data in Phase 2.', 'Search');
                }
              }}
            />
          </div>
        </div>

        {/* Notifications Button */}
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => {
            toast.info('You have 0 unread notifications. All operational queues are clear.', 'Notifications');
          }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-text-secondary)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-default)',
            boxShadow: 'var(--elevation-1)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {/* User Profile & Menu */}
        <UserMenu
          userName={currentUserName}
          userRole={currentUserRole}
          userEmail={currentUserEmail}
          organizationName={currentOrgName}
        />
      </div>
    </header>
  );
}
