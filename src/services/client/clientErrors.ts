/**
 * Typed Client Service Errors
 *
 * Provides domain-specific error classes for client-scoped operations.
 * Handles permission denials, missing entities, network errors, and unconfigured Firebase states.
 */

import type { ClientServiceErrorCode } from './client.types';

export class ClientServiceError extends Error {
  public readonly code: ClientServiceErrorCode;
  public readonly tenantId: string | null;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: ClientServiceErrorCode,
    tenantId: string | null = null,
    details?: unknown
  ) {
    super(message);
    this.name = 'ClientServiceError';
    this.code = code;
    this.tenantId = tenantId;
    this.details = details;

    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ClientPermissionDeniedError extends ClientServiceError {
  constructor(
    message: string = 'Access denied: You do not have permission to access or modify this client resource.',
    tenantId: string | null = null,
    details?: unknown
  ) {
    super(message, 'client/permission-denied', tenantId, details);
    this.name = 'ClientPermissionDeniedError';
  }
}

export class ClientNotFoundError extends ClientServiceError {
  constructor(
    message: string = 'The requested client resource was not found.',
    tenantId: string | null = null,
    details?: unknown
  ) {
    super(message, 'client/not-found', tenantId, details);
    this.name = 'ClientNotFoundError';
  }
}

export class ClientNetworkError extends ClientServiceError {
  constructor(
    message: string = 'Network connectivity failure while executing client operation.',
    tenantId: string | null = null,
    details?: unknown
  ) {
    super(message, 'client/network-error', tenantId, details);
    this.name = 'ClientNetworkError';
  }
}

export class ClientUnavailableError extends ClientServiceError {
  constructor(
    message: string = 'Firebase backend service is unavailable or unconfigured.',
    tenantId: string | null = null,
    details?: unknown
  ) {
    super(message, 'client/unavailable', tenantId, details);
    this.name = 'ClientUnavailableError';
  }
}

export class ClientInvalidDataError extends ClientServiceError {
  constructor(
    message: string = 'Invalid or malformed data provided for client operation.',
    tenantId: string | null = null,
    details?: unknown
  ) {
    super(message, 'client/invalid-data', tenantId, details);
    this.name = 'ClientInvalidDataError';
  }
}

export class ClientUnauthorizedError extends ClientServiceError {
  constructor(
    message: string = 'No authenticated, authorized client context available. Operation rejected.',
    tenantId: string | null = null,
    details?: unknown
  ) {
    super(message, 'client/unauthorized', tenantId, details);
    this.name = 'ClientUnauthorizedError';
  }
}

/**
 * Maps arbitrary or Firebase errors to consistent ClientServiceError instances.
 */
export function mapToClientServiceError(
  error: unknown,
  defaultTenantId: string | null = null
): ClientServiceError {
  if (error instanceof ClientServiceError) {
    return error;
  }

  const errObj = error as { code?: string; message?: string };
  const code = errObj?.code ?? '';
  const message = errObj?.message ?? (error instanceof Error ? error.message : 'Unknown client error');

  if (code.includes('permission-denied') || code.includes('unauthorized')) {
    return new ClientPermissionDeniedError(message, defaultTenantId, error);
  }

  if (code.includes('not-found')) {
    return new ClientNotFoundError(message, defaultTenantId, error);
  }

  if (code.includes('network') || code.includes('timeout') || code.includes('unavailable')) {
    return new ClientNetworkError(message, defaultTenantId, error);
  }

  if (code.includes('invalid') || code.includes('bad-request')) {
    return new ClientInvalidDataError(message, defaultTenantId, error);
  }

  return new ClientServiceError(message, 'client/invalid-data', defaultTenantId, error);
}
