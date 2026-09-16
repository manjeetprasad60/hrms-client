/**
 * Centralized Route Paths
 *
 * Defines all application route paths in a type-safe catalog.
 */

export const ROUTE_PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  ACCEPT_INVITATION: '/accept-invitation',
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',
  ATTENDANCE: '/attendance',
  LEAVE: '/leave',
  LEAVES: '/leave', // Alias for backward compatibility
  PAYROLL: '/payroll',
  RECRUITMENT: '/recruitment',
  PERFORMANCE: '/performance',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  SETTINGS_ORGANIZATION: '/settings/organization',
  ORGANIZATION: '/settings/organization',
  SETTINGS_USERS: '/settings/users',
  USERS: '/settings/users',
  SETTINGS_ROLES: '/settings/roles',
  ROLES: '/settings/roles',
} as const;

export type RoutePath = typeof ROUTE_PATHS[keyof typeof ROUTE_PATHS];
