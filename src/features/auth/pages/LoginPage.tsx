import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { useAuth } from '../../../routes/AuthContext';
import { ROUTE_PATHS } from '../../../routes/routePaths';
import { mapFirebaseErrorToMessage, mapPasswordResetError } from '../../../services/auth/authErrors';

type LoginViewMode = 'signin' | 'forgot-password';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const [mode, setMode] = useState<LoginViewMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  // Field validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [resetEmailError, setResetEmailError] = useState<string | null>(null);

  // Operation and notification states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const { login, sendPasswordReset, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || ROUTE_PATHS.DASHBOARD;
  const activeError = localError || authError;

  // Derive session status notice from query parameter without cascading renders
  const reason = searchParams.get('reason');
  const sessionNotice = useMemo<{ message: string; variant: 'info' | 'warning' } | null>(() => {
    if (isNoticeDismissed || !reason || mode !== 'signin') return null;
    if (reason === 'logged-out') {
      return { message: 'You have been signed out successfully.', variant: 'info' };
    }
    if (reason === 'session-expired') {
      return { message: 'Your session has expired. Please sign in again to continue.', variant: 'warning' };
    }
    if (reason === 'unauthorized') {
      return { message: 'Please sign in with authorized credentials to access that workspace.', variant: 'warning' };
    }
    return null;
  }, [reason, isNoticeDismissed, mode]);

  const switchMode = (newMode: LoginViewMode) => {
    setMode(newMode);
    setLocalError(null);
    setResetSuccessMessage(null);
    setEmailError(null);
    setPasswordError(null);
    setResetEmailError(null);
    clearError();
    if (newMode === 'forgot-password' && email.trim()) {
      setResetEmail(email.trim());
    }
  };

  const validateLoginForm = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setEmailError('Work email address is required.');
      if (isValid) emailInputRef.current?.focus();
      isValid = false;
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      setEmailError('Please enter a valid work email address (e.g. name@company.com).');
      if (isValid) emailInputRef.current?.focus();
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      if (isValid) passwordInputRef.current?.focus();
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      if (isValid) passwordInputRef.current?.focus();
      isValid = false;
    }

    return isValid;
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsNoticeDismissed(true);
    clearError();

    if (!validateLoginForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      const friendlyMsg = mapFirebaseErrorToMessage(err);
      setLocalError(friendlyMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateResetForm = (): boolean => {
    setResetEmailError(null);
    const cleanEmail = resetEmail.trim();
    if (!cleanEmail) {
      setResetEmailError('Please enter your work email address.');
      return false;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setResetEmailError('Please enter a valid email format (e.g. name@company.com).');
      return false;
    }
    return true;
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setResetSuccessMessage(null);
    clearError();

    if (!validateResetForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordReset(resetEmail.trim());
      setResetSuccessMessage(
        `If an account matches ${resetEmail.trim()}, password recovery instructions have been sent to your inbox.`
      );
    } catch (err) {
      const resetResult = mapPasswordResetError(err);
      if (resetResult.isSuccessMasked) {
        setResetSuccessMessage(
          `If an account matches ${resetEmail.trim()}, password recovery instructions have been sent to your inbox.`
        );
      } else {
        setLocalError(resetResult.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordKeyChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  return (
    <Card className="login-card">
      <CardHeader>
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>
            {mode === 'signin' ? 'Sign In to Portal' : 'Reset Your Password'}
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {mode === 'signin'
              ? 'Access your organization workforce and HR operations'
              : 'Enter your work email to receive password recovery instructions'}
          </p>
        </div>
      </CardHeader>

      <CardBody>
        {/* Session / Logout Status Notice */}
        {sessionNotice && !activeError && (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Alert
              variant={sessionNotice.variant}
              onDismiss={() => setIsNoticeDismissed(true)}
            >
              {sessionNotice.message}
            </Alert>
          </div>
        )}

        {/* Authentication Error Banner */}
        {activeError && (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Alert
              variant="error"
              onDismiss={() => {
                setLocalError(null);
                clearError();
              }}
            >
              {activeError}
            </Alert>
          </div>
        )}

        {/* Password Reset Success Alert */}
        {resetSuccessMessage && (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Alert
              variant="success"
              onDismiss={() => setResetSuccessMessage(null)}
            >
              {resetSuccessMessage}
            </Alert>
          </div>
        )}

        {mode === 'signin' ? (
          <form onSubmit={handleSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} noValidate>
            <Input
              ref={emailInputRef}
              label="Work Email"
              type="email"
              value={email}
              error={emailError ?? undefined}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
                if (localError) setLocalError(null);
              }}
              placeholder="name@company.com"
              required
              autoComplete="username"
              disabled={isSubmitting}
              autoFocus
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                <span />
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Link
                    to={ROUTE_PATHS.FORGOT_PASSWORD}
                    onClick={(e) => {
                      // Allow quick in-page switch or standard navigation
                      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        e.preventDefault();
                        switchMode('forgot-password');
                      }
                    }}
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-primary)',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                    tabIndex={isSubmitting ? -1 : 0}
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <Input
                  ref={passwordInputRef}
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  error={passwordError ?? undefined}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                    if (localError) setLocalError(null);
                  }}
                  onKeyDown={handlePasswordKeyChange}
                  onKeyUp={handlePasswordKeyChange}
                  onBlur={() => setIsCapsLockOn(false)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  style={{ paddingRight: '2.5rem' }}
                />

                {/* Password visibility toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '2.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    color: 'var(--color-text-muted)',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Caps Lock Indicator */}
              {isCapsLockOn && (
                <div
                  role="status"
                  aria-live="polite"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    fontSize: '11px',
                    color: 'var(--color-warning-text)',
                    marginTop: 'var(--space-1)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 2l7 7h-4v9h-6V9H5l7-7z" />
                  </svg>
                  <span>Caps Lock is ON</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              style={{ width: '100%', marginTop: 'var(--space-2)', minHeight: '44px' }}
            >
              Sign In to Workspace
            </Button>
          </form>
        ) : (
          /* Forgot Password View Mode */
          <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} noValidate>
            <Input
              label="Registered Work Email"
              type="email"
              value={resetEmail}
              error={resetEmailError ?? undefined}
              onChange={(e) => {
                setResetEmail(e.target.value);
                if (resetEmailError) setResetEmailError(null);
                if (localError) setLocalError(null);
              }}
              placeholder="name@company.com"
              required
              autoComplete="email"
              disabled={isSubmitting}
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              style={{ width: '100%', marginTop: 'var(--space-2)' }}
            >
              Send Reset Instructions
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => switchMode('signin')}
              disabled={isSubmitting}
              style={{ width: '100%' }}
            >
              Back to Sign In
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
