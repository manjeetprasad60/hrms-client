# Firebase Realtime Database Security Rules Specification

This document provides the technical specification and security verification model for the **Firebase Realtime Database Security Rules** governing the HRIS Client Web Portal.

---

## 1. Security Objective & Threat Model

The primary objective is to guarantee **strict multi-tenant isolation** directly at the database protocol layer.

```text
User A (Client A Member)  →  organizations/org_acme_01/employees  →  ALLOWED
User A (Client A Member)  →  organizations/org_globex_02/employees →  DENIED (Cross-Tenant)
User B (Client B Member)  →  organizations/org_globex_02/employees →  ALLOWED
Anonymous Visitor         →  organizations/org_acme_01/employees  →  DENIED (Unauthenticated)
```

### Threats Mitigated

| Threat Vector | Mechanism | Database Rule Mitigation |
| :--- | :--- | :--- |
| **URL Tampering** | Changing route to `/client/other-org` | Database rejects queries: `$orgId` must match `root.child('users').child(auth.uid).child('organizationId')`. |
| **Browser State Manipulation** | Editing `localStorage` or memory state | Database rules do not inspect browser storage; claims are verified against the authoritative server database index. |
| **Privilege Escalation** | Employee modifying their role to `org_admin` | Rule checks `(!newData.child('role').exists() || newData.child('role').val() === data.child('role').val())` on self-edits. |
| **Cross-Tenant Intrusion** | Tampered WebSocket packets to another tenant | Rule validates tenant membership at every single read and write. |
| **Suspended Account Access** | User or organization deactivated after login | Rule continuously checks `status === 'active'` for both organization and user. |

---

## 2. The 4-Tier Authorization Formula

Every client-scoped read and write operation requires all 4 conditions to evaluate to `true`:

$$\text{Authorized} = \underbrace{\text{auth} \neq \text{null}}_{\text{Tier 1: Authentication}} \land \underbrace{\text{user.orgId} = \$orgId}_{\text{Tier 2: Tenant Membership}} \land \underbrace{\text{org.status} = \text{'active'}}_{\text{Tier 3: Client Active}} \land \underbrace{\text{user.status} = \text{'active'}}_{\text{Tier 4: Account Active}}$$

Once Tier 1 through 4 pass, the specific **Capability / Role Rule** is evaluated.

---

## 3. Node-by-Node Security Matrix

### 1. Root User Index (`/users/$uid`)
* **Path**: `/users/{uid}`
* **Read**: `auth != null && auth.uid === $uid` (User may only inspect their own tenant assignment).
* **Write**: `false` (Immutable from the web client; provisioned strictly by backend Cloud Functions or administrative setup).

### 2. Tenant Profile & Settings (`/organizations/$orgId/organization` & `/settings`)
* **Read**: Active client members.
* **Write**: Strictly restricted to `org_admin`.

### 3. Client Users Index (`/organizations/$orgId/users/$targetUid`)
* **Read**: Active client members.
* **Write**:
  * `org_admin` or `hr_manager` can provision or modify client accounts.
  * Self (`auth.uid === $targetUid`) can update non-sensitive personal fields (such as phone or avatar), but **CANNOT** alter `role`, `status`, `organizationId`, or `customPermissions`.

### 4. Employee Directory (`/organizations/$orgId/employees`)
* **Read**: `org_admin`, `hr_manager`, `payroll_admin`, `dept_head` (`can: employees.view`).
* **Write**: `org_admin`, `hr_manager` (`can: employees.create`, `employees.edit`, `employees.delete`).
* Standard employees without elevated roles cannot view or edit this node.

### 5. Attendance Records (`/organizations/$orgId/attendance`)
* **Read**:
  * Managers (`org_admin`, `hr_manager`, `payroll_admin`, `dept_head`) can read all attendance logs.
  * Employees can only read their own logs (`data.child('employeeId').val() === auth.uid`).
* **Write**:
  * Managers can log or adjust attendance entries.
  * Employees can create check-in logs strictly for themselves (`newData.child('employeeId').val() === auth.uid`).

### 6. Leave Applications (`/organizations/$orgId/leave`)
* **Read**: Managers or applicant (`data.child('applicantId').val() === auth.uid`).
* **Write**:
  * Employees can submit time-off applications for themselves (`newData.child('applicantId').val() === auth.uid`).
  * Managers (`org_admin`, `hr_manager`, `dept_head`) can approve, reject, or adjust leave requests.

### 7. Payroll & Compensation (`/organizations/$orgId/payroll`)
* **Read & Write**: Strictly restricted to `org_admin` and `payroll_admin`.
* HR Managers and general employees receive immediate permission denials at the database level.

### 8. Analytics & Reports (`/organizations/$orgId/reports`)
* **Read**: `org_admin`, `hr_manager`, `payroll_admin`, `dept_head`.
* **Write**: `org_admin`, `hr_manager`, `payroll_admin`.

---

## 4. Role Authorization Matrix

| Path / Resource | Org Admin | HR Manager | Payroll Admin | Dept Head | Employee | Cross-Tenant User |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `/users/$uid` (Own) | Read | Read | Read | Read | Read | Denied (Other's UID) |
| `/organizations/$orgId/organization` | Read/Write | Read | Read | Read | Read | Denied |
| `/organizations/$orgId/settings` | Read/Write | Read | Read | Read | Read | Denied |
| `/organizations/$orgId/users` | Read/Write | Read/Write | Read | Read | Read/Self* | Denied |
| `/organizations/$orgId/employees` | Read/Write | Read/Write | Read | Read | Denied | Denied |
| `/organizations/$orgId/attendance` | Read/Write | Read/Write | Read | Read | Self Only | Denied |
| `/organizations/$orgId/leave` | Read/Write | Read/Write | Read | Read/Approve | Self Only | Denied |
| `/organizations/$orgId/payroll` | Read/Write | **DENIED** | Read/Write | **DENIED** | **DENIED** | Denied |
| `/organizations/$orgId/reports` | Read/Write | Read/Write | Read/Write | Read | **DENIED** | Denied |

*\*Self update on `/users/$targetUid` forbids altering `role`, `status`, `organizationId`, or `customPermissions`.*

---

## 5. Insecure Anti-Patterns Avoided

1. **No Wildcard Authenticated Access**:
   * Prohibited: `".read": "auth != null"`, `".write": "auth != null"`
   * Consequence: Avoided allowing any logged-in user to query other client organizations.
2. **No Public Read Access**:
   * Prohibited: `".read": true`, `".write": true`
   * Consequence: Zero public leakage of HRIS records.
3. **No Sole Frontend Role Trust**:
   * Prohibited: Trusting client claims without database validation.
   * Consequence: Malicious clients cannot bypass authorization by spoofing React state.
