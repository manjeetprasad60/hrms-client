import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { ROUTE_PATHS } from '../../../routes/routePaths';
import { invitationService } from '../../../services/invitation/invitationService';
import { authService } from '../../../services/auth/authService';
import { USER_INVITATION_STATUS, type UserInvitation } from '../../../types/invitation';
import { formatRoleLabel } from '../../../utils/formatters';

export const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [invitation, setInvitation] = useState<UserInvitation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Setup Form State
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [setupSuccess, setSetupSuccess] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    if (!token.trim()) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setResolveError('No invitation token was provided. Please verify the link in your invitation email.');
        setIsLoading(false);
      });
      return;
    }
    invitationService
      .getInvitationByToken(token)
      .then((inv) => {
        if (!isMounted) return;
        if (!inv) {
          setResolveError('The invitation link is invalid or does not exist.');
        } else {
          setInvitation(inv);
        }
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Unable to verify invitation link.';
        setResolveError(msg);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!password) {
      setFormError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (!invitation) return;

    setIsSubmitting(true);
    try {
      // 1. Create authenticated credentials in Firebase Auth
      const session = await authService.signUpWithInvitation(invitation.email, password);

      // 2. Activate the tenant ClientUser record and transition invitation to accepted
      await invitationService.acceptInvitation(token, session.user.id);

      setSetupSuccess(true);
      // Auto-navigate to dashboard after brief confirmation
      setTimeout(() => {
        navigate(ROUTE_PATHS.DASHBOARD, { replace: true });
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete account setup. Please try again.';
      setFormError(msg);
      setIsSubmitting(false);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-12) var(--space-4)',
          gap: 'var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <Spinner size="lg" />
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Verifying your invitation link...
        </p>
      </div>
    );
  }

  // 2. Invalid Token Error State
  if (resolveError || !invitation) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <Alert variant="error">
          {resolveError || 'Invalid or unrecognized invitation token.'}
        </Alert>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          If you believe this is an error, please ask your administrator to send you a new invitation link.
        </p>
        <Link to={ROUTE_PATHS.LOGIN} className="btn btn-secondary" style={{ textAlign: 'center' }}>
          Return to Sign In
        </Link>
      </div>
    );
  }

  // 3. Revoked Invitation State
  if (invitation.status === USER_INVITATION_STATUS.REVOKED) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <Alert variant="warning">
          This invitation has been revoked.
        </Alert>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          An administrator has revoked this invitation link. Access cannot be granted with this link.
        </p>
        <Link to={ROUTE_PATHS.LOGIN} className="btn btn-secondary" style={{ textAlign: 'center' }}>
          Return to Sign In
        </Link>
      </div>
    );
  }

  // 4. Expired Invitation State
  if (invitation.status === USER_INVITATION_STATUS.EXPIRED) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <Alert variant="warning">
          This invitation has expired.
        </Alert>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Invitations are valid for 7 days. Please reach out to your HR administrator to request a fresh invitation link.
        </p>
        <Link to={ROUTE_PATHS.LOGIN} className="btn btn-secondary" style={{ textAlign: 'center' }}>
          Return to Sign In
        </Link>
      </div>
    );
  }

  // 5. Already Accepted Invitation State
  if (invitation.status === USER_INVITATION_STATUS.ACCEPTED) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <Alert variant="info">
          This invitation has already been accepted.
        </Alert>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Your account for <strong>{invitation.email}</strong> is already configured. Please sign in with your credentials.
        </p>
        <Link to={ROUTE_PATHS.LOGIN} className="btn btn-primary" style={{ textAlign: 'center' }}>
          Go to Sign In
        </Link>
      </div>
    );
  }

  // 6. Active / Pending Account Setup Form
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        padding: 'var(--space-6)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Invitation Overview Card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-surface-hover)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Organization Invitation
          </span>
          <Badge variant="primary">
            {formatRoleLabel(invitation.role)}
          </Badge>
        </div>
        <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {invitation.firstName} {invitation.lastName}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          {invitation.email}
        </div>
      </div>

      {setupSuccess ? (
        <Alert variant="success">
          Account setup complete! Redirecting to your dashboard...
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {formError && (
            <Alert variant="error">
              {formError}
            </Alert>
          )}

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Create a secure password to activate your account and access the portal.
          </p>

          <Input
            id="setup-password"
            type="password"
            label="Create Password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />

          <Input
            id="setup-confirm-password"
            type="password"
            label="Confirm Password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            Complete Account Setup
          </Button>
        </form>
      )}

      <div style={{ textAlign: 'center', borderTop: '1px solid var(--color-border-default)', paddingTop: 'var(--space-4)' }}>
        <Link to={ROUTE_PATHS.LOGIN} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
};
