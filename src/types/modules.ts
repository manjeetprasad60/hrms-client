/**
 * HR Operations Module Registry
 *
 * Defines modular capabilities of the Client Admin portal.
 */

import type { Permission } from '../permissions/permissions';

export const HR_MODULE_CODES = {
  ORGANIZATION: 'organization',
  EMPLOYEES: 'employees',
  ATTENDANCE: 'attendance',
  LEAVES: 'leaves',
  PAYROLL: 'payroll',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  RECRUITMENT: 'recruitment',
  PERFORMANCE: 'performance',
} as const;

export type HRModuleCode = typeof HR_MODULE_CODES[keyof typeof HR_MODULE_CODES];

export interface HRModuleDefinition {
  readonly code: HRModuleCode;
  readonly name: string;
  readonly description: string;
  readonly path: string;
  readonly requiredPermissions: readonly Permission[];
  readonly isCore: boolean; // Core modules cannot be disabled
}
