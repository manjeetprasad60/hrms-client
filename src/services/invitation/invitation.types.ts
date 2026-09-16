import type { UserInvitation, CreateInvitationInput } from '../../types/invitation';
import type { ClientUser } from '../../types/auth';

export interface EmailDispatchResult {
  readonly delivered: boolean;
  readonly trackingId: string;
  readonly recipientEmail: string;
  readonly timestamp: string;
  readonly acceptUrl: string;
}

export interface EmailDeliveryService {
  /**
   * Dispatches or queues an invitation email through the trusted backend boundary.
   * Does not require or expose mail server credentials to client-side code.
   */
  dispatchInvitationEmail(invitation: UserInvitation, acceptUrl: string): Promise<EmailDispatchResult>;
}

export interface InvitationService {
  /**
   * Retrieves all invitations for the active client organization.
   * Evaluates and updates expired statuses dynamically.
   */
  listInvitations(): Promise<UserInvitation[]>;

  /**
   * Creates and dispatches a new client user invitation.
   * Does not create an active application user record.
   */
  createInvitation(input: CreateInvitationInput): Promise<UserInvitation>;

  /**
   * Re-sends an invitation, resetting its status to 'pending' and extending expiry.
   */
  resendInvitation(invitationId: string): Promise<UserInvitation>;

  /**
   * Revokes an existing invitation, preventing it from being accepted.
   */
  revokeInvitation(invitationId: string): Promise<UserInvitation>;

  /**
   * Resolves an invitation by its unique URL token.
   * Public endpoint supporting account onboarding.
   */
  getInvitationByToken(token: string): Promise<UserInvitation | null>;

  /**
   * Completes the account setup flow: activates the ClientUser record
   * and transitions the invitation status to 'accepted'.
   */
  acceptInvitation(token: string, authUid: string): Promise<{ user: ClientUser; invitation: UserInvitation }>;
}
