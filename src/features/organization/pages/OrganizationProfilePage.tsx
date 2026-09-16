import React, { useState, useCallback, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { PageContainer } from '../../../layouts/PageContainer';
import { AppLoading } from '../../../components/feedback/Loading/AppLoading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useToast } from '../../../components/feedback/ToastContext';
import { useClient } from '../../../routes/ClientContext';
import { useClientDataService } from '../../../services/client/useClientService';
import { usePermission } from '../../../permissions/usePermission';
import { PERMISSIONS } from '../../../permissions/permissions';
import { ROUTE_PATHS } from '../../../routes/routePaths';
import { OrganizationProfileForm } from '../components/OrganizationProfileForm';
import { UnsavedChangesModal } from '../components/UnsavedChangesModal';
import type { UpdateOrganizationProfileInput } from '../../../types/organization';

export const OrganizationProfilePage: React.FC = () => {
  const { organization, isClientLoading, clientError, refreshClient } = useClient();
  const { updateClient } = useClientDataService();
  const { can } = usePermission();
  const toast = useToast();

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Permission evaluation:
  // View requires organization.view or organization.manage
  // Edit requires organization.edit or organization.manage
  const canEdit = can(PERMISSIONS.ORGANIZATION_EDIT) || can(PERMISSIONS.ORGANIZATION_MANAGE);

  // 1. React Router In-App Navigation Blocker
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // 2. Browser Tab / Window Unload Guard
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const handleSave = async (payload: UpdateOrganizationProfileInput) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateClient(payload);
      await refreshClient();
      setIsDirty(false);
      setSaveSuccess(true);
      toast.success('Organization profile updated successfully.', 'Changes Saved');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to save organization profile changes. Please try again.';
      setSaveError(errorMessage);
      toast.error(errorMessage, 'Update Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearFeedback = useCallback(() => {
    setSaveError(null);
    setSaveSuccess(false);
  }, []);

  // Loading state
  if (isClientLoading && !organization) {
    return <AppLoading message="Loading organization profile..." />;
  }

  // Error state / Missing organization
  if (!organization) {
    return (
      <PageContainer
        title="Organization Profile"
        description="View and manage company identity and operational configuration."
        breadcrumbs={[
          { label: 'Settings', path: ROUTE_PATHS.SETTINGS },
          { label: 'Organization Profile' },
        ]}
      >
        <ErrorState
          variant="generic"
          title="Organization Record Not Found"
          message={clientError || 'The requested organization profile could not be loaded from your authorized tenant workspace.'}
          onRetry={() => { void refreshClient(); }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Organization Profile"
      description="View and manage your company identity, localization settings, and corporate contact details."
      breadcrumbs={[
        { label: 'Settings', path: ROUTE_PATHS.SETTINGS },
        { label: 'Organization Profile' },
      ]}
    >
      <OrganizationProfileForm
        key={`${organization.id}-${organization.updatedAt}`}
        organization={organization}
        canEdit={canEdit}
        isSaving={isSaving}
        saveError={saveError}
        saveSuccess={saveSuccess}
        onSave={handleSave}
        onDirtyChange={setIsDirty}
        onClearFeedback={handleClearFeedback}
      />

      {/* Unsaved Changes Blocker Modal */}
      <UnsavedChangesModal
        isOpen={blocker.state === 'blocked'}
        onConfirmLeave={() => {
          setIsDirty(false);
          blocker.proceed?.();
        }}
        onCancelStay={() => {
          blocker.reset?.();
        }}
      />
    </PageContainer>
  );
};
