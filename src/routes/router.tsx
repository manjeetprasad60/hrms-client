import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from './routePaths';
import { AppShell } from '../layouts/AppShell';
import { AuthLayout } from '../layouts/AuthLayout';
import { PageContainer } from '../layouts/PageContainer';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { PermissionRoute } from './PermissionRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { AcceptInvitationPage } from '../features/auth/pages/AcceptInvitationPage';
import { DashboardOverview } from '../features/dashboard/components/DashboardOverview';
import { OrganizationProfilePage } from '../features/organization';
import { SettingsPage } from '../features/settings';
import { UserManagementPage } from '../features/users';
import { RoleManagementPage } from '../features/roles';
import { NotFoundPage } from './NotFoundPage';
import { EmptyState } from '../components/feedback/EmptyState';
import { RouteErrorBoundary } from '../components/feedback/ErrorBoundary';
import { PERMISSIONS } from '../permissions/permissions';

/**
 * Client Admin Web Central Router
 *
 * Implements the layered route architecture:
 * Authentication (ProtectedRoute) -> Permission Check (PermissionRoute) -> Page.
 *
 * Separates:
 * 1. Public Routes (/login)
 * 2. Protected Application Shell Routes (/, /dashboard, /employees, etc.)
 * 3. Fallback Catch-All Route (NotFoundPage)
 */
export const router = createBrowserRouter([
  // Public Authentication Routes
  {
    path: ROUTE_PATHS.LOGIN,
    errorElement: <RouteErrorBoundary />,
    element: (
      <PublicRoute>
        <AuthLayout title="Sign In | HRIS Client Portal" subtitle="Organization HR Operations">
          <LoginPage />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: ROUTE_PATHS.FORGOT_PASSWORD,
    errorElement: <RouteErrorBoundary />,
    element: (
      <PublicRoute>
        <AuthLayout title="Reset Password | HRIS Client Portal" subtitle="Password Recovery">
          <ForgotPasswordPage />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: ROUTE_PATHS.ACCEPT_INVITATION,
    errorElement: <RouteErrorBoundary />,
    element: (
      <PublicRoute>
        <AuthLayout title="Accept Invitation | HRIS Client Portal" subtitle="Account Setup">
          <AcceptInvitationPage />
        </AuthLayout>
      </PublicRoute>
    ),
  },

  // Protected Application Routes
  {
    path: ROUTE_PATHS.ROOT,
    errorElement: <RouteErrorBoundary />,
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTE_PATHS.DASHBOARD} replace />,
      },
      {
        path: ROUTE_PATHS.DASHBOARD,
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.DASHBOARD_VIEW}>
            <DashboardOverview />
          </PermissionRoute>
        ),
      },
      {
        path: ROUTE_PATHS.EMPLOYEES,
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.EMPLOYEES_VIEW}>
            <PageContainer
              title="Employee Directory"
              description="Manage organizational staff, profiles, and employment status."
              breadcrumbs={[{ label: 'Employees' }]}
            >
              <EmptyState
                title="Employee Directory"
                description="Staff listing, employee onboarding, profiles, and organizational charts."
              />
            </PageContainer>
          </PermissionRoute>
        ),
      },
      {
        path: ROUTE_PATHS.ATTENDANCE,
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.ATTENDANCE_VIEW}>
            <PageContainer
              title="Time & Attendance"
              description="Review employee check-ins, work logs, and timesheet records."
              breadcrumbs={[{ label: 'Attendance' }]}
            >
              <EmptyState
                title="Attendance Tracking"
                description="Daily attendance logs, shift scheduling, and timesheet approvals."
              />
            </PageContainer>
          </PermissionRoute>
        ),
      },
      {
        path: ROUTE_PATHS.LEAVE,
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.LEAVE_VIEW}>
            <PageContainer
              title="Leave Management"
              description="Track time-off policies, leave balances, and pending approvals."
              breadcrumbs={[{ label: 'Leave' }]}
            >
              <EmptyState
                title="Leave & Time-Off"
                description="Leave applications, team calendars, and entitlement balances."
              />
            </PageContainer>
          </PermissionRoute>
        ),
      },
      {
        path: 'leaves',
        element: <Navigate to={ROUTE_PATHS.LEAVE} replace />,
      },
      {
        path: ROUTE_PATHS.PAYROLL,
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.PAYROLL_VIEW}>
            <PageContainer
              title="Payroll Operations"
              description="Process salary disbursements, tax deductions, and pay runs."
              breadcrumbs={[{ label: 'Payroll' }]}
            >
              <EmptyState
                title="Payroll Management"
                description="Salary structures, payslip generation, deductions, and tax compliance."
              />
            </PageContainer>
          </PermissionRoute>
        ),
      },
      {
        path: ROUTE_PATHS.RECRUITMENT,
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.RECRUITMENT_VIEW}>
            <PageContainer
              title="Recruitment & Hiring"
              description="Track job requisitions, candidate pipelines, and offers."
              breadcrumbs={[{ label: 'Recruitment' }]}
            >
              <EmptyState
                title="Recruitment Pipeline"
                description="Job vacancies, applicant tracking, and interview scheduling."
              />
            </PageContainer>
          </PermissionRoute>
        ),
      },
      {
        path: ROUTE_PATHS.PERFORMANCE,
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.PERFORMANCE_VIEW}>
            <PageContainer
              title="Performance Management"
              description="Employee appraisals, goal tracking, and review cycles."
              breadcrumbs={[{ label: 'Performance' }]}
            >
              <EmptyState
                title="Performance & Reviews"
                description="Quarterly appraisals, KPI tracking, and 360-degree feedback."
              />
            </PageContainer>
          </PermissionRoute>
        ),
      },
      {
        path: ROUTE_PATHS.REPORTS,
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.REPORTS_VIEW}>
            <PageContainer
              title="Analytics & Reports"
              description="Generate workforce analytics, headcount reports, and audit summaries."
              breadcrumbs={[{ label: 'Reports' }]}
            >
              <EmptyState
                title="HR Analytics & Reports"
                description="Headcount metrics, turnover reports, and exportable compliance logs."
              />
            </PageContainer>
          </PermissionRoute>
        ),
      },
      {
        path: ROUTE_PATHS.SETTINGS,
        element: (
          <PermissionRoute
            requiredPermission={PERMISSIONS.SETTINGS_MANAGE}
            anyPermissions={[
              PERMISSIONS.SETTINGS_VIEW,
              PERMISSIONS.SETTINGS_MANAGE,
              PERMISSIONS.ORGANIZATION_VIEW,
              PERMISSIONS.USERS_VIEW,
              PERMISSIONS.ROLES_VIEW,
            ]}
          >
            <SettingsPage />
          </PermissionRoute>
        ),
      },
      {
        path: ROUTE_PATHS.SETTINGS_ORGANIZATION,
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.ORGANIZATION_VIEW}>
            <OrganizationProfilePage />
          </PermissionRoute>
        ),
      },
      {
        path: 'organization',
        element: <Navigate to={ROUTE_PATHS.SETTINGS_ORGANIZATION} replace />,
      },
      {
        path: ROUTE_PATHS.SETTINGS_USERS,
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.USERS_VIEW}>
            <UserManagementPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'users',
        element: <Navigate to={ROUTE_PATHS.SETTINGS_USERS} replace />,
      },
      {
        path: ROUTE_PATHS.SETTINGS_ROLES,
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.ROLES_VIEW}>
            <RoleManagementPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'roles',
        element: <Navigate to={ROUTE_PATHS.SETTINGS_ROLES} replace />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },

  // Fallback for non-matching public URLs
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
