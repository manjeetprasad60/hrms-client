import { CLIENT_ROLE_LABELS, type ClientRole } from '../permissions/roles';

/**
 * Formatting Utility Functions
 */

export function formatRoleLabel(role?: string | null): string {
  if (!role) return 'Client User';
  if (role in CLIENT_ROLE_LABELS) {
    return CLIENT_ROLE_LABELS[role as ClientRole];
  }
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatDate(dateStr: string | Date | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return '—';
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', options || {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return '—';
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatInitials(firstName?: string, lastName?: string): string {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}` || 'U';
}

export function formatFullName(firstName?: string, lastName?: string): string {
  return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown User';
}
