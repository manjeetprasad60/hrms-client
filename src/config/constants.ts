/**
 * Application Constants
 *
 * Defines global constants, storage keys, and layout tokens.
 * Tenant IDs, role IDs, and API URLs MUST NOT be hard-coded here.
 */

export const APP_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  SIDEBAR_COLLAPSED_STORAGE_KEY: 'hris_client_sidebar_collapsed',
  THEME_STORAGE_KEY: 'hris_client_theme',
  AUTH_STORAGE_KEY: 'hris_client_auth_session',
  DATE_FORMAT: 'YYYY-MM-DD',
  DISPLAY_DATE_FORMAT: 'MMM DD, YYYY',
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
