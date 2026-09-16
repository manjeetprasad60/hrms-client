import type { ReactNode } from 'react';
import type { PermissionKey } from '../../permissions/permissions';

export interface DashboardStatCard {
  readonly id: string;
  readonly title: string;
  readonly value: string | number;
  readonly statusLabel: string;
  readonly statusVariant?: 'neutral' | 'success' | 'warning' | 'info';
  readonly subtitle: string;
  readonly icon?: ReactNode;
  readonly permission?: PermissionKey | string;
}

export interface DashboardQuickAction {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly permission: PermissionKey | string;
  readonly icon: ReactNode;
  readonly routePath?: string;
  readonly onClick?: () => void;
}

export interface DashboardPendingItem {
  readonly id: string;
  readonly type: 'leave' | 'attendance' | 'profile' | 'document';
  readonly title: string;
  readonly applicantName: string;
  readonly department: string;
  readonly submittedAt: string;
  readonly status: 'pending' | 'in-review';
  readonly permission: PermissionKey | string;
}

export interface DashboardActivityItem {
  readonly id: string;
  readonly event: string;
  readonly description: string;
  readonly actor: string;
  readonly timestamp: string;
  readonly category: 'security' | 'workforce' | 'approval' | 'system';
}
