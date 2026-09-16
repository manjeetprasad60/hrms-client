/**
 * Firebase Authentication Error Mapping Utility
 *
 * Translates Firebase technical error codes into user-friendly, human-readable messages.
 * Prevents raw exception messages and internal SDK stack traces from leaking to the UI.
 */

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Invalid email or password. Please verify your credentials and try again.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please verify your password or reset it.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been deactivated. Please contact your organization administrator.',
  'auth/too-many-requests': 'Too many unsuccessful attempts. Access has been temporarily paused. Please reset your password or try again later.',
  'auth/network-request-failed': 'Unable to connect to the authentication server. Please verify your network connection.',
  'auth/email-already-in-use': 'An account with this email address already exists.',
  'auth/weak-password': 'Password is too weak. It must be at least 6 characters.',
  'auth/operation-not-allowed': 'Email/password sign-in is not enabled for this project. Please contact system support.',
  'auth/popup-closed-by-user': 'Authentication window closed before completing.',
  'auth/requires-recent-login': 'This operation requires recent authentication. Please sign in again.',
  'auth/unconfigured': 'Firebase Authentication is not configured. Please set your credentials in .env.local.',
};

const DEFAULT_AUTH_ERROR_MESSAGE = 'Authentication could not be completed. Please try again or contact support.';

/**
 * Maps an unknown Firebase error object to a clean user-facing error message.
 */
export function mapFirebaseErrorToMessage(error: unknown): string {
  if (!error) {
    return DEFAULT_AUTH_ERROR_MESSAGE;
  }

  // Handle FirebaseError or custom error object with .code property
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code: unknown }).code);
    const mapped = AUTH_ERROR_MESSAGES[code];
    if (mapped) {
      return mapped;
    }
  }

  // Handle standard Error instances with a message
  if (error instanceof Error && error.message) {
    // If the message itself matches a code pattern
    for (const [code, msg] of Object.entries(AUTH_ERROR_MESSAGES)) {
      if (error.message.includes(code)) {
        return msg;
      }
    }
  }

  return DEFAULT_AUTH_ERROR_MESSAGE;
}

/**
 * Result of handling a password reset request error.
 * Prevents account enumeration by treating 'user-not-found' as a success-masked response.
 */
export interface PasswordResetResult {
  readonly isSuccessMasked: boolean;
  readonly message: string;
}

/**
 * Maps password reset errors to privacy-safe user messages.
 * In compliance with OWASP guidelines, 'user-not-found' returns a neutral success-masked message
 * so attackers cannot enumerate valid employee email addresses.
 */
export function mapPasswordResetError(error: unknown): PasswordResetResult {
  if (!error) {
    return {
      isSuccessMasked: true,
      message: 'If an account is associated with this email address, password reset instructions have been sent.',
    };
  }

  let code = '';
  if (typeof error === 'object' && error !== null && 'code' in error) {
    code = String((error as { code: unknown }).code);
  } else if (error instanceof Error && error.message) {
    for (const key of Object.keys(AUTH_ERROR_MESSAGES)) {
      if (error.message.includes(key)) {
        code = key;
        break;
      }
    }
  }

  // Anti-enumeration protection: never reveal that an email does not exist
  if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
    return {
      isSuccessMasked: true,
      message: 'If an account is associated with this email address, password reset instructions have been sent.',
    };
  }

  if (code === 'auth/invalid-email') {
    return {
      isSuccessMasked: false,
      message: 'Please enter a valid work email address format.',
    };
  }

  if (code === 'auth/too-many-requests') {
    return {
      isSuccessMasked: false,
      message: 'Too many reset attempts. Please wait a few moments before requesting another link.',
    };
  }

  if (code === 'auth/network-request-failed') {
    return {
      isSuccessMasked: false,
      message: 'Unable to reach the authentication server. Please check your network connection.',
    };
  }

  if (code === 'auth/unconfigured') {
    return {
      isSuccessMasked: false,
      message: 'Authentication service is not configured. Please contact your system administrator.',
    };
  }

  return {
    isSuccessMasked: false,
    message: 'Unable to process your password reset request. Please try again later or contact support.',
  };
}

