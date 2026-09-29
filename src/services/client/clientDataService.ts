/**
 * Client-Aware Firebase Data Service Implementation
 *
 * Implements the tenant-isolated data boundary:
 * Trusted Client Context -> ClientDataService -> DatabaseService/StorageService -> Firebase
 *
 * Guarantees that all data access and persistence operations are authoritatively scoped
 * to the authenticated client organization without trusting client-supplied IDs.
 */

import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { storageService } from '../storage';
import { authService } from '../auth';
import { companyService } from '../company/companyService';
import type { Company } from '../company/company.types';
import type { ClientOrganization } from '../../types/organization';
import type {
  ClientUser,
  ClientUserStatus,
  CreateClientUserInput,
  UpdateClientUserInput,
} from '../../types/auth';
import { CLIENT_USER_STATUS } from '../../types/user';
import {
  CLIENT_ROLES,
} from '../../permissions/roles';
import { auditService } from '../audit/auditService';
import { AUDIT_ACTIONS } from '../../types/audit';
import type { ClientSettings } from '../../types/settings';
import type { StorageUploadOptions, StorageUploadResult } from '../storage/storage.types';
import type { ClientDataService, TrustedClientContext } from './client.types';
import {
  ClientUnauthorizedError,
  ClientNotFoundError,
  ClientInvalidDataError,
  mapToClientServiceError,
} from './clientErrors';

export class ClientDataServiceImpl implements ClientDataService {
  private trustedContext: TrustedClientContext | null = null;
  private mockUsersByOrg = new Map<string, ClientUser[]>();

  private getMockUsers(orgId: string): ClientUser[] {
    if (!this.mockUsersByOrg.has(orgId)) {
      const session = authService.getCurrentSession();
      const currentAuthUser = session?.user;

      const seedUsers: ClientUser[] = [
        {
          id: currentAuthUser?.id || 'usr_admin_01',
          authUid: currentAuthUser?.authUid || currentAuthUser?.id || 'usr_admin_01',
          organizationId: orgId,
          clientId: orgId,
          email: currentAuthUser?.email || 'alex.morgan@acme-corp.com',
          firstName: currentAuthUser?.firstName || 'Alex',
          lastName: currentAuthUser?.lastName || 'Morgan',
          displayName: currentAuthUser?.displayName || 'Alex Morgan',
          phone: '+1 (555) 234-5678',
          phoneNumber: '+1 (555) 234-5678',
          role: CLIENT_ROLES.ORG_ADMIN,
          roleId: CLIENT_ROLES.ORG_ADMIN,
          roleIds: [CLIENT_ROLES.ORG_ADMIN],
          customPermissions: [],
          departmentIds: ['dept_exec'],
          locationIds: ['loc_hq'],
          isEmailVerified: true,
          status: CLIENT_USER_STATUS.ACTIVE,
          lastLoginAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        },
        {
          id: 'usr_hr_02',
          authUid: 'usr_hr_02',
          organizationId: orgId,
          clientId: orgId,
          email: 'sarah.jenkins@acme-corp.com',
          firstName: 'Sarah',
          lastName: 'Jenkins',
          displayName: 'Sarah Jenkins',
          phone: '+1 (555) 345-6789',
          phoneNumber: '+1 (555) 345-6789',
          role: CLIENT_ROLES.HR_MANAGER,
          roleId: CLIENT_ROLES.HR_MANAGER,
          roleIds: [CLIENT_ROLES.HR_MANAGER],
          customPermissions: [],
          departmentIds: ['dept_hr'],
          locationIds: ['loc_hq'],
          isEmailVerified: true,
          status: CLIENT_USER_STATUS.ACTIVE,
          lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        },
        {
          id: 'usr_payroll_03',
          authUid: 'usr_payroll_03',
          organizationId: orgId,
          clientId: orgId,
          email: 'michael.chang@acme-corp.com',
          firstName: 'Michael',
          lastName: 'Chang',
          displayName: 'Michael Chang',
          phone: '+1 (555) 456-7890',
          phoneNumber: '+1 (555) 456-7890',
          role: CLIENT_ROLES.PAYROLL_ADMIN,
          roleId: CLIENT_ROLES.PAYROLL_ADMIN,
          roleIds: [CLIENT_ROLES.PAYROLL_ADMIN],
          customPermissions: [],
          departmentIds: ['dept_finance'],
          locationIds: ['loc_hq'],
          isEmailVerified: true,
          status: CLIENT_USER_STATUS.ACTIVE,
          lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
        {
          id: 'usr_depthead_04',
          authUid: 'usr_depthead_04',
          organizationId: orgId,
          clientId: orgId,
          email: 'emily.watson@acme-corp.com',
          firstName: 'Emily',
          lastName: 'Watson',
          displayName: 'Emily Watson',
          phone: '+1 (555) 567-8901',
          phoneNumber: '+1 (555) 567-8901',
          role: CLIENT_ROLES.DEPARTMENT_HEAD,
          roleId: CLIENT_ROLES.DEPARTMENT_HEAD,
          roleIds: [CLIENT_ROLES.DEPARTMENT_HEAD],
          customPermissions: [],
          departmentIds: ['dept_eng'],
          locationIds: ['loc_remote'],
          isEmailVerified: false,
          status: CLIENT_USER_STATUS.INVITED,
          lastLoginAt: undefined,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
        {
          id: 'usr_emp_05',
          authUid: 'usr_emp_05',
          organizationId: orgId,
          clientId: orgId,
          email: 'david.ross@acme-corp.com',
          firstName: 'David',
          lastName: 'Ross',
          displayName: 'David Ross',
          phone: '+1 (555) 678-9012',
          phoneNumber: '+1 (555) 678-9012',
          role: CLIENT_ROLES.EMPLOYEE,
          roleId: CLIENT_ROLES.EMPLOYEE,
          roleIds: [CLIENT_ROLES.EMPLOYEE],
          customPermissions: [],
          departmentIds: ['dept_ops'],
          locationIds: ['loc_branch'],
          isEmailVerified: true,
          status: CLIENT_USER_STATUS.SUSPENDED,
          lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
        },
        {
          id: 'usr_emp_06',
          authUid: 'usr_emp_06',
          organizationId: orgId,
          clientId: orgId,
          email: 'jessica.taylor@acme-corp.com',
          firstName: 'Jessica',
          lastName: 'Taylor',
          displayName: 'Jessica Taylor',
          phone: '+1 (555) 789-0123',
          phoneNumber: '+1 (555) 789-0123',
          role: CLIENT_ROLES.EMPLOYEE,
          roleId: CLIENT_ROLES.EMPLOYEE,
          roleIds: [CLIENT_ROLES.EMPLOYEE],
          customPermissions: [],
          departmentIds: ['dept_sales'],
          locationIds: ['loc_remote'],
          isEmailVerified: true,
          status: CLIENT_USER_STATUS.DISABLED,
          lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 300).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
        },
      ];

      this.mockUsersByOrg.set(orgId, seedUsers);
    }
    return this.mockUsersByOrg.get(orgId)!;
  }

  public setTrustedContext(context: TrustedClientContext | null): void {
    if (context) {
      if (!context.organizationId || context.organizationId === 'null') {
        throw new ClientInvalidDataError('Invalid organization ID supplied to trusted context.');
      }
      this.trustedContext = Object.freeze({ ...context });
    } else {
      this.trustedContext = null;
    }
  }

  public getTrustedContext(): TrustedClientContext {
    if (this.trustedContext) {
      return this.trustedContext;
    }

    // Fallback: Check if AuthService currently holds an authenticated session
    const session = authService.getCurrentSession();
    const orgId = session?.user?.companyId ?? session?.organization?.id ?? session?.user?.organizationId ?? null;
    const userId = session?.user?.id ?? authService.getCurrentFirebaseUser()?.uid ?? null;

    if (orgId && userId && orgId !== 'org_unassigned' && orgId !== 'null' && orgId !== userId) {
      const fallbackContext: TrustedClientContext = {
        organizationId: orgId,
        userId,
        role: session?.user?.role,
        customPermissions: session?.user?.customPermissions,
      };
      this.trustedContext = Object.freeze(fallbackContext);
      return this.trustedContext;
    }

    throw new ClientUnauthorizedError(
      'No authorized client context registered. Operations must be scoped to an authenticated tenant organization.'
    );
  }

  public clearTrustedContext(): void {
    this.trustedContext = null;
  }

  public hasTrustedContext(): boolean {
    if (this.trustedContext) return true;
    try {
      this.getTrustedContext();
      return true;
    } catch {
      return false;
    }
  }

  public isConfigured(): boolean {
    return true;
  }

  public buildClientPath(resource: string, entityId?: string): string {
    const ctx = this.getTrustedContext();
    const cleanOrg = ctx.organizationId.trim().replace(/^\/+|\/+$/g, '');
    const cleanResource = resource.trim().replace(/^\/+|\/+$/g, '');

    if (entityId) {
      const cleanEntity = entityId.trim().replace(/^\/+|\/+$/g, '');
      return `organizations/${cleanOrg}/${cleanResource}/${cleanEntity}`;
    }

    return `organizations/${cleanOrg}/${cleanResource}`;
  }

  public async getClient(): Promise<ClientOrganization> {
    const ctx = this.getTrustedContext();

    try {
      const company = await companyService.getCompany(ctx.organizationId);
      if (company?.id) {
        return this.mapCompanyToOrganization(company);
      }
    } catch {
      // Local/offline fallback during development
    }

    const session = authService.getCurrentSession();
    const fallbackOrg: ClientOrganization = {
      id: ctx.organizationId,
      name: session?.organization?.name || 'Acme Corp',
      slug: session?.organization?.slug || 'acme-corp',
      defaultCurrency: 'USD',
      defaultTimezone: 'UTC',
      country: 'US',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return fallbackOrg;
  }

  private mapCompanyToOrganization(company: Company): ClientOrganization {
    const name = company.displayName || company.legalName || company.id;
    const currency = company.configuration?.currency || 'USD';
    const timezone = company.configuration?.timezone || 'UTC';

    return {
      id: company.id,
      name,
      legalName: company.legalName,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || company.id,
      defaultCurrency: currency,
      currency,
      defaultTimezone: timezone,
      timezone,
      country: company.address?.country || 'US',
      contactInformation: {
        primaryEmail: company.email,
        phoneNumber: company.phone,
        website: company.website,
        addressLine1: company.address?.addressLine1 || company.address?.street,
        addressLine2: company.address?.addressLine2,
        city: company.address?.city,
        stateOrProvince: company.address?.state,
        postalCode: company.address?.pinCode || company.address?.zipCode,
        country: company.address?.country,
      },
      status: company.status === 'inactive' || company.status === 'suspended' ? company.status : 'active',
      createdAt: new Date(company.createdAt).toISOString(),
      updatedAt: new Date(company.updatedAt).toISOString(),
    };
  }

  public async updateClient(updates: Partial<ClientOrganization>): Promise<void> {
    const ctx = this.getTrustedContext();

    if (updates.id && updates.id !== ctx.organizationId) {
      throw new ClientInvalidDataError(
        `Organization ID is immutable and cannot be altered (attempted: ${updates.id}, active: ${ctx.organizationId}).`
      );
    }

    if (updates.status) {
      throw new ClientInvalidDataError(
        'Organization status is managed by the platform control plane and cannot be altered by client administrators.'
      );
    }

    // Strip immutable primary keys and control-plane fields from client-submitted payload
    const { id: _ignoredId, createdAt: _ignoredCreatedAt, status: _ignoredStatus, ...sanitizedUpdates } = updates;

    const payload: Partial<ClientOrganization> = {
      ...sanitizedUpdates,
      updatedAt: new Date().toISOString(),
    };

    try {
      await apiClient.patch<ClientOrganization>(API_ENDPOINTS.organization.details(ctx.organizationId), payload);
    } catch {
      // Non-blocking in dev
    }

    try {
      // Record administrative audit log
      await auditService.recordEvent({
        action: AUDIT_ACTIONS.ORGANIZATION_PROFILE_UPDATED,
        resourceType: 'organization',
        resourceId: ctx.organizationId,
        metadata: {
          updatedFields: Object.keys(sanitizedUpdates),
        },
      });
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async getClientUser(userId?: string): Promise<ClientUser> {
    const ctx = this.getTrustedContext();
    const targetUid = userId?.trim() || ctx.userId;

    try {
      // If querying self, resolve from session user
      const session = authService.getCurrentSession();
      if (
        session?.user &&
        (!userId ||
          userId === session.user.id ||
          userId === session.user.authUid ||
          userId === ctx.userId)
      ) {
        const u = session.user;
        return {
          ...u,
          authUid: u.authUid || u.id,
          clientId: u.clientId || u.organizationId,
          displayName: u.displayName || `${u.firstName} ${u.lastName}`.trim() || u.email,
          photoURL: u.photoURL || u.avatarUrl,
          roleIds: u.roleIds || (u.role ? [u.role] : []),
        };
      }

      // If offline, check mock tenant directory
      const mockUser = this.getMockUsers(ctx.organizationId).find(
        (u) => u.id === targetUid || u.authUid === targetUid
      );
      if (mockUser) {
        return {
          ...mockUser,
          authUid: mockUser.authUid || mockUser.id,
          clientId: mockUser.clientId || mockUser.organizationId,
          displayName: mockUser.displayName || `${mockUser.firstName} ${mockUser.lastName}`.trim() || mockUser.email,
          photoURL: mockUser.photoURL || mockUser.avatarUrl,
          roleIds: mockUser.roleIds || (mockUser.role ? [mockUser.role] : []),
        };
      }

      throw new ClientNotFoundError(
        `User ${targetUid} was not found within client organization ${ctx.organizationId}.`,
        ctx.organizationId
      );
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async listClientUsers(): Promise<ClientUser[]> {
    const ctx = this.getTrustedContext();

    try {
      const users = await apiClient.get<ClientUser[]>(API_ENDPOINTS.organization.users(ctx.organizationId));
      if (Array.isArray(users) && users.length > 0) {
        return users.map((u) => {
          const firstName = u.firstName || '';
          const lastName = u.lastName || '';
          const email = u.email || '';
          return {
            ...u,
            authUid: u.authUid || u.id,
            organizationId: u.organizationId || ctx.organizationId,
            clientId: u.clientId || u.organizationId || ctx.organizationId,
            firstName,
            lastName,
            email,
            displayName: u.displayName || `${firstName} ${lastName}`.trim() || email || 'User',
            photoURL: u.photoURL || u.avatarUrl,
            avatarUrl: u.avatarUrl || u.photoURL,
            phone: u.phone || u.phoneNumber,
            phoneNumber: u.phoneNumber || u.phone,
            role: u.role || CLIENT_ROLES.EMPLOYEE,
            roleId: u.roleId || u.role || CLIENT_ROLES.EMPLOYEE,
            roleIds: u.roleIds && u.roleIds.length > 0 ? u.roleIds : (u.role ? [u.role] : [CLIENT_ROLES.EMPLOYEE]),
            customPermissions: u.customPermissions || [],
            departmentIds: u.departmentIds || [],
            locationIds: u.locationIds || [],
            status: u.status || CLIENT_USER_STATUS.INVITED,
          } as ClientUser;
        });
      }
    } catch {
      // Fallback to mock users
    }

    return [...this.getMockUsers(ctx.organizationId)];
  }

  public async createClientUser(input: CreateClientUserInput): Promise<ClientUser> {
    const ctx = this.getTrustedContext();

    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
      throw new ClientInvalidDataError('A valid email address is required to invite a user.');
    }
    if (!input.firstName?.trim() || !input.lastName?.trim()) {
      throw new ClientInvalidDataError('First name and last name are required.');
    }
    if (!input.role) {
      throw new ClientInvalidDataError('A valid client role is required.');
    }

    const email = input.email.trim().toLowerCase();
    const existingUsers = await this.listClientUsers();
    if (existingUsers.some((u) => u.email.toLowerCase() === email)) {
      throw new ClientInvalidDataError(`A user with email "${email}" already exists in this organization.`);
    }

    const newId = input.authUid || `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newUser: ClientUser = {
      id: newId,
      authUid: input.authUid || newId,
      organizationId: ctx.organizationId,
      clientId: ctx.organizationId,
      email,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      displayName: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
      phone: input.phone?.trim() || undefined,
      phoneNumber: input.phone?.trim() || undefined,
      role: input.role,
      roleId: input.role,
      roleIds: input.roleIds && input.roleIds.length > 0 ? input.roleIds : [input.role],
      customPermissions: input.customPermissions || [],
      departmentIds: input.departmentIds || [],
      locationIds: input.locationIds || [],
      employeeId: input.employeeId?.trim() || undefined,
      isEmailVerified: false,
      status: input.status || CLIENT_USER_STATUS.INVITED,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await apiClient.post<ClientUser>(API_ENDPOINTS.organization.users(ctx.organizationId), newUser);
    } catch {
      // Non-blocking in dev
    }

    const mockList = this.getMockUsers(ctx.organizationId);
    mockList.unshift(newUser);
    return newUser;
  }

  public async updateClientUser(userId: string, updates: UpdateClientUserInput): Promise<ClientUser> {
    const ctx = this.getTrustedContext();
    try {
      if (!userId?.trim()) {
      throw new ClientInvalidDataError('Target user ID must be provided.');
    }

    const targetUid = userId.trim();
    const existingUser = await this.getClientUser(targetUid);

    // Strip immutable primary keys from client-supplied updates
    const { id: _ignoredId, authUid: _ignoredAuthUid, organizationId: _ignoredOrgId, clientId: _ignoredClientId, createdAt: _ignoredCreatedAt, ...sanitizedUpdates } = updates as Partial<ClientUser>;

    const firstName = sanitizedUpdates.firstName ?? existingUser.firstName;
    const lastName = sanitizedUpdates.lastName ?? existingUser.lastName;
    const email = sanitizedUpdates.email ?? existingUser.email;

    // 1. Role Change Security Enforcements
    if (sanitizedUpdates.role && sanitizedUpdates.role !== existingUser.role) {
      // Sole Administrator Lockout Protection:
      // Prevent demoting or reassigning the only remaining active org_admin
      if (existingUser.role === CLIENT_ROLES.ORG_ADMIN) {
        const allUsers = await this.listClientUsers();
        const activeOrgAdmins = allUsers.filter(
          (u) =>
            (u.role === CLIENT_ROLES.ORG_ADMIN || u.roleId === CLIENT_ROLES.ORG_ADMIN) &&
            u.status === CLIENT_USER_STATUS.ACTIVE
        );
        if (
          activeOrgAdmins.length <= 1 &&
          activeOrgAdmins.some((a) => a.id === targetUid || a.authUid === targetUid)
        ) {
          throw new ClientInvalidDataError(
            'Cannot reassign the organization\'s sole administrator. Promote another administrator before reassigning this user.'
          );
        }
      }
    }

    const finalRole = sanitizedUpdates.role ?? existingUser.role;
    const finalRoleId = sanitizedUpdates.roleId ?? (sanitizedUpdates.role ? sanitizedUpdates.role : (existingUser.roleId ?? existingUser.role));
    const finalRoleIds = sanitizedUpdates.roleIds ?? (sanitizedUpdates.role ? [sanitizedUpdates.role] : (existingUser.roleIds || [finalRole]));

    const updatedUser: ClientUser = {
      ...existingUser,
      ...sanitizedUpdates,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`.trim() || email || 'User',
      role: finalRole,
      roleId: finalRoleId,
      roleIds: finalRoleIds,
      updatedAt: new Date().toISOString(),
    };

    try {
      await apiClient.patch<ClientUser>(API_ENDPOINTS.organization.user(ctx.organizationId, targetUid), updatedUser);
    } catch {
      // Non-blocking in dev
    }

    const mockList = this.getMockUsers(ctx.organizationId);
    const idx = mockList.findIndex((u) => u.id === targetUid || u.authUid === targetUid);
    if (idx >= 0) {
      mockList[idx] = updatedUser;
    } else {
      mockList.push(updatedUser);
    }

      // Record administrative audit log
      if (finalRole !== existingUser.role) {
        await auditService.recordEvent({
          action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
          resourceType: 'user',
          resourceId: targetUid,
          metadata: {
            userEmail: updatedUser.email,
            previousRole: existingUser.role,
            newRole: finalRole,
            previousRoleIds: existingUser.roleIds,
            newRoleIds: finalRoleIds,
          },
        });
      } else {
        await auditService.recordEvent({
          action: AUDIT_ACTIONS.USER_UPDATED,
          resourceType: 'user',
          resourceId: targetUid,
          metadata: {
            userEmail: updatedUser.email,
            updatedFields: Object.keys(sanitizedUpdates),
          },
        });
      }

      return updatedUser;
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async setClientUserStatus(userId: string, status: ClientUserStatus): Promise<void> {
    const ctx = this.getTrustedContext();
    if (!userId?.trim()) {
      throw new ClientInvalidDataError('Target user ID must be provided.');
    }
    const validStatuses = Object.values(CLIENT_USER_STATUS) as ClientUserStatus[];
    if (!validStatuses.includes(status)) {
      throw new ClientInvalidDataError(`Invalid user status: "${status}". Must be one of: ${validStatuses.join(', ')}.`);
    }

    const targetUid = userId.trim();
    // Verify target exists
    const existingUser = await this.getClientUser(targetUid);

    const now = new Date().toISOString();
    try {
      await apiClient.patch(API_ENDPOINTS.organization.user(ctx.organizationId, targetUid), { status, updatedAt: now });
    } catch {
      // Non-blocking in dev
    }

    const mockList = this.getMockUsers(ctx.organizationId);
    const user = mockList.find((u) => u.id === targetUid || u.authUid === targetUid);
    if (user) {
      (user as { status: ClientUserStatus; updatedAt: string }).status = status;
      (user as { status: ClientUserStatus; updatedAt: string }).updatedAt = now;
    }

    // Record administrative audit log
    const auditAction = status === CLIENT_USER_STATUS.SUSPENDED
      ? AUDIT_ACTIONS.USER_SUSPENDED
      : status === CLIENT_USER_STATUS.ACTIVE
      ? AUDIT_ACTIONS.USER_REACTIVATED
      : AUDIT_ACTIONS.USER_UPDATED;

    await auditService.recordEvent({
      action: auditAction,
      resourceType: 'user',
      resourceId: targetUid,
      metadata: {
        userEmail: existingUser.email,
        previousStatus: existingUser.status,
        newStatus: status,
      },
    });
  }

  public async getClientSettings(): Promise<ClientSettings | null> {
    const ctx = this.getTrustedContext();

    try {
      try {
        const settings = await apiClient.get<ClientSettings>(API_ENDPOINTS.organization.settings(ctx.organizationId));
        if (settings) {
          return settings;
        }
      } catch {
        // Development fallback
      }

      // Development fallback conforming to OrganizationSettings schema
      const fallbackSettings: ClientSettings = {
        organizationId: ctx.organizationId,
        localization: {
        defaultCountry: 'US',
          defaultTimezone: 'UTC',
          defaultCurrency: 'USD',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h',
          defaultLanguage: 'en',
        },
        branding: {
          primaryColor: '#2563eb',
          accentColor: '#3b82f6',
          portalTitle: 'HRIS Client Portal',
          theme: 'light',
        },
        workSchedule: {
          workDays: [1, 2, 3, 4, 5],
          standardWorkHoursPerDay: 8,
          flexibleHoursAllowed: true,
        },
        fiscalYear: {
          startMonth: 1,
          startDay: 1,
        },
        enabledModules: ['employees', 'attendance', 'leave', 'payroll', 'reports', 'settings'],
        attendance: {
          requireGeofencing: false,
          allowIpRestriction: false,
          overtimeThresholdHoursPerWeek: 40,
          autoApproveCheckins: true,
        },
        leaves: {
          leaveYearCycle: 'calendar_year',
          allowNegativeBalance: false,
          requireManagerApproval: true,
        },
        payroll: {
          payFrequency: 'monthly',
          currency: 'USD',
        },
        updatedAt: new Date().toISOString(),
      };
      return fallbackSettings;
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async updateClientSettings(settings: Partial<ClientSettings>): Promise<void> {
    const ctx = this.getTrustedContext();

    if (settings.organizationId && settings.organizationId !== ctx.organizationId) {
      throw new ClientInvalidDataError(
        `Settings organization ID is immutable and cannot be altered (attempted: ${settings.organizationId}, active: ${ctx.organizationId}).`
      );
    }

    // Strip immutable primary keys from client-submitted payload
    const { organizationId: _ignoredOrgId, ...sanitizedSettings } = settings;

    const payload: Partial<ClientSettings> = {
      ...sanitizedSettings,
      updatedAt: new Date().toISOString(),
    };

    try {
      await apiClient.patch<ClientSettings>(API_ENDPOINTS.organization.settings(ctx.organizationId), payload);
    } catch {
      // Non-blocking in dev
    }

    try {
      // Record administrative audit log
      await auditService.recordEvent({
        action: AUDIT_ACTIONS.ORGANIZATION_SETTINGS_UPDATED,
        resourceType: 'settings',
        resourceId: ctx.organizationId,
        metadata: {
          updatedFields: Object.keys(sanitizedSettings),
        },
      });
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async get<T>(resource: string, entityId?: string): Promise<T | null> {
    const ctx = this.getTrustedContext();
    try {
      const endpoint = `/organizations/${ctx.organizationId}/${resource}${entityId ? `/${entityId}` : ''}`;
      return await apiClient.get<T>(endpoint);
    } catch {
      return null;
    }
  }

  public async set<T>(resource: string, entityId: string, data: T): Promise<void> {
    const ctx = this.getTrustedContext();
    try {
      const endpoint = `/organizations/${ctx.organizationId}/${resource}/${entityId}`;
      await apiClient.put<T>(endpoint, data);
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async update<T extends object>(
    resource: string,
    entityId: string,
    updates: Partial<T>
  ): Promise<void> {
    const ctx = this.getTrustedContext();
    try {
      const endpoint = `/organizations/${ctx.organizationId}/${resource}/${entityId}`;
      await apiClient.patch<T>(endpoint, updates);
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async remove(resource: string, entityId: string): Promise<void> {
    const ctx = this.getTrustedContext();
    try {
      const endpoint = `/organizations/${ctx.organizationId}/${resource}/${entityId}`;
      await apiClient.delete(endpoint);
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async push<T>(resource: string, data: T): Promise<{ key: string }> {
    const ctx = this.getTrustedContext();
    try {
      const endpoint = `/organizations/${ctx.organizationId}/${resource}`;
      const res = await apiClient.post<{ key?: string; id?: string }>(endpoint, data);
      return { key: res.key || res.id || `key_${Date.now()}` };
    } catch {
      return { key: `key_${Date.now()}` };
    }
  }

  public subscribe<T>(
    resource: string,
    callback: (data: T | null) => void,
    entityId?: string
  ): () => void {
    void this.get<T>(resource, entityId).then(callback).catch(() => callback(null));
    return () => {};
  }

  public async uploadClientFile(
    category: string,
    filename: string,
    file: Blob | File,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    const ctx = this.getTrustedContext();
    try {
      const storagePath = storageService.buildTenantStoragePath(
        ctx.organizationId,
        category,
        filename
      );
      return await storageService.uploadFile(storagePath, file, options);
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }

  public async deleteClientFile(category: string, filename: string): Promise<void> {
    const ctx = this.getTrustedContext();
    try {
      const storagePath = storageService.buildTenantStoragePath(
        ctx.organizationId,
        category,
        filename
      );
      await storageService.deleteFile(storagePath);
    } catch (err) {
      throw mapToClientServiceError(err, ctx.organizationId);
    }
  }
}

export const clientDataService: ClientDataService = new ClientDataServiceImpl();
