# Client Admin Authorization Architecture: Roles & Permissions

This document specifies the authorization architecture for the **HRIS Client Admin Web Portal**. It defines how user identity, client organization context, operational roles, atomic permissions, navigation, UI action controls, and routes are unified, along with the authoritative backend security rules required by Firebase.

---

## 1. End-to-End Authorization Pipeline

```text
Firebase User (Firebase Authentication UID)
      ↓
Client User Record (organizations/{orgId}/users/{uid})
      ↓
Client Role (org_admin | hr_manager | payroll_admin | dept_head | employee)
      ↓
Atomic Permissions (Role Defaults + User Custom Overrides)
      ↓
Navigation Visibility (Sidebar items filtered by can(requiredPermission))
      ↓
UI Action Controls (Create, Edit, Delete, Approve guarded via PermissionButton & PermissionGate)
      ↓
Route Guards (PermissionRoute shielding pages with 403 PermissionDenied view)
      ↓
Authoritative Backend Security Rules (Firebase Realtime Database Rules)
```

---

## 2. Core Principles

### Principle 1: Never Rely on `if (user.role === "admin")`
Checking a role name directly in components is brittle and introduces security and extensibility risks:
* Roles evolve over time (e.g. an organization may introduce a custom "Junior HR Specialist" or "Regional Payroll Coordinator").
* Role checks tightly couple presentation components to specific organizational titles rather than business operations.
* **Solution**: Always query atomic capabilities using `can("resource.action")` (e.g. `can("employees.create")`, `can("leave.approve")`). System roles serve purely as preset bundles of atomic permissions.

### Principle 2: Frontend Checks Are for UX, Not Security
Frontend authorization logic (hiding buttons, blocking routes, filtering navigation) is **progressive disclosure**:
* It prevents user confusion by not showing actions they cannot perform.
* It does **not** protect data from malicious tampering. Any user with DevTools can alter client-side JavaScript memory.
* **The backend (Firebase Realtime Database Security Rules and Cloud Functions) is the ONLY authoritative security perimeter.**

### Principle 3: The Golden Security Rule
Every backend write and read must independently verify:
$$\text{Security Barrier} = \text{Authenticated User} + \text{Authorized Client Tenant} + \text{Required Permission}$$

---

## 3. Permission Taxonomy & System Roles

### Atomic Permission Keys (`RESOURCES.ACTIONS`)
Permissions follow the canonical `resource.action` dot-notation:

| Resource | Atomic Permissions |
| :--- | :--- |
| **Dashboard** | `dashboard.view` |
| **Employees** | `employees.view`, `employees.create`, `employees.edit`, `employees.delete` |
| **Attendance** | `attendance.view`, `attendance.record`, `attendance.manage` |
| **Leave** | `leave.view`, `leave.create`, `leave.apply`, `leave.approve`, `leave.manage` |
| **Payroll** | `payroll.view`, `payroll.process`, `payroll.manage` |
| **Recruitment** | `recruitment.view`, `recruitment.manage` |
| **Performance**| `performance.view`, `performance.manage` |
| **Reports** | `reports.view`, `reports.export` |
| **Settings** | `settings.view`, `settings.manage` |
| **Organization**| `organization.view`, `organization.manage` |
| **Departments** | `departments.view`, `departments.create`, `departments.edit`, `departments.delete` |

### System Role Bundles

| Role (`ClientRole`) | Scope & Description | Default Capabilities |
| :--- | :--- | :--- |
| **`org_admin`** | Full Client Organization Administrator | All permissions across all resources |
| **`hr_manager`** | Workforce, attendance, leave & HR operations | `dashboard.view`, `employees.*`, `attendance.*`, `leave.*`, `recruitment.*`, `performance.*`, `reports.*`, `settings.view` (No payroll processing) |
| **`payroll_admin`** | Compensation runs, tax filings & audit logs | `dashboard.view`, `payroll.*`, `employees.view`, `attendance.view`, `leave.view`, `reports.*` (No employee creation/deletion) |
| **`dept_head`** | Departmental management & team approvals | `dashboard.view`, `departments.view`, `employees.view`, `attendance.record`, `leave.approve`, `performance.view` |
| **`employee`** | Self-service operations | `dashboard.view`, `attendance.record`, `leave.view`, `leave.create` |

---

## 4. UI Layer Integration

### 1. Sidebar Navigation Filtering
In `src/layouts/Navigation.tsx`, menu items declare their `requiredPermission`. Accessible items are filtered at render time:
```tsx
const accessibleNavItems = navItems.filter((item) => {
  if (!item.requiredPermission) return true;
  return can(item.requiredPermission);
});
```

### 2. Route Guarding with 403 Fallback
In `src/routes/router.tsx`, every sensitive route is shielded with `<PermissionRoute>`:
```tsx
{
  path: ROUTE_PATHS.EMPLOYEES,
  element: (
    <PermissionRoute requiredPermission={PERMISSIONS.EMPLOYEES_VIEW}>
      <PageContainer title="Employee Directory">...</PageContainer>
    </PermissionRoute>
  ),
}
```
If an unauthorized user attempts direct URL navigation, `<PermissionDenied />` renders with explicit reason details and a return link.

### 3. Progressive Action Buttons
UI actions (create, edit, delete, approve) use `<PermissionButton>`:
```tsx
// Progressive disclosure: Hidden if unauthorized
<PermissionButton permission="employees.create" variant="primary">
  Add Employee
</PermissionButton>

// Disabled disclosure: Shown disabled with tooltip
<PermissionButton
  permission="leave.approve"
  disableUnauthorized={true}
  unauthorizedTooltip="Requires manager permission: leave.approve"
>
  Approve Leave
</PermissionButton>
```

---

## 5. Authoritative Backend: Firebase Realtime Database Security Rules

To enforce the Golden Rule ($\text{Auth} + \text{Tenant} + \text{Permission}$), the Firebase Realtime Database rules must be deployed as follows:

```json
{
  "rules": {
    // 1. Root User Organization Index (Auth User -> Tenant ID mapping)
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": false
      }
    },

    // 2. Tenant Organizations Tree
    "organizations": {
      "$orgId": {
        // Enforce Tenant Membership
        ".read": "auth != null && root.child('users').child(auth.uid).child('organizationId').val() === $orgId",

        // Organization profile metadata
        "organization": {
          ".read": "auth != null && root.child('users').child(auth.uid).child('organizationId').val() === $orgId",
          ".write": "auth != null && root.child('users').child(auth.uid).child('organizationId').val() === $orgId && root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'org_admin'"
        },

        // Tenant users index
        "users": {
          "$targetUid": {
            ".read": "auth != null && root.child('users').child(auth.uid).child('organizationId').val() === $orgId",
            ".write": "auth != null && root.child('users').child(auth.uid).child('organizationId').val() === $orgId && (root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'org_admin' || root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'hr_manager')"
          }
        },

        // Employee directory records
        "employees": {
          ".read": "auth != null && root.child('users').child(auth.uid).child('organizationId').val() === $orgId",
          ".write": "auth != null && root.child('users').child(auth.uid).child('organizationId').val() === $orgId && (root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'org_admin' || root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'hr_manager')"
        },

        // Leave applications and approvals
        "leave": {
          ".read": "auth != null && root.child('users').child(auth.uid).child('organizationId').val() === $orgId",
          "$leaveId": {
            // Self-service create: employee can write their own request
            ".write": "auth != null && root.child('users').child(auth.uid).child('organizationId').val() === $orgId && (newData.child('applicantId').val() === auth.uid || root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'org_admin' || root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'hr_manager' || root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'dept_head')"
          }
        },

        // Payroll records (Restricted strictly to Org Admin and Payroll Admin)
        "payroll": {
          ".read": "auth != null && root.child('users').child(auth.uid).child('organizationId').val() === $orgId && (root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'org_admin' || root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'payroll_admin')",
          ".write": "auth != null && root.child('users').child(auth.uid).child('organizationId').val() === $orgId && (root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'org_admin' || root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'payroll_admin')"
        },

        // Organization Settings
        "settings": {
          ".read": "auth != null && root.child('users').child(auth.uid).child('organizationId').val() === $orgId",
          ".write": "auth != null && root.child('users').child(auth.uid).child('organizationId').val() === $orgId && root.child('organizations').child($orgId).child('users').child(auth.uid).child('role').val() === 'org_admin'"
        }
      }
    }
  }
}
```

---

## 6. Summary of Architectural Guarantees

1. **Zero Hardcoded Permissions**: UI views never contain hardcoded capability logic; all checks flow through the centralized permission engine (`can()`, `cannot()`, `usePermission()`).
2. **Zero URL Trust**: Modifying route URLs or client IDs does not grant access; tenant identity is rooted in the authenticated Firebase Auth UID.
3. **Decoupled Roles & Actions**: Roles determine which permissions a user possesses; code checks actions (`leave.approve`), never arbitrary role strings (`role === "admin"`).
4. **Complete Separation of Concerns**:
   - `UI / Action Controls`: Progressive disclosure and feedback.
   - `Router / Layout`: Navigation filtering and route gating.
   - `Context Layer`: Reactive distribution of user identity and verified client claims.
   - `Firebase Layer`: Hard mathematical enforcement at the database wire protocol.
