import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select, type SelectOption } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Avatar } from '../../../components/ui/Avatar';
import { OrganizationStatusBadge } from './OrganizationStatusBadge';
import type { ClientOrganization, UpdateOrganizationProfileInput } from '../../../types/organization';

export interface OrganizationProfileFormProps {
  readonly organization: ClientOrganization;
  readonly canEdit: boolean;
  readonly isSaving: boolean;
  readonly saveError: string | null;
  readonly saveSuccess: boolean;
  readonly onSave: (payload: UpdateOrganizationProfileInput) => Promise<void>;
  readonly onDirtyChange?: (isDirty: boolean) => void;
  readonly onClearFeedback?: () => void;
}

interface FormState {
  name: string;
  legalName: string;
  taxIdentifier: string;
  logoUrl: string;
  country: string;
  defaultCurrency: string;
  defaultTimezone: string;
  primaryEmail: string;
  phoneNumber: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  contactCountry: string;
}

const COUNTRY_OPTIONS: readonly SelectOption[] = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'IN', label: 'India' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'SG', label: 'Singapore' },
  { value: 'JP', label: 'Japan' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'OTHER', label: 'Other Country' },
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

function buildInitialFormState(org: ClientOrganization): FormState {
  return {
    name: org.name || '',
    legalName: org.legalName || '',
    taxIdentifier: org.taxIdentifier || '',
    logoUrl: org.logoUrl || org.logo || '',
    country: org.country || 'US',
    defaultCurrency: org.defaultCurrency || org.currency || 'USD',
    defaultTimezone: org.defaultTimezone || org.timezone || 'UTC',
    primaryEmail: org.contactInformation?.primaryEmail || '',
    phoneNumber: org.contactInformation?.phoneNumber || '',
    website: org.contactInformation?.website || '',
    addressLine1: org.contactInformation?.addressLine1 || '',
    addressLine2: org.contactInformation?.addressLine2 || '',
    city: org.contactInformation?.city || '',
    stateOrProvince: org.contactInformation?.stateOrProvince || '',
    postalCode: org.contactInformation?.postalCode || '',
    contactCountry: org.contactInformation?.country || org.country || 'US',
  };
}

export const OrganizationProfileForm: React.FC<OrganizationProfileFormProps> = ({
  organization,
  canEdit,
  isSaving,
  saveError,
  saveSuccess,
  onSave,
  onDirtyChange,
  onClearFeedback,
}) => {
  const [form, setForm] = useState<FormState>(() => buildInitialFormState(organization));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoPreviewError, setLogoPreviewError] = useState(false);


  // Compute dirty status
  const initialForm = useMemo(() => buildInitialFormState(organization), [organization]);

  const isDirty = useMemo(() => {
    const keys = Object.keys(form) as (keyof FormState)[];
    return keys.some((k) => form[k] !== initialForm[k]);
  }, [form, initialForm]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleChange = useCallback(
    (field: keyof FormState, value: string) => {
      onClearFeedback?.();
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
      if (field === 'logoUrl') {
        setLogoPreviewError(false);
      }
    },
    [errors, onClearFeedback]
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Company name is required.';
    }

    if (form.primaryEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.primaryEmail.trim())) {
        newErrors.primaryEmail = 'Please enter a valid email address.';
      }
    }

    if (form.website.trim()) {
      const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
      if (!urlRegex.test(form.website.trim())) {
        newErrors.website = 'Please enter a valid website URL (e.g., https://example.com).';
      }
    }

    if (form.logoUrl.trim()) {
      try {
        new URL(form.logoUrl.trim());
      } catch {
        newErrors.logoUrl = 'Please enter a valid full URL (e.g., https://example.com/logo.png).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || isSaving) return;

    if (!validate()) {
      return;
    }

    const payload: UpdateOrganizationProfileInput = {
      name: form.name.trim(),
      legalName: form.legalName.trim() || undefined,
      taxIdentifier: form.taxIdentifier.trim() || undefined,
      logoUrl: form.logoUrl.trim() || undefined,
      country: form.country,
      defaultCurrency: form.defaultCurrency,
      defaultTimezone: form.defaultTimezone,
      contactInformation: {
        primaryEmail: form.primaryEmail.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        website: form.website.trim() || undefined,
        addressLine1: form.addressLine1.trim() || undefined,
        addressLine2: form.addressLine2.trim() || undefined,
        city: form.city.trim() || undefined,
        stateOrProvince: form.stateOrProvince.trim() || undefined,
        postalCode: form.postalCode.trim() || undefined,
        country: form.contactCountry || form.country,
      },
    };

    await onSave(payload);
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setLogoPreviewError(false);
    onClearFeedback?.();
  };

  const initials = organization.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Feedback Banners */}
      {!canEdit && (
        <Alert variant="info" title="Read-Only Access">
          You are viewing this organization profile in read-only mode. Only users with the Organization Administrator
          role or organization-edit permission can modify company settings.
        </Alert>
      )}

      {saveSuccess && (
        <Alert variant="success" title="Changes Saved" onDismiss={onClearFeedback}>
          Organization profile has been updated successfully.
        </Alert>
      )}

      {saveError && (
        <Alert variant="error" title="Update Failed" onDismiss={onClearFeedback}>
          {saveError}
        </Alert>
      )}

      {/* 1. General Identity Section */}
      <Card>
        <CardHeader>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              General Identity
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Basic company details and platform-governed identity records.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {/* Organization ID (Immutable) */}
            <div>
              <Input
                label="Organization ID"
                value={organization.id}
                disabled
                readOnly
                helperText="Permanent system tenant identifier (strictly immutable)."
                startIcon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
              />
            </div>

            {/* Organization Status (Platform Managed) */}
            <div className="input-group">
              <label className="input-label">Organization Status</label>
              <div style={{ marginTop: 'var(--space-2)' }}>
                <OrganizationStatusBadge status={organization.status} showDescription />
              </div>
            </div>

            {/* Company Name (Required) */}
            <div>
              <Input
                label="Company Display Name"
                required
                value={form.name}
                disabled={!canEdit || isSaving}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                placeholder="e.g. Acme Corporation"
              />
            </div>

            {/* Legal Name */}
            <div>
              <Input
                label="Legal Registered Name"
                value={form.legalName}
                disabled={!canEdit || isSaving}
                onChange={(e) => handleChange('legalName', e.target.value)}
                placeholder="e.g. Acme Global Technologies Inc."
                helperText="Official registered business entity name."
              />
            </div>

            {/* Tax / Business Identifier */}
            <div>
              <Input
                label="Tax / Business Registration ID"
                value={form.taxIdentifier}
                disabled={!canEdit || isSaving}
                onChange={(e) => handleChange('taxIdentifier', e.target.value)}
                placeholder="e.g. EIN 12-3456789 or VAT GB123456789"
                helperText="Corporate tax identifier for payroll and regulatory reporting."
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. Branding & Visual Identity Section */}
      <Card>
        <CardHeader>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Branding & Visuals
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Company logo displayed across the application header, documents, and notifications.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              {/* Logo Preview */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-default)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {form.logoUrl && !logoPreviewError ? (
                  <img
                    src={form.logoUrl}
                    alt="Logo Preview"
                    onError={() => setLogoPreviewError(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Avatar
                    firstName={initials[0] || 'O'}
                    lastName={initials[1] || 'G'}
                    size="lg"
                    alt={organization.name}
                  />
                )}
              </div>

              <div style={{ flex: '1 1 300px' }}>
                <Input
                  label="Logo Image URL"
                  value={form.logoUrl}
                  disabled={!canEdit || isSaving}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  error={errors.logoUrl}
                  placeholder="https://example.com/logo.png"
                  helperText="Provide a public HTTPS URL for your company logo (PNG, SVG, or JPEG)."
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 3. Localization & Operational Defaults */}
      <Card>
        <CardHeader>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Localization & Defaults
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Operating country, base functional currency, and primary organizational timezone.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <Select
                label="Country of Operation"
                options={COUNTRY_OPTIONS}
                value={form.country}
                disabled={!canEdit || isSaving}
                onChange={(e) => handleChange('country', e.target.value)}
                helperText="Primary jurisdiction for company operations."
              />
            </div>

            <div>
              <Select
                label="Default Currency"
                options={CURRENCY_OPTIONS}
                value={form.defaultCurrency}
                disabled={!canEdit || isSaving}
                onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                helperText="Default currency used across payroll and expense reporting."
              />
            </div>

            <div>
              <Select
                label="Default Timezone"
                options={TIMEZONE_OPTIONS}
                value={form.defaultTimezone}
                disabled={!canEdit || isSaving}
                onChange={(e) => handleChange('defaultTimezone', e.target.value)}
                helperText="Timezone for attendance logs, timesheets, and shift tracking."
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 4. Corporate Contact & Address */}
      <Card>
        <CardHeader>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Corporate Contact & Address
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Official contact coordinates and registered headquarter address.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              <div>
                <Input
                  label="Primary Contact Email"
                  type="email"
                  value={form.primaryEmail}
                  disabled={!canEdit || isSaving}
                  onChange={(e) => handleChange('primaryEmail', e.target.value)}
                  error={errors.primaryEmail}
                  placeholder="contact@company.com"
                />
              </div>

              <div>
                <Input
                  label="Corporate Phone Number"
                  type="tel"
                  value={form.phoneNumber}
                  disabled={!canEdit || isSaving}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <Input
                  label="Official Website"
                  type="url"
                  value={form.website}
                  disabled={!canEdit || isSaving}
                  onChange={(e) => handleChange('website', e.target.value)}
                  error={errors.website}
                  placeholder="https://company.com"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
              <Input
                label="Address Line 1"
                value={form.addressLine1}
                disabled={!canEdit || isSaving}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
                placeholder="123 Corporate Blvd, Suite 400"
              />

              <Input
                label="Address Line 2 (Optional)"
                value={form.addressLine2}
                disabled={!canEdit || isSaving}
                onChange={(e) => handleChange('addressLine2', e.target.value)}
                placeholder="Building B, Floor 4"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <Input
                label="City"
                value={form.city}
                disabled={!canEdit || isSaving}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="San Francisco"
              />

              <Input
                label="State / Province / Region"
                value={form.stateOrProvince}
                disabled={!canEdit || isSaving}
                onChange={(e) => handleChange('stateOrProvince', e.target.value)}
                placeholder="California"
              />

              <Input
                label="Postal / ZIP Code"
                value={form.postalCode}
                disabled={!canEdit || isSaving}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                placeholder="94105"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Action Bar */}
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
            Save Changes
          </Button>
        </div>
      )}
    </form>
  );
};
