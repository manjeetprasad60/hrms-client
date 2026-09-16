/**
 * Client User Invitation Model & Lifecycle
 *
 * Defines the state machine and data transfer objects for organization invitations.
 * Decouples the invitation record from active application access.
 *
 * Flow:
 * Admin Invites -> Invitation Record ('pending') -> User Receives Link ->
 * User Sets Password -> Firebase Auth Account Created -> ClientUser Activated ('active')
 */

import type { ClientRole } from '../permissions/roles';

export type UserInvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export const USER_INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
} as const;

export interface InvitationInviter {
  readonly uid: string;
  readonly email?: string;
  readonly name?: string;
}

export interface UserInvitation {
  /**
   * Unique invitation record identifier in the tenant tree:
   * organizations/{organizationId}/invitations/{invitationId}
   */
  readonly id: string;

  /**
   * Tenant boundary identifier.
   */
  readonly organizationId: string;

  /**
   * Cached organization name for presentation on public accept screen.
   */
  readonly organizationName?: string;

  /**
   * Corporate email address of the invited user.
   */
  readonly email: string;

  readonly firstName: string;
  readonly lastName: string;

  /**
   * Organizational role to be assigned upon activation.
   */
  readonly role: ClientRole;

  readonly roleIds?: readonly string[];
  readonly departmentIds?: readonly string[];
  readonly locationIds?: readonly string[];
  readonly customPermissions?: readonly string[];
  readonly phone?: string;
  readonly employeeId?: string;

  /**
   * Metadata of the administrative user who dispatched this invitation.
   */
  readonly invitedBy: InvitationInviter;

  /**
   * Current lifecycle state of the invitation.
   */
  readonly status: UserInvitationStatus;

  /**
   * Secure, opaque URL token used to verify and redeem the invitation.
   */
  readonly token: string;

  /**
   * ISO 8601 timestamp after which this invitation can no longer be redeemed.
   */
  readonly expiresAt: string;

  /**
   * ISO 8601 timestamp when account setup was completed.
   */
  readonly acceptedAt?: string;

  /**
   * ISO 8601 timestamp when an administrator revoked this invitation.
   */
  readonly revokedAt?: string;

  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateInvitationInput {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: ClientRole;
  readonly phone?: string;
  readonly employeeId?: string;
  readonly departmentIds?: readonly string[];
  readonly locationIds?: readonly string[];
  readonly customPermissions?: readonly string[];
}

export interface AcceptInvitationInput {
  readonly token: string;
  readonly password: string;
}

/**
 * Status evaluation helper functions
 */
export function isInvitationPending(invitation: UserInvitation | null | undefined): boolean {
  if (!invitation) return false;
  if (invitation.status !== USER_INVITATION_STATUS.PENDING) return false;
  // Automatically consider expired if past expiresAt
  const expiresMs = new Date(invitation.expiresAt).getTime();
  return Date.now() < expiresMs;
}

export function isInvitationExpired(invitation: UserInvitation | null | undefined): boolean {
  if (!invitation) return false;
  if (invitation.status === USER_INVITATION_STATUS.EXPIRED) return true;
  if (invitation.status === USER_INVITATION_STATUS.REVOKED) return false;
  if (invitation.status === USER_INVITATION_STATUS.ACCEPTED) return false;
  const expiresMs = new Date(invitation.expiresAt).getTime();
  return Date.now() >= expiresMs;
}

export function isInvitationRevoked(invitation: UserInvitation | null | undefined): boolean {
  return invitation?.status === USER_INVITATION_STATUS.REVOKED;
}

export function isInvitationAccepted(invitation: UserInvitation | null | undefined): boolean {
  return invitation?.status === USER_INVITATION_STATUS.ACCEPTED;
}
