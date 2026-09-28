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
import { authService } from '../auth/authService';

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
  readonly clientId?: string;
  readonly phone?: string;
  readonly phoneNumber?: string;
  readonly photoURL?: string;
  readonly avatarUrl?: string;
  readonly departmentIds?: readonly string[];
  readonly locationIds?: readonly string[];
  readonly employeeId?: string;
  readonly customPermissions?: readonly string[];
}

export interface VerifyInvitationResponse {
  readonly success: boolean;
  readonly message: string;
  readonly data: BackendInvitationData | null;
}

export interface AcceptInvitationResponse {
  readonly success: boolean;
  readonly message: string;
  readonly companyId?: string;
  readonly clientId?: string;
  readonly data?: {
    readonly companyId?: string;
    readonly clientId?: string;
    readonly userId?: string;
    readonly redirectUrl?: string;
    readonly organization?: {
      readonly name?: string;
      readonly slug?: string;
    };
    readonly [key: string]: unknown;
  };
}

export interface CreateAuthUserPayload {
  readonly authUid: string;
  readonly organizationId: string;
  readonly organization: {
    readonly name: string;
    readonly slug: string;
  };
  readonly clientId: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName: string;
  readonly phone?: string;
  readonly phoneNumber?: string;
  readonly photoURL?: string;
  readonly avatarUrl?: string;
  readonly role: string;
  readonly roleId: string;
  readonly roleIds: readonly string[];
  readonly customPermissions: readonly string[];
  readonly departmentIds: readonly string[];
  readonly locationIds: readonly string[];
  readonly employeeId?: string;
  readonly isEmailVerified: boolean;
  readonly status: string;
}

export interface CreateAuthUserResponse {
  readonly success?: boolean;
  readonly message?: string;
  readonly data?: unknown;
  readonly [key: string]: unknown;
}

/**
 * Builds the payload for POST /api/auth/user following invitation acceptance.
 */
export function buildCreateAuthUserPayload(params: {
  authUid: string;
  companyId: string;
  invitation: {
    readonly email?: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly name?: string;
    readonly role?: string;
    readonly roleId?: string;
    readonly roleIds?: readonly string[];
    readonly customPermissions?: readonly string[];
    readonly departmentIds?: readonly string[];
    readonly locationIds?: readonly string[];
    readonly phone?: string;
    readonly phoneNumber?: string;
    readonly photoURL?: string;
    readonly avatarUrl?: string;
    readonly employeeId?: string;
    readonly clientId?: string;
    readonly organizationName?: string;
    readonly companyName?: string;
  };
  organizationName?: string;
  organizationSlug?: string;
  clientId?: string;
}): CreateAuthUserPayload {
  const inv = params.invitation;
  const orgName =
    params.organizationName ||
    inv.organizationName ||
    inv.companyName ||
    'ABC Corporation';

  const orgSlug =
    params.organizationSlug ||
    orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
    'abc-corporation';

  const [firstNameFromInv, ...rest] = (inv.name || '').trim().split(/\s+/);
  const lastNameFromInv = rest.join(' ');

  const firstName = inv.firstName || firstNameFromInv || 'John';
  const lastName = inv.lastName || lastNameFromInv || 'Doe';
  const displayName =
    `${firstName} ${lastName}`.trim() ||
    inv.name ||
    inv.email ||
    'User';

  const role = inv.role || 'org_admin';
  const roleId = inv.roleId || role;
  const roleIds = inv.roleIds && inv.roleIds.length > 0 ? inv.roleIds : [role];

  const phone = inv.phone || inv.phoneNumber || '';
  const phoneNumber = inv.phoneNumber || inv.phone || '';
  const photoURL = inv.photoURL || inv.avatarUrl || '';
  const avatarUrl = inv.avatarUrl || inv.photoURL || '';

  return {
    authUid: params.authUid,
    organizationId: params.companyId,
    organization: {
      name: orgName,
      slug: orgSlug,
    },
    clientId: params.clientId || inv.clientId || params.companyId,
    email: inv.email || '',
    firstName,
    lastName,
    displayName,
    phone,
    phoneNumber,
    photoURL,
    avatarUrl,
    role,
    roleId,
    roleIds,
    customPermissions: inv.customPermissions || [],
    departmentIds: inv.departmentIds || [],
    locationIds: inv.locationIds || [],
    employeeId: inv.employeeId || '',
    isEmailVerified: true,
    status: 'active',
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

/**
 * Creates / registers the user record in the backend API after invitation acceptance.
 * POST /api/auth/user
 */
export async function createAuthUser(
  payload: CreateAuthUserPayload,
  authToken?: string
): Promise<CreateAuthUserResponse> {
  const baseUrl = env.apiBaseUrl.replace(/\/+$/, '');
  const url = `${baseUrl}/auth/user`;

  let token = authToken;
  if (!token) {
    const fbUser = authService.getCurrentFirebaseUser();
    if (fbUser) {
      try {
        token = await fbUser.getIdToken();
      } catch {
        // Non-blocking
      }
    }
    if (!token) {
      token = authService.getCurrentSession()?.token;
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    let body: unknown = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    if (!response.ok) {
      const errObj = body as { message?: string; errorCode?: string } | undefined;
      throw new InviteApiError(
        errObj?.message || `User creation failed (${response.status})`,
        response.status,
        errObj?.errorCode
      );
    }

    return (body || {}) as CreateAuthUserResponse;
  } catch (err) {
    if (err instanceof InviteApiError) throw err;

    throw new InviteApiError(
      err instanceof Error
        ? err.message
        : 'Unable to create user profile in backend. Please try again.',
      0,
      'NETWORK_ERROR'
    );
  }
}

