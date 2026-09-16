import type { BadgeVariant } from '../../components/ui/Badge';
import { PERMISSIONS } from '../../permissions/permissions';

export type SettingsCategoryId =
  | 'overview'
  | 'organization'
  | 'localization'
  | 'branding'
  | 'working_configuration'
  | 'notifications'
  | 'security'
  | 'users'
  | 'roles';

export interface SettingsCategory {
  readonly id: SettingsCategoryId;
  readonly title: string;
  readonly shortTitle: string;
  readonly description: string;
  readonly isImplemented: boolean;
  readonly badge?: string;
  readonly badgeVariant?: BadgeVariant;
  readonly path?: string;
  readonly phase: string;
  readonly requiredPermission?: string;
  readonly anyPermissions?: readonly string[];
}

export const SETTINGS_CATEGORIES: readonly SettingsCategory[] = [
  {
    id: 'overview',
    title: 'Settings Overview',
    shortTitle: 'Overview',
    description: 'Centralized directory of all organization preferences, configurations, and governance policies.',
    isImplemented: true,
    phase: 'Phase 3',
    anyPermissions: [
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_MANAGE,
      PERMISSIONS.ORGANIZATION_VIEW,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.ROLES_VIEW,
    ],
  },
  {
    id: 'organization',
    title: 'Organization Identity',
    shortTitle: 'Organization',
    description: 'Official corporate legal name, company registration, tax identifiers, and registered headquarters.',
    isImplemented: true,
    path: '/settings/organization',
    badge: 'Active',
    badgeVariant: 'success',
    phase: 'Phase 3 Step 3',
    requiredPermission: PERMISSIONS.ORGANIZATION_VIEW,
  },
  {
    id: 'localization',
    title: 'Localization & Regional Defaults',
    shortTitle: 'Localization',
    description: 'Default operating country, system timezone, reporting currency, and date/time display formats.',
    isImplemented: true,
    badge: 'Active',
    badgeVariant: 'success',
    phase: 'Phase 3 Step 4',
    anyPermissions: [PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_MANAGE],
  },
  {
    id: 'branding',
    title: 'Branding & Appearance',
    shortTitle: 'Branding',
    description: 'Corporate logo, primary brand color themes, custom portal titles, and appearance preferences.',
    isImplemented: true,
    badge: 'Active',
    badgeVariant: 'success',
    phase: 'Phase 3 Step 4',
    anyPermissions: [PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_MANAGE],
  },
  {
    id: 'working_configuration',
    title: 'Working Configuration & Schedules',
    shortTitle: 'Working Hours',
    description: 'Standard work days, weekly shift thresholds, flexible clock-in rules, and fiscal calendar cycles.',
    isImplemented: false,
    badge: 'Phase 4',
    badgeVariant: 'neutral',
    phase: 'Phase 4 (Time & Attendance)',
    anyPermissions: [PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_MANAGE],
  },
  {
    id: 'notifications',
    title: 'Notification Preferences',
    shortTitle: 'Notifications',
    description: 'System alert delivery, daily manager approval digests, and broadcast announcement rules.',
    isImplemented: false,
    badge: 'Upcoming',
    badgeVariant: 'neutral',
    phase: 'Phase 4',
    anyPermissions: [PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_MANAGE],
  },
  {
    id: 'security',
    title: 'Security & Access Controls',
    shortTitle: 'Security',
    description: 'Mandatory multi-factor authentication (MFA), session timeout limits, and audit log policies.',
    isImplemented: false,
    badge: 'Upcoming',
    badgeVariant: 'neutral',
    phase: 'Phase 4',
    anyPermissions: [PERMISSIONS.SETTINGS_MANAGE],
  },
  {
    id: 'users',
    title: 'User Management',
    shortTitle: 'Users',
    description: 'Provision client user accounts, assign initial access, and oversee administrative invitations.',
    isImplemented: true,
    path: '/settings/users',
    badge: 'Active',
    badgeVariant: 'success',
    phase: 'Phase 3 Step 6',
    requiredPermission: PERMISSIONS.USERS_VIEW,
  },
  {
    id: 'roles',
    title: 'Roles & Granular Permissions',
    shortTitle: 'Roles & Permissions',
    description: 'Configure organizational roles, granular action capabilities, and role delegation matrices.',
    isImplemented: true,
    path: '/settings/roles',
    badge: 'Active',
    badgeVariant: 'success',
    phase: 'Phase 3 Step 10',
    requiredPermission: PERMISSIONS.ROLES_VIEW,
  },
];
