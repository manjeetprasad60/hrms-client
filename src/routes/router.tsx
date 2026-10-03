import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from './routePaths';
import { AppShell } from '../layouts/AppShell';
import { AuthLayout } from '../layouts/AuthLayout';
import { PageContainer } from '../layouts/PageContainer';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { AcceptInvitationPage } from '../features/auth/pages/AcceptInvitationPage';
import { ClientInviteLandingPage } from '../features/auth/pages/ClientInviteLandingPage';
import { EmployeeManagementPage } from '../features/employees';
import { DepartmentManagementPage } from '../features/departments';
import { LocationManagementPage } from '../features/locations';
import { DocumentManagementPage } from '../features/documents';
import { SubscriptionPage } from '../features/subscription';
import { ActivityPage } from '../features/activity';
import { AdministratorManagementPage } from '../features/administrators';
import { DashboardOverview } from '../features/dashboard/components/DashboardOverview';
import { OrganizationProfilePage } from '../features/organization';
import { SettingsPage } from '../features/settings';
import { UserManagementPage } from '../features/users';
import { RoleManagementPage } from '../features/roles';
import { AttendanceManagementPage } from '../features/attendance';
import { LeaveManagementPage } from '../features/leave';
import { NotFoundPage } from './NotFoundPage';
import { EmptyState } from '../components/feedback/EmptyState';
import { RouteErrorBoundary } from '../components/feedback/ErrorBoundary';

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
      <PublicRoute allowInvitation>
        <AuthLayout title="Accept Invitation | HRIS Client Portal" subtitle="Account Setup">
          <AcceptInvitationPage />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: ROUTE_PATHS.CLIENT_INVITE,
    errorElement: <RouteErrorBoundary />,
    element: (
      <PublicRoute allowInvitation>
        <AuthLayout title="Client Invitation | HRIS Client Portal" subtitle="Accept Your Invitation">
          <ClientInviteLandingPage />
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
        element: <DashboardOverview />,
      },
      {
        path: ROUTE_PATHS.EMPLOYEES,
        element: <EmployeeManagementPage />,
      },
      {
        path: ROUTE_PATHS.DEPARTMENTS,
        element: <DepartmentManagementPage />,
      },
      {
        path: ROUTE_PATHS.LOCATIONS,
        element: <LocationManagementPage />,
      },
      {
        path: ROUTE_PATHS.DOCUMENTS,
        element: <DocumentManagementPage />,
      },
      {
        path: ROUTE_PATHS.SUBSCRIPTION,
        element: <SubscriptionPage />,
      },
      {
        path: ROUTE_PATHS.ACTIVITY,
        element: <ActivityPage />,
      },
      {
        path: ROUTE_PATHS.ADMINISTRATORS,
        element: <AdministratorManagementPage />,
      },
      {
        path: ROUTE_PATHS.ATTENDANCE,
        element: <AttendanceManagementPage />,
      },
      {
        path: ROUTE_PATHS.LEAVE,
        element: <LeaveManagementPage />,
      },
      {
        path: 'leaves',
        element: <Navigate to={ROUTE_PATHS.LEAVE} replace />,
      },
      {
        path: ROUTE_PATHS.PAYROLL,
        element: (
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
        ),
      },
      {
        path: ROUTE_PATHS.RECRUITMENT,
        element: (
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
        ),
      },
      {
        path: ROUTE_PATHS.PERFORMANCE,
        element: (
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
        ),
      },
      {
        path: ROUTE_PATHS.REPORTS,
        element: (
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
        ),
      },
      {
        path: ROUTE_PATHS.SETTINGS,
        element: <SettingsPage />,
      },
      {
        path: ROUTE_PATHS.SETTINGS_ORGANIZATION,
        element: <OrganizationProfilePage />,
      },
      {
        path: 'organization',
        element: <Navigate to={ROUTE_PATHS.SETTINGS_ORGANIZATION} replace />,
      },
      {
        path: ROUTE_PATHS.SETTINGS_USERS,
        element: <UserManagementPage />,
      },
      {
        path: 'users',
        element: <Navigate to={ROUTE_PATHS.SETTINGS_USERS} replace />,
      },
      {
        path: ROUTE_PATHS.SETTINGS_ROLES,
        element: <RoleManagementPage />,
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
