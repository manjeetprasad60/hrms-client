import type { ClientRole } from '../../permissions/roles';
import type { ClientUser, ClientUserStatus } from '../../types/auth';

export interface UserFilterState {
  readonly search: string;
  readonly role: ClientRole | 'all';
  readonly status: ClientUserStatus | 'all';
}

export type UserSortField = 'name' | 'email' | 'role' | 'status' | 'lastLoginAt' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export interface UserSortState {
  readonly field: UserSortField;
  readonly direction: SortDirection;
}

export interface UserLifecycleModalState {
  readonly isOpen: boolean;
  readonly targetUser: ClientUser | null;
  readonly action: 'suspend' | 'reactivate' | 'deactivate' | null;
}
