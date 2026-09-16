/**
 * Role Service Implementation
 *
 * Enforces:
 * 1. Tenant Isolation: Custom roles stored under organizations/{orgId}/roles/{roleId}
 * 2. System Role Protection: Built-in archetypes cannot be modified or deleted
 * 3. Anti-Privilege Escalation: Administrators cannot grant permissions exceeding their own
 * 4. Safe Deletion: Blocked if active users are currently assigned to the role
 */

import { databaseService } from '../database';
import { clientDataService } from '../client/clientDataService';
import { auditService } from '../audit/auditService';
import { AUDIT_ACTIONS } from '../../types/audit';
import { authService } from '../auth';
import {
  ClientInvalidDataError,
  ClientNotFoundError,
  ClientUnauthorizedError,
  mapToClientServiceError,
} from '../client/clientErrors';
import {
  CLIENT_ROLES,
  SYSTEM_ROLES,
  isSystemRole,
  getSystemRoleByCode,
  getSystemRoleById,
  validateRolePermissionsSubset,
} from '../../permissions/roles';
import { PERMISSIONS, type PermissionKey } from '../../permissions/permissions';
import {
  can as evalCan,
  getEffectivePermissions,
  registerDynamicRole,
  unregisterDynamicRole,
} from '../../permissions/can';
import type { Role, CreateRoleInput, UpdateRoleInput, RoleFilterParams } from '../../types/role';
import type { ClientUser } from '../../types/auth';
import type { RoleService } from './role.types';

export class RoleServiceImpl implements RoleService {
  private mockCustomRolesByOrg = new Map<string, Role[]>();

  constructor() {
    // Register all immutable system roles in the dynamic registry on startup
    for (const sysRole of SYSTEM_ROLES) {
      registerDynamicRole(sysRole);
    }
  }

  private getMockCustomRoles(orgId: string): Role[] {
    if (!this.mockCustomRolesByOrg.has(orgId)) {
      const now = new Date().toISOString();
      const seedCustomRoles: Role[] = [
        {
          id: `role_custom_${orgId}_recruitment_coordinator`,
          organizationId: orgId,
          clientId: orgId,
          code: 'recruitment_coordinator',
          name: 'Recruitment Coordinator',
          description: 'Coordinates applicant tracking, scheduling interviews, and candidate profile management.',
          permissionIds: [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.RECRUITMENT_VIEW,
            PERMISSIONS.RECRUITMENT_MANAGE,
            PERMISSIONS.EMPLOYEES_VIEW,
            PERMISSIONS.DEPARTMENTS_VIEW,
          ],
          permissions: [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.RECRUITMENT_VIEW,
            PERMISSIONS.RECRUITMENT_MANAGE,
            PERMISSIONS.EMPLOYEES_VIEW,
            PERMISSIONS.DEPARTMENTS_VIEW,
          ],
          status: 'active',
          isSystemRole: false,
          isCustomRole: true,
          hierarchyLevel: 40,
          createdAt: now,
          updatedAt: now,
        },
      ];
      this.mockCustomRolesByOrg.set(orgId, seedCustomRoles);
      // Register in permission evaluator
      for (const r of seedCustomRoles) {
        registerDynamicRole(r);
      }
    }
    return this.mockCustomRolesByOrg.get(orgId)!;
  }

  public async listRoles(params?: RoleFilterParams): Promise<Role[]> {
    const ctx = clientDataService.getTrustedContext();

    try {
      let customRoles: Role[] = [];

      if (clientDataService.isConfigured()) {
        const path = clientDataService.buildClientPath('roles');
        const raw = await databaseService.get<Record<string, Role>>(path);
        if (raw && typeof raw === 'object') {
          customRoles = Object.entries(raw).map(([key, val]) => ({
            ...val,
            id: val.id || key,
            organizationId: ctx.organizationId,
            clientId: ctx.organizationId,
            isSystemRole: false,
            isCustomRole: true,
            permissions: val.permissionIds || val.permissions || [],
          }));
        }
      } else {
        customRoles = this.getMockCustomRoles(ctx.organizationId);
      }

      // Sync custom roles into runtime evaluator
      for (const r of customRoles) {
        registerDynamicRole(r);
      }

      // Merge System Roles and Custom Roles
      let allRoles = [...SYSTEM_ROLES, ...customRoles];

      // Filter by type
      if (params?.type && params.type !== 'all') {
        allRoles = allRoles.filter((r) =>
          params.type === 'system' ? r.isSystemRole : r.isCustomRole
        );
      }

      // Filter by status
      if (params?.status && params.status !== 'all') {
        allRoles = allRoles.filter((r) => r.status === params.status);
      }

      // Filter by search query
      if (params?.search?.trim()) {
        const q = params.search.trim().toLowerCase();
        allRoles = allRoles.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.code.toLowerCase().includes(q)
        );
      }

      return allRoles;
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async getRoleById(roleId: string): Promise<Role | null> {
    if (!roleId) return null;
    const cleanId = roleId.trim();

    // Check system roles
    const systemMatch = getSystemRoleById(cleanId) || getSystemRoleByCode(cleanId);
    if (systemMatch) {
      return systemMatch;
    }

    const all = await this.listRoles();
    return all.find((r) => r.id === cleanId || r.code === cleanId) ?? null;
  }

  public async getRoleByCode(code: string): Promise<Role | null> {
    if (!code) return null;
    const cleanCode = code.trim();

    const systemMatch = getSystemRoleByCode(cleanCode);
    if (systemMatch) {
      return systemMatch;
    }

    const all = await this.listRoles();
    return all.find((r) => r.code === cleanCode) ?? null;
  }

  public async createCustomRole(input: CreateRoleInput): Promise<Role> {
    const ctx = clientDataService.getTrustedContext();
    const session = authService.getCurrentSession();

    // 1. Permission check: creator must have ROLES_MANAGE or be ORG_ADMIN
    if (ctx.role !== CLIENT_ROLES.ORG_ADMIN && !evalCan(ctx.role, PERMISSIONS.ROLES_MANAGE, ctx.customPermissions)) {
      throw new ClientUnauthorizedError(
        'You do not have permission to create organizational roles.',
        ctx.organizationId
      );
    }

    // 2. Validate role name and description
    const name = input.name?.trim();
    if (!name || name.length < 2) {
      throw new ClientInvalidDataError('A descriptive role name is required (minimum 2 characters).');
    }

    const description = input.description?.trim();
    if (!description || description.length < 5) {
      throw new ClientInvalidDataError('A meaningful description of the role responsibilities is required.');
    }

    // Check for duplicate role names within the organization
    const existingRoles = await this.listRoles();
    const isDuplicate = existingRoles.some((r) => r.name.toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
      throw new ClientInvalidDataError(`A role with the name "${name}" already exists in this organization.`);
    }

    // 3. Permission IDs
    const permissionIds = input.permissionIds && input.permissionIds.length > 0
      ? input.permissionIds
      : (input.permissions as readonly PermissionKey[]) || [];

    if (!permissionIds || permissionIds.length === 0) {
      throw new ClientInvalidDataError('A role must grant at least one permission.');
    }

    // 4. Anti-Privilege Escalation Check:
    // Unless actor is ORG_ADMIN, creator cannot grant permissions they do not possess.
    if (ctx.role !== CLIENT_ROLES.ORG_ADMIN) {
      const actorPerms = getEffectivePermissions(ctx.role, ctx.customPermissions);
      const isAllowed = validateRolePermissionsSubset(permissionIds, actorPerms);
      if (!isAllowed) {
        throw new ClientUnauthorizedError(
          'Privilege escalation violation: You cannot create a role with permissions that exceed your own active permissions.',
          ctx.organizationId
        );
      }
    }

    // 5. Generate slug code and unique ID
    const slugBase = input.code?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const code = slugBase.startsWith('custom_') ? slugBase : `custom_${slugBase}`;

    // Ensure code does not collide with system role codes
    if (isSystemRole(code)) {
      throw new ClientInvalidDataError(`Role code "${code}" conflicts with a protected system role identifier.`);
    }

    const roleId = `role_${code}_${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();

    const newRole: Role = {
      id: roleId,
      organizationId: ctx.organizationId,
      clientId: ctx.organizationId,
      code,
      name,
      description,
      permissionIds,
      permissions: permissionIds,
      status: 'active',
      isSystemRole: false,
      isCustomRole: true,
      allowedAssignableRoles: input.allowedAssignableRoles || [],
      hierarchyLevel: 30,
      createdBy: {
        uid: ctx.userId,
        name: session?.user?.displayName || session?.user?.firstName || 'Admin',
        email: session?.user?.email,
      },
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      if (clientDataService.isConfigured()) {
        const path = `organizations/${ctx.organizationId}/roles/${roleId}`;
        await databaseService.set(path, newRole);
      } else {
        const mockList = this.getMockCustomRoles(ctx.organizationId);
        mockList.push(newRole);
      }

      // Register in runtime permission engine
      registerDynamicRole(newRole);

      // Record administrative audit log
      await auditService.recordEvent({
        action: AUDIT_ACTIONS.ROLE_CREATED,
        resourceType: 'role',
        resourceId: newRole.id,
        metadata: {
          roleName: newRole.name,
          roleCode: newRole.code,
          permissions: newRole.permissionIds,
        },
      });

      return newRole;
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async updateRole(roleId: string, updates: UpdateRoleInput): Promise<Role> {
    const ctx = clientDataService.getTrustedContext();

    // 1. Guard against tampering with immutable system roles
    if (isSystemRole(roleId)) {
      throw new ClientUnauthorizedError(
        'Protected system roles cannot be modified by client administrators.',
        ctx.organizationId
      );
    }

    // 2. Fetch existing custom role
    const existing = await this.getRoleById(roleId);
    if (!existing || existing.isSystemRole) {
      throw new ClientNotFoundError(`Custom role "${roleId}" was not found in this organization.`, ctx.organizationId);
    }

    // 3. Permission check
    if (ctx.role !== CLIENT_ROLES.ORG_ADMIN && !evalCan(ctx.role, PERMISSIONS.ROLES_MANAGE, ctx.customPermissions)) {
      throw new ClientUnauthorizedError(
        'You do not have permission to modify organizational roles.',
        ctx.organizationId
      );
    }

    // 4. Anti-Privilege Escalation Check on new permissions
    const updatedPerms = updates.permissionIds || (updates.permissions as readonly PermissionKey[]);
    if (updatedPerms && updatedPerms.length > 0 && ctx.role !== CLIENT_ROLES.ORG_ADMIN) {
      const actorPerms = getEffectivePermissions(ctx.role, ctx.customPermissions);
      const isAllowed = validateRolePermissionsSubset(updatedPerms, actorPerms);
      if (!isAllowed) {
        throw new ClientUnauthorizedError(
          'Privilege escalation violation: You cannot grant permissions that exceed your own active permissions.',
          ctx.organizationId
        );
      }
    }

    const nowIso = new Date().toISOString();
    const merged: Role = {
      ...existing,
      name: updates.name?.trim() || existing.name,
      description: updates.description?.trim() || existing.description,
      permissionIds: updatedPerms || existing.permissionIds,
      permissions: updatedPerms || existing.permissions,
      status: updates.status || existing.status,
      allowedAssignableRoles: updates.allowedAssignableRoles || existing.allowedAssignableRoles,
      updatedAt: nowIso,
    };

    try {
      if (clientDataService.isConfigured()) {
        const path = `organizations/${ctx.organizationId}/roles/${roleId}`;
        await databaseService.update(path, merged);
      } else {
        const mockList = this.getMockCustomRoles(ctx.organizationId);
        const idx = mockList.findIndex((r) => r.id === roleId);
        if (idx >= 0) {
          mockList[idx] = merged;
        }
      }

      // Update in runtime evaluator
      registerDynamicRole(merged);

      // Record administrative audit log
      const permsChanged =
        updatedPerms &&
        JSON.stringify(updatedPerms) !== JSON.stringify(existing.permissionIds);

      if (permsChanged) {
        await auditService.recordEvent({
          action: AUDIT_ACTIONS.PERMISSIONS_CHANGED,
          resourceType: 'role',
          resourceId: roleId,
          metadata: {
            roleName: merged.name,
            previousPermissions: existing.permissionIds,
            newPermissions: merged.permissionIds,
          },
        });
      }

      await auditService.recordEvent({
        action: AUDIT_ACTIONS.ROLE_MODIFIED,
        resourceType: 'role',
        resourceId: roleId,
        metadata: {
          roleName: merged.name,
          updatedFields: Object.keys(updates),
        },
      });

      return merged;
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async deleteRole(roleId: string): Promise<void> {
    const ctx = clientDataService.getTrustedContext();

    // 1. Guard against deleting system roles
    if (isSystemRole(roleId)) {
      throw new ClientUnauthorizedError(
        'Protected system roles cannot be deleted.',
        ctx.organizationId
      );
    }

    // 2. Fetch existing custom role
    const existing = await this.getRoleById(roleId);
    if (!existing || existing.isSystemRole) {
      throw new ClientNotFoundError(`Custom role "${roleId}" was not found.`, ctx.organizationId);
    }

    // 3. Permission check
    if (ctx.role !== CLIENT_ROLES.ORG_ADMIN && !evalCan(ctx.role, PERMISSIONS.ROLES_MANAGE, ctx.customPermissions)) {
      throw new ClientUnauthorizedError(
        'You do not have permission to delete organizational roles.',
        ctx.organizationId
      );
    }

    // 4. Safe Deletion: Ensure no active user is currently assigned to this role
    const activeUsers = await clientDataService.listClientUsers();
    const assignedUser = activeUsers.find(
      (u) =>
        u.role === existing.code ||
        u.roleId === existing.id ||
        (u.roleIds && u.roleIds.includes(existing.id))
    );

    if (assignedUser) {
      throw new ClientInvalidDataError(
        `Cannot delete role "${existing.name}": user "${assignedUser.displayName || assignedUser.email}" is currently assigned to this role.`
      );
    }

    try {
      if (clientDataService.isConfigured()) {
        const path = `organizations/${ctx.organizationId}/roles/${roleId}`;
        await databaseService.remove(path);
      } else {
        const mockList = this.getMockCustomRoles(ctx.organizationId);
        const idx = mockList.findIndex((r) => r.id === roleId);
        if (idx >= 0) {
          mockList.splice(idx, 1);
        }
      }

      // Remove from runtime evaluator
      unregisterDynamicRole(roleId);
      unregisterDynamicRole(existing.code);

      // Record administrative audit log
      await auditService.recordEvent({
        action: AUDIT_ACTIONS.ROLE_DELETED,
        resourceType: 'role',
        resourceId: roleId,
        metadata: {
          roleName: existing.name,
          roleCode: existing.code,
        },
      });
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async getEffectiveUserPermissions(user: ClientUser): Promise<readonly PermissionKey[]> {
    const permissions = new Set<PermissionKey>();

    // 1. Resolve permissions from primary role code
    if (user.role) {
      const primaryRole = await this.getRoleByCode(user.role);
      if (primaryRole) {
        for (const p of primaryRole.permissionIds) {
          permissions.add(p);
        }
      }
    }

    // 2. Resolve permissions from roleId if set
    if (user.roleId) {
      const roleById = await this.getRoleById(user.roleId);
      if (roleById) {
        for (const p of roleById.permissionIds) {
          permissions.add(p);
        }
      }
    }

    // 3. Resolve permissions from roleIds array if multi-role supported
    if (user.roleIds && user.roleIds.length > 0) {
      for (const rid of user.roleIds) {
        const r = await this.getRoleById(rid);
        if (r) {
          for (const p of r.permissionIds) {
            permissions.add(p);
          }
        }
      }
    }

    // 4. Include explicit customPermissions
    if (user.customPermissions && user.customPermissions.length > 0) {
      for (const p of user.customPermissions) {
        permissions.add(p as PermissionKey);
      }
    }

    return Array.from(permissions);
  }
}

export const roleService: RoleService = new RoleServiceImpl();
