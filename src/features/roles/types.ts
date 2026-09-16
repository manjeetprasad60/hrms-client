import type { Role, RoleStatus } from '../../types/role';
import type { PermissionKey } from '../../permissions/permissions';

export interface RoleFilterState {
  search: string;
  type: 'all' | 'system' | 'custom';
  status: 'all' | RoleStatus;
}

export interface CreateRoleFormData {
  name: string;
  description: string;
  permissions: PermissionKey[];
}

export interface EditRoleFormData {
  name: string;
  description: string;
  status: RoleStatus;
  permissions: PermissionKey[];
}

export interface RoleDeleteState {
  isOpen: boolean;
  role: Role | null;
  assignedUsersCount: number;
}
