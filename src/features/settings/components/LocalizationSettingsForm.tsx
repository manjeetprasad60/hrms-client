import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Select, type SelectOption } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import type { LocalizationSettings } from '../../../types/settings';

export interface LocalizationSettingsFormProps {
  readonly localization: LocalizationSettings;
  readonly canEdit: boolean;
  readonly isSaving: boolean;
  readonly onSave: (updates: Partial<LocalizationSettings>) => Promise<void>;
  readonly onDirtyChange?: (isDirty: boolean) => void;
}

const COUNTRY_OPTIONS: readonly SelectOption[] = [
  { value: 'US', label: 'United States (US)' },
  { value: 'CA', label: 'Canada (CA)' },
  { value: 'GB', label: 'United Kingdom (GB)' },
  { value: 'IN', label: 'India (IN)' },
  { value: 'AU', label: 'Australia (AU)' },
  { value: 'DE', label: 'Germany (DE)' },
  { value: 'FR', label: 'France (FR)' },
  { value: 'SG', label: 'Singapore (SG)' },
  { value: 'JP', label: 'Japan (JP)' },
  { value: 'AE', label: 'United Arab Emirates (AE)' },
];

const CURRENCY_OPTIONS: readonly SelectOption[] = [
  { value: 'USD', label: 'USD ($) — US Dollar' },
  { value: 'EUR', label: 'EUR (€) — Euro' },
  { value: 'GBP', label: 'GBP (£) — British Pound' },
  { value: 'INR', label: 'INR (₹) — Indian Rupee' },
  { value: 'CAD', label: 'CAD ($) — Canadian Dollar' },
  { value: 'AUD', label: 'AUD ($) — Australian Dollar' },
  { value: 'SGD', label: 'SGD ($) — Singapore Dollar' },
  { value: 'JPY', label: 'JPY (¥) — Japanese Yen' },
  { value: 'AED', label: 'AED (د.إ) — UAE Dirham' },
];

const TIMEZONE_OPTIONS: readonly SelectOption[] = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'America/New_York (Eastern Time - US & Canada)' },
  { value: 'America/Chicago', label: 'America/Chicago (Central Time - US & Canada)' },
  { value: 'America/Denver', label: 'America/Denver (Mountain Time - US & Canada)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific Time - US & Canada)' },
  { value: 'Europe/London', label: 'Europe/London (Greenwich Mean Time / BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (Central European Time)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (India Standard Time - IST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (Singapore Time - SGT)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (Japan Standard Time - JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (Australian Eastern Time)' },
];

const DATE_FORMAT_OPTIONS: readonly SelectOption[] = [
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO 8601, e.g. 2026-09-06)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK / Europe / India, e.g. 06/09/2026)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US format, e.g. 09/06/2026)' },
  { value: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY (Alpha, e.g. 06-Sep-2026)' },
];

const TIME_FORMAT_OPTIONS: readonly SelectOption[] = [
  { value: '12h', label: '12-Hour Clock (e.g. 02:30 PM)' },
  { value: '24h', label: '24-Hour Military Clock (e.g. 14:30)' },
];

const LANGUAGE_OPTIONS: readonly SelectOption[] = [
  { value: 'en', label: 'English (US / International)' },
  { value: 'es', label: 'Spanish (Español)' },
  { value: 'fr', label: 'French (Français)' },
  { value: 'de', label: 'German (Deutsch)' },
  { value: 'ja', label: 'Japanese (日本語)' },
  { value: 'ar', label: 'Arabic (العربية)' },
];

export const LocalizationSettingsForm: React.FC<LocalizationSettingsFormProps> = ({
  localization,
  canEdit,
  isSaving,
  onSave,
  onDirtyChange,
}) => {
  const initialForm = useMemo(
    () => ({
      defaultCountry: localization.defaultCountry || 'US',
      defaultTimezone: localization.defaultTimezone || 'UTC',
      defaultCurrency: localization.defaultCurrency || 'USD',
      dateFormat: localization.dateFormat || 'YYYY-MM-DD',
      timeFormat: localization.timeFormat || '24h',
      defaultLanguage: localization.defaultLanguage || 'en',
    }),
    [localization]
  );

  const [form, setForm] = useState(initialForm);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isDirty = useMemo(() => {
    return (
      form.defaultCountry !== initialForm.defaultCountry ||
      form.defaultTimezone !== initialForm.defaultTimezone ||
      form.defaultCurrency !== initialForm.defaultCurrency ||
      form.dateFormat !== initialForm.dateFormat ||
      form.timeFormat !== initialForm.timeFormat ||
      form.defaultLanguage !== initialForm.defaultLanguage
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
        defaultCountry: form.defaultCountry,
        defaultTimezone: form.defaultTimezone,
        defaultCurrency: form.defaultCurrency,
        dateFormat: form.dateFormat,
        timeFormat: form.timeFormat as '12h' | '24h',
        defaultLanguage: form.defaultLanguage,
      });
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update localization settings.');
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
          You are viewing localization defaults in read-only mode. Only Organization Administrators can modify settings.
        </Alert>
      )}

      {saveSuccess && (
        <Alert variant="success" title="Settings Saved" onDismiss={() => setSaveSuccess(false)}>
          Localization and regional display defaults have been updated successfully.
        </Alert>
      )}

      {saveError && (
        <Alert variant="error" title="Update Failed" onDismiss={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Regional Defaults & Units
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Base country of operation, reporting currency, and system timezone for timesheets and scheduling.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <Select
              label="Operating Country"
              options={COUNTRY_OPTIONS}
              value={form.defaultCountry}
              disabled={!canEdit || isSaving}
              onChange={(e) => handleChange('defaultCountry', e.target.value)}
              helperText="Determines regional statutory holiday rules and compliance defaults."
            />

            <Select
              label="Default Timezone"
              options={TIMEZONE_OPTIONS}
              value={form.defaultTimezone}
              disabled={!canEdit || isSaving}
              onChange={(e) => handleChange('defaultTimezone', e.target.value)}
              helperText="Reference clock for attendance check-ins, shift timers, and payroll cutoff."
            />

            <Select
              label="Base Functional Currency"
              options={CURRENCY_OPTIONS}
              value={form.defaultCurrency}
              disabled={!canEdit || isSaving}
              onChange={(e) => handleChange('defaultCurrency', e.target.value)}
              helperText="Primary currency for salary structures, payslips, and compensation analytics."
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Date & Time Display Preferences
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Standard display formatting across employee rosters, audit logs, and exportable reports.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <Select
              label="Date Display Format"
              options={DATE_FORMAT_OPTIONS}
              value={form.dateFormat}
              disabled={!canEdit || isSaving}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              helperText="Applied to timesheets, leave calendars, and onboarding forms."
            />

            <Select
              label="Clock Display Format"
              options={TIME_FORMAT_OPTIONS}
              value={form.timeFormat}
              disabled={!canEdit || isSaving}
              onChange={(e) => handleChange('timeFormat', e.target.value)}
              helperText="Applied to punch clocks, break logs, and shift timestamps."
            />

            <Select
              label="Default System Language"
              options={LANGUAGE_OPTIONS}
              value={form.defaultLanguage}
              disabled={!canEdit || isSaving}
              onChange={(e) => handleChange('defaultLanguage', e.target.value)}
              helperText="Default locale for system notifications, automated emails, and UI strings."
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
            Save Localization Settings
          </Button>
        </div>
      )}
    </form>
  );
};
