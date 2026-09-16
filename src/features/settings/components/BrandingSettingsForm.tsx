import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select, type SelectOption } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import type { BrandingSettings } from '../../../types/settings';

export interface BrandingSettingsFormProps {
  readonly branding?: BrandingSettings;
  readonly companyName: string;
  readonly canEdit: boolean;
  readonly isSaving: boolean;
  readonly onSave: (updates: BrandingSettings) => Promise<void>;
  readonly onDirtyChange?: (isDirty: boolean) => void;
}

const THEME_OPTIONS: readonly SelectOption[] = [
  { value: 'light', label: 'Light Clean (Default enterprise theme)' },
  { value: 'dark', label: 'Dark Mode (High contrast dimmed)' },
  { value: 'system', label: 'System Automatic (Follows OS theme)' },
];

const PRESET_COLORS = [
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Deep Navy', hex: '#1e3a8a' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Slate', hex: '#475569' },
  { name: 'Crimson', hex: '#dc2626' },
];

export const BrandingSettingsForm: React.FC<BrandingSettingsFormProps> = ({
  branding,
  companyName,
  canEdit,
  isSaving,
  onSave,
  onDirtyChange,
}) => {
  const initialForm = useMemo(
    () => ({
      primaryColor: branding?.primaryColor || '#2563eb',
      accentColor: branding?.accentColor || '#3b82f6',
      portalTitle: branding?.portalTitle || `${companyName} Workforce Portal`,
      theme: (branding?.theme || 'light') as 'light' | 'dark' | 'system',
    }),
    [branding, companyName]
  );

  const [form, setForm] = useState(initialForm);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isDirty = useMemo(() => {
    return (
      form.primaryColor !== initialForm.primaryColor ||
      form.accentColor !== initialForm.accentColor ||
      form.portalTitle !== initialForm.portalTitle ||
      form.theme !== initialForm.theme
    );
  }, [form, initialForm]);

  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleChange = useCallback((field: keyof typeof form, value: string) => {
    setSaveSuccess(false);
    setSaveError(null);
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || isSaving) return;

    setSaveSuccess(false);
    setSaveError(null);

    try {
      await onSave({
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        portalTitle: form.portalTitle.trim() || undefined,
        theme: form.theme,
      });
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update branding settings.');
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setSaveSuccess(false);
    setSaveError(null);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {!canEdit && (
        <Alert variant="info" title="View-Only Access">
          You are viewing branding preferences in read-only mode. Only Organization Administrators can modify settings.
        </Alert>
      )}

      {saveSuccess && (
        <Alert variant="success" title="Branding Saved" onDismiss={() => setSaveSuccess(false)}>
          Portal branding and appearance preferences have been updated successfully.
        </Alert>
      )}

      {saveError && (
        <Alert variant="error" title="Update Failed" onDismiss={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      {/* Live Branding Preview */}
      <Card>
        <CardHeader>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Live Theme Preview
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Preview how selected brand colors and portal title render across client navigation.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
              backgroundColor: form.theme === 'dark' ? '#0f172a' : '#ffffff',
              color: form.theme === 'dark' ? '#f8fafc' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: form.primaryColor,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {companyName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                  {form.portalTitle || companyName}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7 }}>
                  Active Workspace Theme
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <button
                type="button"
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: form.primaryColor,
                  color: '#ffffff',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  border: 'none',
                }}
              >
                Primary Accent
              </button>
              <button
                type="button"
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: form.accentColor,
                  color: '#ffffff',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  border: 'none',
                }}
              >
                Secondary Accent
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Brand Color Configuration */}
      <Card>
        <CardHeader>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Color Palette & Presets
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Select enterprise palette colors for application buttons, navigation highlights, and badges.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>
                Recommended Brand Presets
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    disabled={!canEdit || isSaving}
                    onClick={() => {
                      handleChange('primaryColor', preset.hex);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: form.primaryColor === preset.hex ? '2px solid var(--color-primary)' : '1px solid var(--color-border-default)',
                      backgroundColor: 'var(--color-surface)',
                      cursor: canEdit ? 'pointer' : 'default',
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: preset.hex,
                      }}
                      aria-hidden="true"
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              <div>
                <label className="input-label">Primary Brand Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <input
                    type="color"
                    value={form.primaryColor}
                    disabled={!canEdit || isSaving}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    style={{
                      width: '42px',
                      height: '38px',
                      padding: '2px',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}
                  />
                  <Input
                    value={form.primaryColor}
                    disabled={!canEdit || isSaving}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    placeholder="#2563eb"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Secondary Accent Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <input
                    type="color"
                    value={form.accentColor}
                    disabled={!canEdit || isSaving}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    style={{
                      width: '42px',
                      height: '38px',
                      padding: '2px',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}
                  />
                  <Input
                    value={form.accentColor}
                    disabled={!canEdit || isSaving}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Portal Appearance & Titles */}
      <Card>
        <CardHeader>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Portal Appearance & Title
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Custom portal title banner and UI contrast theme preferences.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <Input
              label="Custom Portal Header Title"
              value={form.portalTitle}
              disabled={!canEdit || isSaving}
              onChange={(e) => handleChange('portalTitle', e.target.value)}
              placeholder="e.g. Acme Workforce Portal"
              helperText="Displayed in the top navigation bar and browser tab titles."
            />

            <Select
              label="Color Contrast Theme"
              options={THEME_OPTIONS}
              value={form.theme}
              disabled={!canEdit || isSaving}
              onChange={(e) => handleChange('theme', e.target.value)}
              helperText="Global contrast theme applied across all organizational admin screens."
            />
          </div>
        </CardBody>
      </Card>

      {canEdit && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <Button
            variant="outline"
            size="md"
            type="button"
            disabled={!isDirty || isSaving}
            onClick={handleReset}
          >
            Discard Changes
          </Button>

          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isSaving}
            disabled={!isDirty || isSaving}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            }
          >
            Save Branding Preferences
          </Button>
        </div>
      )}
    </form>
  );
};
