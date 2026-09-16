/**
 * Auth Feature Boundary
 *
 * Exposes authentication pages, state definitions, and feature components.
 */

export interface AuthFeatureState {
  readonly isInitialized: boolean;
}

export * from './pages/LoginPage';
export * from './pages/ForgotPasswordPage';
export * from './pages/AcceptInvitationPage';
