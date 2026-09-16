/**
 * API Endpoints
 *
 * Centralized catalog of API endpoints.
 * URLs are parameterized rather than containing hard-coded IDs.
 */

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  organization: {
    details: (orgId: string) => `/organizations/${orgId}`,
    departments: (orgId: string) => `/organizations/${orgId}/departments`,
    subscription: (orgId: string) => `/organizations/${orgId}/subscription`,
  },
} as const;
