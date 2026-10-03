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
    user: '/auth/user',
  },
  organization: {
    details: (orgId: string) => `/organizations/${orgId}`,
    departments: (orgId: string) => `/organizations/${orgId}/departments`,
    subscription: (orgId: string) => `/organizations/${orgId}/subscription`,
    users: (orgId: string) => `/organizations/${orgId}/users`,
    user: (orgId: string, userId: string) => `/organizations/${orgId}/users/${userId}`,
    roles: (orgId: string) => `/organizations/${orgId}/roles`,
    role: (orgId: string, roleId: string) => `/organizations/${orgId}/roles/${roleId}`,
    auditLogs: (orgId: string) => `/organizations/${orgId}/audit-logs`,
    settings: (orgId: string) => `/organizations/${orgId}/settings`,
    invitations: (orgId: string) => `/organizations/${orgId}/invitations`,
    invitation: (orgId: string, invId: string) => `/organizations/${orgId}/invitations/${invId}`,
  },
  companies: {
    details: (companyId: string) => `/companies/${companyId}`,
    employees: (companyId: string) => `/companies/${companyId}/employees`,
    employee: (companyId: string, employeeId: string) => `/companies/${companyId}/employees/${employeeId}`,
    departments: (companyId: string) => `/companies/${companyId}/departments`,
    department: (companyId: string, departmentId: string) => `/companies/${companyId}/departments/${departmentId}`,
    locations: (companyId: string) => `/companies/${companyId}/locations`,
    location: (companyId: string, locationId: string) => `/companies/${companyId}/locations/${locationId}`,
    documents: (companyId: string) => `/companies/${companyId}/documents`,
    document: (companyId: string, documentId: string) => `/companies/${companyId}/documents/${documentId}`,
    administrators: (companyId: string) => `/companies/${companyId}/administrators`,
    administrator: (companyId: string, adminId: string) => `/companies/${companyId}/administrators/${adminId}`,
    activities: (companyId: string) => `/companies/${companyId}/activities`,
    subscription: (companyId: string) => `/companies/${companyId}/subscription`,
    memberships: (companyId: string) => `/companies/${companyId}/memberships`,
  },
  invitations: {
    verify: (token: string) => `/api/invitations/verify/${encodeURIComponent(token)}`,
    accept: '/api/invitations/accept',
  },
  employees: {
    base: '/employees',
    create: '/employees',
    byId: (id: string) => `/employees/${id}`,
  },
  attendance: {
    base: '/attendance',
    byId: (id: string) => `/attendance/${id}`,
    summary: '/attendance/summary',
    clockOut: '/attendance/clock-out',
    byEmployee: (employeeId: string) => `/attendance/employee/${employeeId}`,
    today: (employeeId: string) => `/attendance/today/${employeeId}`,
  },
  leave: {
    base: '/leave',
    requests: '/leave/requests',
    requestById: (id: string) => `/leave/requests/${id}`,
    approve: (id: string) => `/leave/requests/${id}/approve`,
    reject: (id: string) => `/leave/requests/${id}/reject`,
    policies: '/leave/policies',
    policyById: (id: string) => `/leave/policies/${id}`,
    balances: '/leave/balances',
    balanceByEmployee: (empId: string) => `/leave/balances/${empId}`,
    adjustBalance: '/leave/balances/adjust',
    summary: '/leave/summary',
  },
  plans: {
    details: (planId: string) => `/plans/${planId}`,
  },
} as const;

