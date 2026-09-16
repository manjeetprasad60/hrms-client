import { useAuth } from '../../../routes/AuthContext';
import { useTenant } from '../../../routes/TenantContext';
import { Badge } from '../../../components/ui/Badge';
import { PermissionButton } from '../../../components/ui/PermissionButton';
import { PERMISSIONS } from '../../../permissions/permissions';
import { useToast } from '../../../components/feedback/ToastContext';
import { formatRoleLabel } from '../../../utils/formatters';

export function DashboardWelcomeHeader() {
  const { user, session } = useAuth();
  const { organization, organizationId } = useTenant();
  const toast = useToast();

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Administrator';
  const orgName = organization?.name ?? session?.organization?.name ?? 'Organization Workspace';
  const orgId = organization?.id ?? organizationId ?? session?.organization?.id ?? user?.organizationId ?? '—';
  const formattedRole = formatRoleLabel(user?.role);

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const handleAddEmployee = () => {
    toast.info('New Employee onboarding modal will open in the Employees module.', 'Add Employee');
  };

  const handleOpenSettings = () => {
    toast.info('Navigating to Organization Configuration settings.', 'Settings');
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-default)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--elevation-1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ flex: '1 1 320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
            <Badge variant="primary">{orgName}</Badge>
            <Badge variant="neutral">{formattedRole}</Badge>
            <Badge variant="success">Tenant Active</Badge>
          </div>

          <h1
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-tight)',
            }}
          >
            Welcome back, {fullName}
          </h1>

          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-1)',
            }}
          >
            {currentDate} &bull; Client ID: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{orgId}</code>
          </p>
        </div>

        {/* Header Action Shortcuts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
          }}
        >
          <PermissionButton
            permission={PERMISSIONS.SETTINGS_MANAGE}
            variant="secondary"
            size="md"
            onClick={handleOpenSettings}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </PermissionButton>

          <PermissionButton
            permission={PERMISSIONS.EMPLOYEES_CREATE}
            variant="primary"
            size="md"
            onClick={handleAddEmployee}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Add Employee
          </PermissionButton>
        </div>
      </div>
    </div>
  );
}
