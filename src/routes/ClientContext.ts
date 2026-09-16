import { createContext, useContext } from 'react';
import type { ClientContextValue } from '../types/client';

export const ClientContext = createContext<ClientContextValue | undefined>(undefined);

/**
 * Primary React Hook to access the authenticated Client Context.
 *
 * Provides reactive access to:
 * - firebaseUser (authenticated Firebase Auth user)
 * - clientUser (full tenant-scoped ClientUser record)
 * - organization (ClientOrganization profile)
 * - organizationId (string | null)
 * - role (ClientRole | null)
 * - permissions (readonly PermissionKey[])
 * - isClientLoading (boolean)
 * - clientError (string | null)
 * - hasClient (boolean)
 * - isSuspended (boolean)
 * - can("employees.view") & cannot("payroll.process")
 * - refreshClient()
 */
export function useClient(): ClientContextValue {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}

/**
 * Alias for useClient for backward compatibility with tenant-scoped components.
 */
export const useTenant = useClient;
