import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { useAuth } from '../../../routes/AuthContext';
import { ROUTE_PATHS } from '../../../routes/routePaths';
import { mapFirebaseErrorToMessage, mapPasswordResetError } from '../../../services/auth/authErrors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_SECONDS = 60;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success view states
  const [isSuccess, setIsSuccess] = useState(false);
  const [dispatchedEmail, setDispatchedEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const { sendPasswordReset, clearError } = useAuth();

  // Cooldown countdown timer for resending reset email
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const validateForm = (): boolean => {
    setEmailError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setEmailError('Please enter your work email address.');
      emailInputRef.current?.focus();
      return false;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setEmailError('Please enter a valid work email format (e.g. name@company.com).');
      emailInputRef.current?.focus();
      return false;
    }
    return true;
  };

  const handleRequestReset = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setError(null);
    clearError();

    if (!validateForm()) {
      return;
    }

    const targetEmail = email.trim();
    setIsSubmitting(true);

    try {
      await sendPasswordReset(targetEmail);
      // Legitimate email delivered
      setIsSuccess(true);
      setDispatchedEmail(targetEmail);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const resetResult = mapPasswordResetError(err);
      if (resetResult.isSuccessMasked) {
        // Privacy protection: do not reveal that the email does not exist
        setIsSuccess(true);
        setDispatchedEmail(targetEmail);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        // Operational errors (rate limiting, invalid format, network failure)
        setError(resetResult.message || mapFirebaseErrorToMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="forgot-password-card">
      <CardHeader>
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>
            {isSuccess ? 'Check Your Email' : 'Reset Your Password'}
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {isSuccess
              ? 'Password recovery instructions dispatched'
              : 'Enter your registered work email to receive recovery instructions'}
          </p>
        </div>
      </CardHeader>

      <CardBody>
        {/* Error Alert */}
        {error && (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Alert variant="error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        {isSuccess ? (
          /* Success View */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 'var(--space-4)',
              padding: 'var(--space-2) 0',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-success-bg, #ecfdf5)',
                color: 'var(--color-success-text, #065f46)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-success-border, #a7f3d0)',
              }}
              aria-hidden="true"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>

            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                If an account matches <strong>{dispatchedEmail}</strong>, password reset instructions have been sent.
              </p>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  marginTop: 'var(--space-2)',
                  lineHeight: 1.4,
                }}
              >
                Please check your inbox and spam folder. For security, the recovery link expires in 60 minutes.
              </p>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => void handleRequestReset()}
                disabled={cooldown > 0 || isSubmitting}
                isLoading={isSubmitting}
                style={{ width: '100%', minHeight: '40px' }}
              >
                {cooldown > 0 ? `Resend Email (${cooldown}s)` : 'Resend Email'}
              </Button>

              <Link
                to={ROUTE_PATHS.LOGIN}
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-1)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  padding: 'var(--space-2)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Default / Input Form */
          <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} noValidate>
            <Input
              ref={emailInputRef}
              label="Registered Work Email"
              type="email"
              value={email}
              error={emailError ?? undefined}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
                if (error) setError(null);
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
              style={{ width: '100%', marginTop: 'var(--space-2)', minHeight: '44px' }}
            >
              Send Reset Instructions
            </Button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-2)' }}>
              <Link
                to={ROUTE_PATHS.LOGIN}
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-1) var(--space-2)',
                }}
                tabIndex={isSubmitting ? -1 : 0}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
