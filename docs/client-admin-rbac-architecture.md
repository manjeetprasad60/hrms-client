# Client Admin RBAC Architecture: Roles, Permissions & Tenant Extensibility

## 1. Executive Summary

This specification defines the authoritative **Role-Based Access Control (RBAC)** architecture for the **HRIS Client Admin Web Portal**.

The architecture transitions the application from ad-hoc user-level permissions to a structured, scalable RBAC pipeline:

```text
User
 ↓ (assigned 1+ roles)
Role
 ↓ (encapsulates atomic capabilities)
Permissions
```

A role represents an **operational responsibility within an organization** rather than an arbitrary collection of buttons. The system strictly separates immutable platform **System Roles** from tenant-configured **Custom Roles**, guaranteeing tenant boundary isolation and preventing administrative **privilege escalation**.

---

## 2. Core RBAC Principles

### Principle 1: Principle of Meaningful Responsibility
Permissions are never assigned arbitrarily to individuals. Instead, business duties are modeled as coherent roles (e.g., *HR Manager*, *Payroll Administrator*). Users inherit permissions solely through their assigned role(s), supplemented only by emergency/temporary read-only audit overrides (`customPermissions`).

### Principle 2: Immutable System Archetypes
Platform system roles (`org_admin`, `hr_manager`, `payroll_admin`, `dept_head`, `employee`) define the foundational operational baselines. Tenant administrators cannot rename, modify, or delete system roles, nor can they strip critical access from them.

### Principle 3: Anti-Privilege Escalation Invariant
$$\text{Granted Permissions}(\text{Custom Role}) \subseteq \text{Active Permissions}(\text{Creator})$$
An administrator cannot configure or delegate a custom role containing capabilities they do not possess. Only an `Organization Admin` (`org_admin`) has unrestricted authority to provision custom roles across the full permission taxonomy.

### Principle 4: Safe Deletion & Referential Integrity
A custom role cannot be deleted or deactivated while active user accounts in the tenant remain assigned to it.

---

## 3. Data Model Specification

### TypeScript Role Interface (`src/types/role.ts`)

```typescript
export interface Role {
  /** Unique role identifier: 'role_org_admin' | 'role_custom_<uuid>' */
  readonly id: string;

  /** Organization boundary identifier */
  readonly organizationId: string;

  /** Client ID alias matching organizationId */
  readonly clientId: string;

  /** Programmatic slug/code: 'org_admin' | 'hr_manager' | 'custom_recruiter' */
  readonly code: string;

  /** Human-readable title */
  readonly name: string;

  /** Operational description of scope and duties */
  readonly description: string;

  /** Canonical list of atomic permission keys granted */
  readonly permissionIds: readonly PermissionKey[];

  /** Backward-compatible alias for permissionIds */
  readonly permissions: readonly Permission[];

  /** Lifecycle status */
  readonly status: 'active' | 'inactive' | 'archived';

  /** True if this is an immutable platform archetype */
  readonly isSystemRole: boolean;

  /** True if this is a tenant-configured custom role */
  readonly isCustomRole: boolean;

  /** List of role IDs/codes this role is permitted to delegate */
  readonly allowedAssignableRoles?: readonly string[];

  /** Optional hierarchy priority */
  readonly hierarchyLevel?: number;

  /** Audit metadata of role creator */
  readonly createdBy?: {
    readonly uid: string;
    readonly name?: string;
    readonly email?: string;
  };

  readonly createdAt: string;
  readonly updatedAt: string;
}
```

---

## 3.5. Permission Architecture & Domain Taxonomy

### Canonical `resource.action` Structure
All atomic capabilities conform strictly to the dot-notation standard:

$$\text{Permission Key} = \text{resource} \,.\, \text{action}$$

Examples:
* `organization.view`, `organization.edit`
* `users.view`, `users.invite`, `users.create`, `users.edit`, `users.suspend`, `users.delete`
* `roles.view`, `roles.create`, `roles.edit`, `roles.delete`
* `employees.view`, `attendance.view`, `leave.approve`, `payroll.process`

### Conceptual Categories & Implemented Status

Permissions are organized into 10 resource domain categories in `src/permissions/registry.ts`:

| Category | Scope & Purpose | Phase Status | Example Permissions |
| :--- | :--- | :--- | :--- |
| **Organization** | Workspace identity, localization, legal entities | **Implemented** | `organization.view`, `organization.edit`, `organization.manage` |
| **Users** | User directory, invitations, account lifecycles | **Implemented** | `users.view`, `users.invite`, `users.create`, `users.edit`, `users.suspend`, `users.delete` |
| **Roles** | RBAC definition, system inspection, custom roles | **Implemented** | `roles.view`, `roles.create`, `roles.edit`, `roles.delete`, `roles.manage` |
| **Settings** | Configuration preferences, work policies | **Implemented** | `settings.view`, `settings.manage` |
| **Dashboard** | Overview analytics, operational KPIs | **Implemented** | `dashboard.view` |
| **Employees** | Workforce directory, worker profiles, job changes | *Future Module* | `employees.view`, `employees.create`, `employees.edit`, `employees.delete` |
| **Attendance** | Time tracking, clock-in/out, shift policies | *Future Module* | `attendance.view`, `attendance.record`, `attendance.manage` |
| **Leave** | Time-off balances, leave requests & approvals | *Future Module* | `leave.view`, `leave.create`, `leave.apply`, `leave.approve`, `leave.manage` |
| **Payroll** | Compensation cycles, disbursements, tax reports | *Future Module* | `payroll.view`, `payroll.process`, `payroll.manage` |
| **Recruitment** | Job openings, candidate pipelines, interviews | *Future Module* | `recruitment.view`, `recruitment.manage` |
| **Reports** | Analytics exports, compliance summaries | *Future Module* | `reports.view`, `reports.export` |


---

## 4. System Roles vs. Custom Roles

| Attribute | System Role (`isSystemRole: true`) | Custom Role (`isCustomRole: true`) |
| :--- | :--- | :--- |
| **Scope** | Platform-wide archetype, active in all tenant organizations | Tenant-isolated (`organizations/{orgId}/roles/{roleId}`) |
| **Manageability** | Read-only. Modifications & deletions rejected with 403 Forbidden | Full CRUD permitted by authorized admins (`ROLES_MANAGE`) |
| **Identifier Prefix** | `role_<system_code>` (e.g. `role_org_admin`) | `role_custom_<slug>_<timestamp>` |
| **Permission Scope** | Pre-configured baseline across all standard modules | User-configured subset of creator's permissions |
| **Deletion Guard** | Permanent. Impossible to delete | Blocked if assigned to active users in the tenant |

---

## 5. Built-in System Roles Catalog

### 1. Organization Administrator (`org_admin`)
- **Responsibility**: Complete executive and technical control of the client workspace.
- **Capabilities**: All permissions across organization settings, workforce directory, compensation, security policies, user management, and custom roles.
- **Delegation**: Can assign and manage all system and custom roles.

### 2. HR Manager (`hr_manager`)
- **Responsibility**: People operations, workforce management, company structure, and HR governance.
- **Capabilities**: Full access to employee directory, departments, locations, attendance logs, leave policies & approvals, and general settings.
- **Exclusions**: Cannot run payroll disbursements or modify core client organization billing/identity.
- **Delegation**: Can assign `hr_manager`, `payroll_admin`, `dept_head`, `employee`, and non-admin custom roles.

### 3. Payroll Administrator (`payroll_admin`)
- **Responsibility**: Compensation calculation, payroll cycle execution, and tax compliance.
- **Capabilities**: View workforce directory, process payroll, review attendance summaries, and export financial reports.
- **Exclusions**: Cannot create or terminate employee accounts or modify department structures.

### 4. Department Head (`dept_head`)
- **Responsibility**: Frontline management of assigned departmental teams.
- **Capabilities**: Review departmental member profiles, approve timesheets, approve leave requests, and view team reports.
- **Exclusions**: Cannot alter cross-departmental records or organizational policies.

### 5. Employee (`employee`)
- **Responsibility**: Standard workforce self-service access.
- **Capabilities**: View personal dashboard, record daily attendance / clock-in, apply for leave, and view personal compensation history.
- **Exclusions**: No administrative access.

---

## 6. Realtime Database Path & Security Layout

All custom roles are stored strictly within the tenant's isolated subtree:

```text
organizations/
  └── {organizationId}/
        ├── organization/         <-- Profile & identity
        ├── users/                <-- Tenant workforce records
        ├── invitations/          <-- Pending/accepted invites
        └── roles/                <-- Tenant custom roles
              └── {roleId}/
                    ├── id: "role_custom_recruiter_abc"
                    ├── organizationId: "{orgId}"
                    ├── code: "custom_recruiter"
                    ├── name: "Recruitment Coordinator"
                    ├── description: "Manages hiring pipelines"
                    ├── permissionIds: ["dashboard.view", "recruitment.manage"]
                    ├── status: "active"
                    ├── isSystemRole: false
                    ├── isCustomRole: true
                    └── createdAt: "2026-09-06T12:00:00Z"
```

### Security Rules Contract
```json
{
  "rules": {
    "organizations": {
      "$orgId": {
        "roles": {
          ".read": "auth != null && root.child('organizations').child($orgId).child('users').child(auth.uid).exists()",
          "$roleId": {
            ".write": "auth != null && (root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'org_admin' || root.child('organizations').child($orgId).child('users').child(auth.uid).child('permissions').hasChild('roles.manage')) && !data.child('isSystemRole').val() === true"
          }
        }
      }
    }
  }
}
```

---

## 7. Extensibility Blueprint for Future HR Modules

As the HRIS platform introduces new business domains (e.g. *Recruitment*, *Performance Management*, *Expense Reimbursement*), the RBAC architecture scales linearly without refactoring:

1. **Register Resources & Actions**:
   Declare domain keys in `src/permissions/resources.ts` (e.g. `EXPENSES: 'expenses'`).
2. **Define Atomic Permissions**:
   Add granular operations in `src/permissions/permissions.ts` (`expenses.view`, `expenses.submit`, `expenses.approve`).
3. **Provision System Role Baseline or Custom Role**:
   Assign the atomic keys to relevant system roles (`hr_manager`, `org_admin`) or create specialized custom roles (`Expense Auditor`).
