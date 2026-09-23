import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { ROUTE_PATHS } from '../../../routes/routePaths';
import { authService } from '../../../services/auth/authService';
import { invitationService } from '../../../services/invitation/invitationService';
import {
  verifyClientInvitation,
  acceptClientInvitation,
  type BackendInvitationData,
  type InviteApiError,
} from '../../../services/invitation/clientInviteApiService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type InviteStep = 'verifying' | 'welcome' | 'setup' | 'activating' | 'success' | 'error';

interface PasswordValidation {
  readonly minLength: boolean;
  readonly hasUppercase: boolean;
  readonly hasLowercase: boolean;
  readonly hasNumber: boolean;
  readonly hasSpecial: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validatePassword(pw: string): PasswordValidation {
  return {
    minLength: pw.length >= 8,
    hasUppercase: /[A-Z]/.test(pw),
    hasLowercase: /[a-z]/.test(pw),
    hasNumber: /\d/.test(pw),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
  };
}

function isPasswordValid(v: PasswordValidation): boolean {
  return v.minLength && v.hasUppercase && v.hasLowercase && v.hasNumber && v.hasSpecial;
}

function formatExpiryDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return 'Unknown';
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        fontSize: '12px',
        color: met ? 'var(--color-success-text)' : 'var(--color-text-muted)',
        transition: 'color 0.2s ease',
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        {met ? (
          <path d="M20 6L9 17l-5-5" />
        ) : (
          <circle cx="12" cy="12" r="8" strokeDasharray="4 3" />
        )}
      </svg>
      <span>{label}</span>
    </div>
  );
}

function StepIndicator({ step }: { step: InviteStep }) {
  const steps: { key: InviteStep; label: string }[] = [
    { key: 'welcome', label: 'Welcome' },
    { key: 'setup', label: 'Set Password' },
    { key: 'success', label: 'Done' },
  ];

  if (step === 'verifying' || step === 'error') return null;

  const currentIdx = step === 'activating'
    ? 2
    : steps.findIndex((s) => s.key === step);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
      }}
    >
      {steps.map((s, i) => {
        const isActive = i === currentIdx;
        const isCompleted = i < currentIdx;
        return (
          <React.Fragment key={s.key}>
            {i > 0 && (
              <div
                style={{
                  width: '32px',
                  height: '2px',
                  backgroundColor: isCompleted
                    ? 'var(--color-primary)'
                    : 'var(--color-border-default)',
                  borderRadius: '1px',
                  transition: 'background-color 0.3s ease',
                }}
              />
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: isActive
                    ? 'var(--color-primary)'
                    : isCompleted
                      ? 'var(--color-primary)'
                      : 'var(--color-surface-hover)',
                  color: isActive || isCompleted
                    ? '#fff'
                    : 'var(--color-text-muted)',
                  transition: 'all 0.3s ease',
                }}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-muted)',
                }}
              >
                {s.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const ClientInviteLandingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  // Step state
  const [step, setStep] = useState<InviteStep>('verifying');
  const [inviteData, setInviteData] = useState<BackendInvitationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'expired' | 'revoked' | 'accepted' | 'invalid' | 'network'>('invalid');

  // Password form
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordValidation = validatePassword(password);

  // ---------------------------------------------------------------------------
  // Step 1: Verify Token
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    if (!token.trim()) {
      setErrorMessage('No invitation token was provided. Please check the link from your invitation email.');
      setErrorType('invalid');
      setStep('error');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('No email address was provided in the invitation link. Please check the link from your invitation email.');
      setErrorType('invalid');
      setStep('error');
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyClientInvitation(token);

        if (!isMounted) return;

        if (result.success && result.data) {
          const data = result.data;
           if (data.status === 'expired') {
            setErrorMessage('This invitation has expired. Please contact your administrator for a new invitation.');
            setErrorType('expired');
            setInviteData(data);
            setStep('error');
            return;
          }
          if (data.status === 'revoked') {
            setErrorMessage('This invitation has been revoked by an administrator.');
            setErrorType('revoked');
            setInviteData(data);
            setStep('error');
            return;
          }
          if (data.status === 'accepted') {
            setErrorMessage('This invitation has already been accepted. You can sign in with your credentials.');
            setErrorType('accepted');
            setInviteData(data);
            setStep('error');
            return;
          }

          setInviteData(data);
          setStep('welcome');
        } else {
          setErrorMessage(result.message || 'Unable to verify invitation.');
          setErrorType('invalid');
          setStep('error');
        }
      } catch (err: unknown) {
        if (!isMounted) return;

        const apiErr = err as InviteApiError;
        if (apiErr.errorCode === 'NETWORK_ERROR') {
          // Fallback: try the local invitation service (Firebase) if the backend is unreachable
          try {
            const localInvitation = await invitationService.getInvitationByToken(token);
            if (!isMounted) return;

            if (localInvitation) {
              const mapped: BackendInvitationData = {
                invitationId: localInvitation.id,
                email: localInvitation.email,
                name: `${localInvitation.firstName} ${localInvitation.lastName}`.trim(),
                role: localInvitation.role,
                companyName: localInvitation.organizationName || 'Your Organization',
                organizationName: localInvitation.organizationName,
                invitedBy: localInvitation.invitedBy?.name || 'Administrator',
                status: localInvitation.status as BackendInvitationData['status'],
                expiresAt: localInvitation.expiresAt,
                createdAt: localInvitation.createdAt,
              };

              if (mapped.status === 'expired') {
                setErrorMessage('This invitation has expired. Please contact your administrator for a new invitation.');
                setErrorType('expired');
                setInviteData(mapped);
                setStep('error');
                return;
              }
              if (mapped.status === 'revoked') {
                setErrorMessage('This invitation has been revoked by an administrator.');
                setErrorType('revoked');
                setInviteData(mapped);
                setStep('error');
                return;
              }
              if (mapped.status === 'accepted') {
                setErrorMessage('This invitation has already been accepted.');
                setErrorType('accepted');
                setInviteData(mapped);
                setStep('error');
                return;
              }

              setInviteData(mapped);
              setStep('welcome');
              return;
            }
          } catch {
            // Fall through to generic error
          }
        }

        const message = apiErr.message || 'Unable to verify invitation. Please try again later.';
        setErrorMessage(message);
        setErrorType(apiErr.statusCode === 0 ? 'network' : 'invalid');
        setStep('error');
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token, email]);

  // ---------------------------------------------------------------------------
  // Step 3: Submit — Create Account & Accept Invitation
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);

      if (!isPasswordValid(passwordValidation)) {
        setFormError('Please meet all password requirements.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
      if (!inviteData) return;

      setIsSubmitting(true);
      setStep('activating');

      try {
        // 1. Create Firebase Auth account
        const session = await authService.signUpWithInvitation(inviteData.email, password);

        // 2. Activate the tenant ClientUser record via local invitation service
        try {
          await invitationService.acceptInvitation(token, session.user.id);
        } catch {
          // Non-blocking: the backend acceptance below is authoritative
        }

        // 3. Notify the backend API
        try {
          await acceptClientInvitation(token, inviteData.email, session.user.id);
        } catch {
          // Non-blocking: account is already created in Firebase
        }

        setStep('success');

        // 4. Auto-redirect to dashboard
        setTimeout(() => {
          navigate(ROUTE_PATHS.DASHBOARD, { replace: true });
        }, 2000);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Failed to complete account setup. Please try again.';
        setFormError(msg);
        setStep('setup');
        setIsSubmitting(false);
      }
    },
    [password, confirmPassword, passwordValidation, inviteData, token, navigate]
  );

  // ---------------------------------------------------------------------------
  // Render: Verifying
  // ---------------------------------------------------------------------------

  if (step === 'verifying') {
    return (
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-8) var(--space-4)',
          }}
        >
          <Spinner size="lg" />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              Verifying your invitation...
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
              Please wait while we validate your invitation link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Error States
  // ---------------------------------------------------------------------------

  if (step === 'error') {
    const errorVariant =
      errorType === 'expired' || errorType === 'revoked'
        ? 'warning'
        : errorType === 'accepted'
          ? 'info'
          : 'error';

    const errorIcon =
      errorType === 'expired'
        ? '⏰'
        : errorType === 'revoked'
          ? '🚫'
          : errorType === 'accepted'
            ? '✅'
            : errorType === 'network'
              ? '🌐'
              : '⚠️';

    return (
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ fontSize: '36px', marginBottom: 'var(--space-3)' }}>{errorIcon}</div>
          <h2
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {errorType === 'expired' && 'Invitation Expired'}
            {errorType === 'revoked' && 'Invitation Revoked'}
            {errorType === 'accepted' && 'Already Accepted'}
            {errorType === 'network' && 'Connection Error'}
            {errorType === 'invalid' && 'Invalid Invitation'}
          </h2>
        </div>

        <Alert variant={errorVariant}>{errorMessage}</Alert>

        {inviteData && (
          <div style={infoCardStyle}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              <strong>Email:</strong> {inviteData.email}
            </div>
            {inviteData.companyName && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                <strong>Organization:</strong> {inviteData.companyName}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          {errorType === 'accepted' ? (
            <Link to={ROUTE_PATHS.LOGIN} className="btn btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              Go to Sign In
            </Link>
          ) : errorType === 'network' ? (
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              style={{ width: '100%' }}
            >
              Try Again
            </Button>
          ) : (
            <Link to={ROUTE_PATHS.LOGIN} className="btn btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              Return to Sign In
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Activating (processing)
  // ---------------------------------------------------------------------------

  if (step === 'activating') {
    return (
      <div style={cardStyle}>
        <StepIndicator step={step} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-8) var(--space-4)',
          }}
        >
          <Spinner size="lg" />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              Setting up your account...
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
              Creating your credentials and activating your workspace access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Success
  // ---------------------------------------------------------------------------

  if (step === 'success') {
    return (
      <div style={cardStyle}>
        <StepIndicator step={step} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-6) var(--space-4)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-bg, #dcfce7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-success-text, #16a34a)"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <div>
            <h2
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-1)',
              }}
            >
              Welcome aboard! 🎉
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              Your account has been activated successfully.
            </p>
          </div>

          <Alert variant="success">
            Redirecting you to your dashboard...
          </Alert>

          {inviteData && (
            <div style={{ ...infoCardStyle, width: '100%' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                <strong>Organization:</strong> {inviteData.companyName}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                <strong>Email:</strong> {inviteData.email}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                <strong>Role:</strong>{' '}
                <Badge variant="primary">
                  {inviteData.role}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Welcome Screen (Step 1 — visible)
  // ---------------------------------------------------------------------------

  if (step === 'welcome') {
    return (
      <div style={cardStyle}>
        <StepIndicator step={step} />

        {/* Welcome Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              margin: '0 auto var(--space-3)',
              boxShadow: 'var(--elevation-2)',
            }}
          >
            {inviteData?.companyName?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <h2
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-1)',
            }}
          >
            You&apos;re Invited!
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {inviteData?.invitedBy || 'An administrator'} has invited you to join
          </p>
        </div>

        {/* Organization Info Card */}
        {inviteData && (
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                {inviteData.companyName}
              </span>
              <Badge variant="primary">{inviteData.role}</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <DetailRow icon="📧" label="Email" value={inviteData.email} />
              <DetailRow icon="👤" label="Name" value={inviteData.name} />
              <DetailRow icon="👋" label="Invited by" value={inviteData.invitedBy} />
              <DetailRow
                icon="📅"
                label="Expires"
                value={formatExpiryDate(inviteData.expiresAt)}
              />
              {inviteData.notes && (
                <div
                  style={{
                    marginTop: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-3)',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                  }}
                >
                  &ldquo;{inviteData.notes}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          variant="primary"
          onClick={() => setStep('setup')}
          style={{ width: '100%', minHeight: '44px' }}
        >
          Accept Invitation & Set Up Account
        </Button>

        <div
          style={{
            textAlign: 'center',
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-border-default)',
          }}
        >
          <Link
            to={ROUTE_PATHS.LOGIN}
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
            }}
          >
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Password Setup (Step 2)
  // ---------------------------------------------------------------------------

  return (
    <div style={cardStyle}>
      <StepIndicator step="setup" />

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-1)',
          }}
        >
          Create Your Password
        </h2>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Set a secure password for{' '}
          <strong style={{ color: 'var(--color-text-secondary)' }}>{inviteData?.email}</strong>{' '}
          to access the portal.
        </p>
      </div>

      {/* Account info */}
      {inviteData && (
        <div style={{ ...infoCardStyle, marginBottom: 'var(--space-4)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-1)',
            }}
          >
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {inviteData.companyName}
            </span>
            <Badge variant="primary">
              {inviteData.role}
            </Badge>
          </div>
        </div>
      )}

      {formError && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <Alert variant="error">{formError}</Alert>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        {/* Email (readonly) */}
        <Input
          id="invite-email"
          type="email"
          label="Email Address"
          value={inviteData?.email || email}
          disabled
          style={{ opacity: 0.7 }}
        />

        {/* Password */}
        <div style={{ position: 'relative' }}>
          <Input
            id="invite-password"
            type={showPassword ? 'text' : 'password'}
            label="Create Password"
            placeholder="Enter a secure password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (formError) setFormError(null);
            }}
            required
            autoFocus
            style={{ paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
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
              cursor: 'pointer',
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

        {/* Password Strength Requirements */}
        {password.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '2px',
              }}
            >
              Password Requirements
            </span>
            <PasswordRequirement met={passwordValidation.minLength} label="At least 8 characters" />
            <PasswordRequirement met={passwordValidation.hasUppercase} label="One uppercase letter (A-Z)" />
            <PasswordRequirement met={passwordValidation.hasLowercase} label="One lowercase letter (a-z)" />
            <PasswordRequirement met={passwordValidation.hasNumber} label="One number (0-9)" />
            <PasswordRequirement met={passwordValidation.hasSpecial} label="One special character (!@#$...)" />
          </div>
        )}

        {/* Confirm Password */}
        <Input
          id="invite-confirm-password"
          type="password"
          label="Confirm Password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (formError) setFormError(null);
          }}
          required
          error={
            confirmPassword.length > 0 && password !== confirmPassword
              ? 'Passwords do not match'
              : undefined
          }
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting || !isPasswordValid(passwordValidation) || password !== confirmPassword}
          style={{ width: '100%', minHeight: '44px', marginTop: 'var(--space-2)' }}
        >
          Complete Account Setup
        </Button>

        {/* Back button */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setStep('welcome');
            setFormError(null);
          }}
          disabled={isSubmitting}
          style={{ width: '100%' }}
        >
          ← Back to Invitation
        </Button>
      </form>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-secondary)',
      }}
    >
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <span style={{ color: 'var(--color-text-muted)', minWidth: '70px' }}>{label}:</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared Styles
// ---------------------------------------------------------------------------

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
  padding: 'var(--space-6)',
  backgroundColor: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border-default)',
  boxShadow: 'var(--shadow-md)',
};

const infoCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
  padding: 'var(--space-3)',
  backgroundColor: 'var(--color-surface-hover)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border-default)',
};
