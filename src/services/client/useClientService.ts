/**
 * React Hook for Client-Aware Data Access
 *
 * Provides components and feature hooks direct access to client-scoped Firebase operations
 * without having to pass or manage tenant IDs manually.
 */

import { useMemo } from 'react';
import { useClient } from '../../routes/ClientContext';
import { clientDataService } from './clientDataService';
import type { ClientDataService } from './client.types';

export interface UseClientDataServiceResult extends ClientDataService {
  readonly isReady: boolean;
  readonly activeOrganizationId: string | null;
}

export function useClientDataService(): UseClientDataServiceResult {
  const { organizationId, hasClient } = useClient();

  return useMemo(() => {
    return {
      isReady: hasClient && Boolean(organizationId),
      activeOrganizationId: organizationId,
      setTrustedContext: clientDataService.setTrustedContext.bind(clientDataService),
      getTrustedContext: clientDataService.getTrustedContext.bind(clientDataService),
      clearTrustedContext: clientDataService.clearTrustedContext.bind(clientDataService),
      hasTrustedContext: clientDataService.hasTrustedContext.bind(clientDataService),
      getClient: clientDataService.getClient.bind(clientDataService),
      updateClient: clientDataService.updateClient.bind(clientDataService),
      getClientUser: clientDataService.getClientUser.bind(clientDataService),
      listClientUsers: clientDataService.listClientUsers.bind(clientDataService),
      createClientUser: clientDataService.createClientUser.bind(clientDataService),
      updateClientUser: clientDataService.updateClientUser.bind(clientDataService),
      setClientUserStatus: clientDataService.setClientUserStatus.bind(clientDataService),
      getClientSettings: clientDataService.getClientSettings.bind(clientDataService),
      updateClientSettings: clientDataService.updateClientSettings.bind(clientDataService),
      get: clientDataService.get.bind(clientDataService),
      set: clientDataService.set.bind(clientDataService),
      update: clientDataService.update.bind(clientDataService),
      remove: clientDataService.remove.bind(clientDataService),
      push: clientDataService.push.bind(clientDataService),
      subscribe: clientDataService.subscribe.bind(clientDataService),
      uploadClientFile: clientDataService.uploadClientFile.bind(clientDataService),
      deleteClientFile: clientDataService.deleteClientFile.bind(clientDataService),
      buildClientPath: clientDataService.buildClientPath.bind(clientDataService),
      isConfigured: clientDataService.isConfigured.bind(clientDataService),
    };
  }, [organizationId, hasClient]);
}
