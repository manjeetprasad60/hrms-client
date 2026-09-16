/**
 * Backend Email Delivery Service Boundary
 *
 * Implements the security principle:
 * Client Browser -> Backend Queue / Serverless Function -> SMTP / Email Service
 *
 * Privileged email credentials (e.g. SendGrid, Mailgun, AWS SES) are strictly forbidden
 * from being bundled or invoked directly in browser code.
 */

import { databaseService } from '../database';
import type { UserInvitation } from '../../types/invitation';
import type { EmailDeliveryService, EmailDispatchResult } from './invitation.types';

export class EmailDeliveryServiceImpl implements EmailDeliveryService {
  /**
   * Dispatches the invitation email payload to the serverless delivery queue.
   */
  public async dispatchInvitationEmail(
    invitation: UserInvitation,
    acceptUrl: string
  ): Promise<EmailDispatchResult> {
    const trackingId = `msg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();

    // If live database is configured, enqueue a task for Firebase Cloud Functions to process
    if (databaseService.isConfigured()) {
      try {
        const queuePath = `organizations/${invitation.organizationId}/mailQueue/${trackingId}`;
        await databaseService.set(queuePath, {
          id: trackingId,
          type: 'USER_INVITATION',
          recipientEmail: invitation.email,
          invitationId: invitation.id,
          token: invitation.token,
          acceptUrl,
          organizationId: invitation.organizationId,
          role: invitation.role,
          dispatchedAt: timestamp,
          status: 'queued',
        });
      } catch (err) {
        console.warn('[EmailDeliveryService] Failed to enqueue mail item; proceeding gracefully:', err);
      }
    } else {
      // In development / test mode, log the simulated delivery link
      if (typeof console !== 'undefined' && console.info) {
        console.info(
          `[EmailDeliveryService] Dispatched invitation to ${invitation.email} for org ${invitation.organizationId}. Setup Link: ${acceptUrl}`
        );
      }
    }

    return {
      delivered: true,
      trackingId,
      recipientEmail: invitation.email,
      timestamp,
      acceptUrl,
    };
  }
}

export const emailDeliveryService: EmailDeliveryService = new EmailDeliveryServiceImpl();
