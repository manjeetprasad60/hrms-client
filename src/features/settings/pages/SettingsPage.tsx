import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useBlocker } from 'react-router-dom';
import { PageContainer } from '../../../layouts/PageContainer';
import { AppLoading } from '../../../components/feedback/Loading/AppLoading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { PermissionDenied } from '../../../components/feedback/PermissionDenied';
import { useToast } from '../../../components/feedback/ToastContext';
import { useClient } from '../../../routes/ClientContext';
import { useClientDataService } from '../../../services/client/useClientService';
import { usePermission } from '../../../permissions/usePermission';
import { PERMISSIONS } from '../../../permissions/permissions';
import { ROUTE_PATHS } from '../../../routes/routePaths';
import { SETTINGS_CATEGORIES, type SettingsCategoryId } from '../types';
import { SettingsLayout } from '../components/SettingsLayout';
import { SettingsOverviewGrid } from '../components/SettingsOverviewGrid';
import { LocalizationSettingsForm } from '../components/LocalizationSettingsForm';
import { BrandingSettingsForm } from '../components/BrandingSettingsForm';
import { UpcomingCategoryCard } from '../components/UpcomingCategoryCard';
import { UnsavedChangesModal } from '../../organization/components/UnsavedChangesModal';
import type { ClientSettings, LocalizationSettings, BrandingSettings } from '../../../types/settings';

export const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { organization, refreshClient } = useClient();
  const { getClientSettings, updateClientSettings } = useClientDataService();
  const { can, canAny, role } = usePermission();
  const toast = useToast();

  const canEdit = can(PERMISSIONS.SETTINGS_MANAGE);

  const rawCat = searchParams.get('category') as SettingsCategoryId | null;
  const activeCategory: SettingsCategoryId =
    rawCat && SETTINGS_CATEGORIES.some((c) => c.id === rawCat) ? rawCat : 'overview';

  const [settings, setSettings] = useState<ClientSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // 1. In-App Navigation Blocker
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // 2. Browser Tab/Window Unload Guard
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

  const loadSettings = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    getClientSettings()
      .then((data) => {
        setSettings(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Failed to load organization settings.');
        setIsLoading(false);
      });
  }, [getClientSettings]);

  useEffect(() => {
    let isMounted = true;
    getClientSettings()
      .then((data) => {
        if (isMounted) {
          setSettings(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load organization settings.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [getClientSettings]);

  const handleSelectCategory = (catId: SettingsCategoryId) => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Discard changes and switch category?'
      );
      if (!confirmDiscard) return;
      setIsDirty(false);
    }
    setSearchParams({ category: catId });
  };

  const handleSaveLocalization = async (updates: Partial<LocalizationSettings>) => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const updatedLocalization: LocalizationSettings = {
        ...settings.localization,
        ...updates,
      };
      await updateClientSettings({ localization: updatedLocalization });
      setSettings((prev) => (prev ? { ...prev, localization: updatedLocalization } : null));
      setIsDirty(false);
      await refreshClient();
      toast.success('Localization preferences updated successfully.', 'Settings Saved');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save localization settings.';
      toast.error(msg, 'Save Error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBranding = async (updates: BrandingSettings) => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateClientSettings({ branding: updates });
      setSettings((prev) => (prev ? { ...prev, branding: updates } : null));
      setIsDirty(false);
      await refreshClient();
      toast.success('Portal branding and themes updated successfully.', 'Branding Saved');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save branding preferences.';
      toast.error(msg, 'Save Error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <AppLoading message="Loading organization settings..." />;
  }

  if (loadError || !settings) {
    return (
      <PageContainer
        title="Organization Settings"
        description="Configure organizational policies, localization, and system preferences."
        breadcrumbs={[{ label: 'Settings' }]}
      >
        <ErrorState
          variant="generic"
          title="Settings Unavailable"
          message={loadError || 'The settings configuration for your organization could not be retrieved.'}
          onRetry={loadSettings}
        />
      </PageContainer>
    );
  }

  const selectedCategoryDef = SETTINGS_CATEGORIES.find((c) => c.id === activeCategory);

  const isCategoryAuthorized =
    !selectedCategoryDef ||
    ((!selectedCategoryDef.requiredPermission || can(selectedCategoryDef.requiredPermission)) &&
      (!selectedCategoryDef.anyPermissions ||
        selectedCategoryDef.anyPermissions.length === 0 ||
        canAny(selectedCategoryDef.anyPermissions)));

  return (
    <PageContainer
      title="Organization Settings"
      description="Configure company policies, localization defaults, branding, and operational rules."
      breadcrumbs={[
        { label: 'Settings', path: ROUTE_PATHS.SETTINGS },
        ...(activeCategory !== 'overview' && selectedCategoryDef
          ? [{ label: selectedCategoryDef.shortTitle }]
          : []),
      ]}
    >
      <SettingsLayout activeCategory={activeCategory} onSelectCategory={handleSelectCategory}>
        {!isCategoryAuthorized ? (
          <PermissionDenied
            title={`${selectedCategoryDef?.shortTitle || 'Category'} Restricted`}
            message="Your current organizational role does not have permission to view or manage this settings category."
            requiredPermission={selectedCategoryDef?.requiredPermission || selectedCategoryDef?.anyPermissions?.[0]}
            currentRole={role ?? undefined}
            onReturnToDashboard={() => setSearchParams({ category: 'overview' })}
            action={
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSearchParams({ category: 'overview' })}
              >
                View Settings Overview
              </button>
            }
          />
        ) : (
          <>
            {activeCategory === 'overview' && (
              <SettingsOverviewGrid onSelectCategory={handleSelectCategory} />
            )}

            {activeCategory === 'localization' && (
              <LocalizationSettingsForm
                localization={settings.localization}
                canEdit={canEdit}
                isSaving={isSaving}
                onSave={handleSaveLocalization}
                onDirtyChange={setIsDirty}
              />
            )}

            {activeCategory === 'branding' && (
              <BrandingSettingsForm
                branding={settings.branding}
                companyName={organization?.name || 'Organization'}
                canEdit={canEdit}
                isSaving={isSaving}
                onSave={handleSaveBranding}
                onDirtyChange={setIsDirty}
              />
            )}

            {selectedCategoryDef && !selectedCategoryDef.isImplemented && (
              <UpcomingCategoryCard category={selectedCategoryDef} />
            )}
          </>
        )}
      </SettingsLayout>

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
