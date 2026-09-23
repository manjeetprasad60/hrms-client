/**
 * Client Invitation Backend API Service
 *
 * Communicates with the backend invitation API (e.g. localhost:5001)
 * to verify and accept client invitations.
 *
 * Endpoints consumed:
 *   GET  /api/invitations/verify/:token
 *   POST /api/invitations/accept
 */

import { env } from '../../config/env';

// ---------------------------------------------------------------------------
// Response Types
// ---------------------------------------------------------------------------

export interface BackendInvitationData {
  readonly invitationId: string;
  readonly email: string;
  readonly name: string;
  readonly role: string;
  readonly companyName: string;
  readonly organizationName?: string;
  readonly invitedBy: string;
  readonly notes?: string;
  readonly status: 'pending' | 'accepted' | 'expired' | 'revoked';
  readonly expiresAt: string;
  readonly createdAt?: string;
}

export interface VerifyInvitationResponse {
  readonly success: boolean;
  readonly message: string;
  readonly data: BackendInvitationData | null;
}

export interface AcceptInvitationResponse {
  readonly success: boolean;
  readonly message: string;
  readonly data?: {
    readonly userId?: string;
    readonly redirectUrl?: string;
  };
}

// ---------------------------------------------------------------------------
// Error Mapping
// ---------------------------------------------------------------------------

export class InviteApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.name = 'InviteApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

function getBaseUrl(): string {
  return env.invitationApiUrl.replace(/\/+$/, '');
}

// ---------------------------------------------------------------------------
// Service Implementation
// ---------------------------------------------------------------------------

/**
 * Verifies an invitation token with the backend.
 * Returns the invitation details if valid.
 */
export async function verifyClientInvitation(
  token: string
): Promise<VerifyInvitationResponse> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/invitations/verify/${encodeURIComponent(token)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const body = await response.json();

    if (!response.ok) {
      throw new InviteApiError(
        body?.message || `Invitation verification failed (${response.status})`,
        response.status,
        body?.errorCode
      );
    }

    return body as VerifyInvitationResponse;
  } catch (err) {
    if (err instanceof InviteApiError) throw err;

    // Network / parse errors
    throw new InviteApiError(
      err instanceof Error
        ? err.message
        : 'Unable to connect to the invitation service. Please try again.',
      0,
      'NETWORK_ERROR'
    );
  }
}

/**
 * Notifies the backend that the invitation has been accepted and the
 * user account has been provisioned.
 */
export async function acceptClientInvitation(
  token: string,
  email: string,
  firebaseUid: string
): Promise<AcceptInvitationResponse> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/invitations/accept`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        email,
        firebaseUid,
      }),
    });

    const body = await response.json();

    if (!response.ok) {
      throw new InviteApiError(
        body?.message || `Invitation acceptance failed (${response.status})`,
        response.status,
        body?.errorCode
      );
    }

    return body as AcceptInvitationResponse;
  } catch (err) {
    if (err instanceof InviteApiError) throw err;

    throw new InviteApiError(
      err instanceof Error
        ? err.message
        : 'Unable to complete invitation acceptance. Please try again.',
      0,
      'NETWORK_ERROR'
    );
  }
}
