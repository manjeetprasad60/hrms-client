# HRIS Client Admin — Permission Architecture

## 1. Executive Summary

This document defines the **Permission Architecture** for the HRIS Client Admin Web application.

The architecture enforces a strict **Role-Based Access Control (RBAC)** model layered on top of an atomic **Resource + Action** taxonomy, ensuring predictable, scalable, and audit-ready capability checks across the entire client-company web portal.

---

## 2. Conceptual Permission Hierarchy

The permission model follows the unidirectional flow:

```
User (Authenticated Session)
  │
  ▼
Role (System or Custom Organization Role)
  │
  ▼
Permissions (Granted Capabilities Set)
  │
  ▼
Resource + Action (e.g., employees.create, leave.approve)
```

1. **User**: The client company staff member authenticated in the workspace.
2. **Role**: The assigned administrative or functional role within the client tenant (e.g. `Organization Admin`, `HR Manager`, `Payroll Administrator`).
3. **Permissions**: The set of fine-grained, atomic capability strings granted by the role (plus any tenant-specific custom permission overrides).
4. **Resource + Action**: The target operational domain and the operation to be performed.

---

## 3. Resource + Action Taxonomy

All permissions in the Client Admin Web follow the canonical format:

$$\text{resource} \,.\, \text{action}$$

### 3.1 Domain Resources
| Resource Key | Domain Scope |
| :--- | :--- |
| `organization` | Company legal entity profile, branding, registration data |
| `departments` | Organizational tree, business units, department teams |
| `locations` | Work offices, geographic sites, operational branches |
| `users` | Client workspace user accounts, invitations, credentials |
| `roles` | Client RBAC roles, permission sets, security policies |
| `employees` | Staff profiles, directory listings, personal records, contracts |
| `attendance` | Work shifts, daily check-in logs, biometric timesheets |
| `leave` | Time-off entitlement, balances, applications, approvals |
| `payroll` | Compensation structures, salary runs, payslips, tax withholding |
| `recruitment` | Job requisitions, applicant tracking, interview schedules |
| `performance` | Appraisal reviews, KPI goal tracking, 360-degree feedback |
| `reports` | Workforce analytics, compliance audits, headcount summaries |
| `settings` | Working hours, company policies, localization rules |

### 3.2 Domain Actions
| Action Key | Operational Meaning |
| :--- | :--- |
| `view` | Read-only inspection of records, lists, or operational pages |
| `create` | Instantiation of new entity records |
| `edit` | Modification of existing entity attributes |
| `delete` | Permanent removal or soft-archival of entity records |
| `manage` | Full administrative custody over the resource lifecycle |
| `record` | Clocking in/out or logging time entries |
| `apply` | Submitting a formal operational request (e.g., leave application) |
| `approve` | Managerial authorization or rejection of requests |
| `process` | Executing bulk or state-changing operations (e.g., payroll disbursements) |
| `export` | Downloading or exporting sensitive compliance reports and data |

---

## 4. Role-to-Permission Matrix

| Permission Key | Organization Admin | HR Manager | Payroll Admin | Department Head | Employee |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `organization.view` | ✅ | ✅ | ✅ | ✅ | — |
| `organization.manage` | ✅ | — | — | — | — |
| `departments.view` | ✅ | ✅ | — | ✅ | — |
| `departments.create` | ✅ | ✅ | — | — | — |
| `departments.edit` | ✅ | ✅ | — | — | — |
| `departments.delete` | ✅ | — | — | — | — |
| `locations.view` | ✅ | ✅ | — | — | — |
| `locations.create` | ✅ | — | — | — | — |
| `locations.edit` | ✅ | — | — | — | — |
| `locations.delete` | ✅ | — | — | — | — |
| `users.view` | ✅ | ✅ | — | — | — |
| `users.manage` | ✅ | — | — | — | — |
| `roles.view` | ✅ | — | — | — | — |
| `roles.manage` | ✅ | — | — | — | — |
| `employees.view` | ✅ | ✅ | ✅ | ✅ | — |
| `employees.create` | ✅ | ✅ | — | — | — |
| `employees.edit` | ✅ | ✅ | — | — | — |
| `employees.delete` | ✅ | ✅ | — | — | — |
| `attendance.view` | ✅ | ✅ | ✅ | ✅ | — |
| `attendance.record` | ✅ | ✅ | — | ✅ | ✅ |
| `attendance.manage` | ✅ | ✅ | — | — | — |
| `leave.view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `leave.apply` | ✅ | ✅ | — | ✅ | ✅ |
| `leave.approve` | ✅ | ✅ | — | ✅ | — |
| `leave.manage` | ✅ | ✅ | — | — | — |
| `payroll.view` | ✅ | — | ✅ | — | — |
| `payroll.process` | ✅ | — | ✅ | — | — |
| `payroll.manage` | ✅ | — | ✅ | — | — |
| `recruitment.view` | ✅ | ✅ | — | — | — |
| `recruitment.manage`| ✅ | ✅ | — | — | — |
| `performance.view` | ✅ | ✅ | — | ✅ | — |
| `performance.manage`| ✅ | ✅ | — | — | — |
| `reports.view` | ✅ | ✅ | ✅ | ✅ | — |
| `reports.export` | ✅ | ✅ | ✅ | — | — |
| `settings.view` | ✅ | ✅ | — | — | — |
| `settings.manage` | ✅ | — | — | — | — |

---

## 5. UI Permission Behavior Patterns

The architecture equips the UI with 5 progressive disclosure layers:

### 5.1 Navigation Filtering
Sidebar items define their required permissions:
```tsx
const { can } = usePermission();
const visibleItems = navItems.filter(item => !item.requiredPermission || can(item.requiredPermission));
```
Unauthorized modules are removed from the navigation tree to prevent UI clutter and cognitive load.

### 5.2 Buttons: Progressive Disclosure vs. Disabled Guidance
Components can choose between hiding buttons or rendering them disabled with contextual tooltips:
```tsx
// Option A: Hide completely (default)
<PermissionButton permission="employees.create" variant="primary">
  Add Employee
</PermissionButton>

// Option B: Keep visible but disabled with explanatory tooltip
<PermissionButton 
  permission="payroll.process" 
  variant="primary" 
  disableUnauthorized={true}
  unauthorizedTooltip="Requires Payroll Administrator role"
>
  Disburse Salaries
</PermissionButton>
```

### 5.3 Actions & Component Gates
Declarative wrapping using `<Can>` or `<ActionGuard>`:
```tsx
<Can I="leave.approve" fallback={<span>Approval assigned to Department Head</span>}>
  <Button variant="primary" onClick={handleApprove}>Approve Leave</Button>
</Can>
```

### 5.4 Page Containers
Entire sections or cards can be gated using declarative permission wrappers.

### 5.5 Routes & URL Protection
`<PermissionRoute>` ensures that direct URL navigation (e.g. typing `/payroll` or clicking a deep link) cannot bypass authorization:
```tsx
<PermissionRoute requiredPermission={PERMISSIONS.PAYROLL_VIEW}>
  <PayrollPage />
</PermissionRoute>
```
Unauthorized attempts render a standardized **403 Access Restricted** view with the current role, the required permission, and a direct navigation back to the Dashboard.

---

## 6. Critical Security Principle: Frontend Checks vs. Backend Authorization

> [!CAUTION]
> **Fundamental Security Boundary Rule**
> Frontend permission evaluations (`can("...")`, `<Can>`, `<PermissionRoute>`) are strictly for **User Experience (UX), progressive disclosure, and workflow assistance**.
>
> They MUST NEVER be treated as the final security boundary.

### 6.1 Why Frontend Checks Are Insecure in Isolation
1. **Client-side Code is Modifiable**: Any user can open Chrome DevTools, modify JavaScript variables, flip `can()` to return `true`, un-hide buttons, or trigger client functions.
2. **Network Requests are Independent**: A malicious user or compromised machine can dispatch HTTP/REST/WebSocket requests directly to backend endpoints, completely bypassing the browser UI.
3. **State Invalidation Latency**: If an employee's role is revoked on the server, client-side cached sessions might still believe they have permissions until the session is refreshed.

### 6.2 The Defense-in-Depth Architecture
True security requires **two independent, cooperating layers**:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Frontend UX Layer (Client Admin Web)                     │
│    - Responsive navigation filtering                        │
│    - Button visibility / disabled hints                     │
│    - Friendly 403 fallback views                            │
│    - Purpose: User Experience & Clarity                     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / Firestore Requests
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend Security Layer (Firebase / Cloud Functions)      │
│    - Firebase Auth Cryptographic JWTs (Custom Claims)       │
│    - Firestore Security Rules (Tenant-isolated read/write)  │
│    - Cloud Storage Rules (Secure document isolation)        │
│    - Purpose: Authoritative Security & Zero Trust Boundary  │
└─────────────────────────────────────────────────────────────┘
```

When Firebase backend integration is plugged in during the upcoming phase:
- Firestore security rules will independently enforce:
  ```
  match /organizations/{orgId}/employees/{employeeId} {
    allow read: if request.auth != null && hasPermission(request.auth, 'employees.view');
    allow write: if request.auth != null && hasPermission(request.auth, 'employees.edit');
  }
  ```
- Any unauthorized network operation will be rejected with an immediate `403 Forbidden` response from the Firebase server regardless of client state.
