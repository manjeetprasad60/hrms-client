# HRIS Client Admin — Dashboard Architecture & Specification

## 1. Executive Overview

The **Client Admin Dashboard** (`/dashboard`) serves as the central operational cockpit for company administrators, HR managers, department heads, and supervisors. It provides an immediate snapshot of organization health, pending approvals, critical workflows, and real-time audit activity.

---

## 2. Core Architecture Principles

### 2.1 Zero Fake Business Data Policy
Enterprise HR platforms manage sensitive payroll, attendance, and personnel records. The Client Admin Web adheres strictly to the rule:
> **Never invent realistic employee headcounts, dollar balances, or fake compliance percentages to simulate data.**

- Metric values default strictly to placeholder indicators (`—`).
- Every unlinked metric is explicitly flagged with a `Pending Sync` status badge.
- When Firebase Realtime Database is connected in subsequent phases, metrics will dynamically update from zero or live values rather than displaying fabricated mock data.

### 2.2 Component Hierarchy & Modularity

The dashboard is structured into decoupled, single-responsibility components located in `src/features/dashboard/components/`:

```
DashboardOverview (Orchestrator)
  ├── PageContainer (Breadcrumbs, Title, Meta)
  ├── DashboardWelcomeHeader (User greeting, Tenant ID, Role badge, Quick actions)
  ├── DashboardKpis (4 responsive operational metric cards)
  ├── DashboardQuickActions (6 permission-gated administrative triggers)
  ├── Dual Operations Grid (Desktop 2-col, Mobile 1-col)
  │     ├── DashboardPendingActions (Approval queue with EmptyState preset)
  │     └── DashboardRecentActivity (Audit stream with EmptyState preset)
  └── Platform Architecture Readiness (Service boundary status indicators)
```

---

## 3. Section Specifications

### 3.1 Welcome Header & Company Context (`DashboardWelcomeHeader.tsx`)
- **Data Source**: Reactive `useAuth()` hook.
- **Organization Metadata**:
  - Organization Name: `session.organization.name` (e.g., "Acme Corp")
  - Tenant ID: `session.organization.id` / `user.organizationId` (e.g., `org_acme_corp_01`)
  - User Identity: `user.firstName` + `user.lastName`
  - Assigned Role: Canonical translation (e.g., `org_admin` $\rightarrow$ "Organization Administrator")
  - System Status: `Tenant Active` (Green badge)
- **Header Actions**:
  - `Add Employee` (`PermissionButton` guarded by `employees.create`)
  - `Organization Settings` (`PermissionButton` guarded by `settings.manage`)

### 3.2 Key Performance Indicators (`DashboardKpis.tsx`)
Four primary operational domains are monitored:

| Metric | Resource Permission | Placeholder State | Purpose |
| :--- | :--- | :--- | :--- |
| **Active Employees** | `employees.view` | `—` / `Pending Sync` | Headcount of active personnel in organization directory |
| **Today's Attendance** | `attendance.view` | `—` / `Pending Sync` | Real-time shift clock-in tally vs expected roster |
| **Pending Leave Requests** | `leave.view` | `—` / `Pending Sync` | Count of vacation, sick, and personal time-off applications |
| **Current Pay Period** | `payroll.view` | `—` / `Pending Sync` | Active payroll cycle status and deadline |

### 3.3 Quick Operational Actions (`DashboardQuickActions.tsx`)
Frequent administrative operations are exposed as actionable tiles:
1. **Add New Employee**: Guarded by `PERMISSIONS.EMPLOYEES_CREATE` (`employees.create`).
2. **Review Leave Requests**: Guarded by `PERMISSIONS.LEAVE_APPROVE` (`leave.approve`).
3. **Record Attendance**: Guarded by `PERMISSIONS.ATTENDANCE_RECORD` (`attendance.record`).
4. **Generate HR Reports**: Guarded by `PERMISSIONS.REPORTS_EXPORT` (`reports.export`).
5. **Manage Departments**: Guarded by `PERMISSIONS.DEPARTMENTS_VIEW` (`departments.view`).
6. **Organization Settings**: Guarded by `PERMISSIONS.SETTINGS_MANAGE` (`settings.manage`).

Each action leverages `PermissionButton` with `disableUnauthorized={true}`, ensuring users without the necessary permission see a disabled button with an explanatory tooltip (`Requires permission: ...`).

### 3.4 Pending Approvals Queue (`DashboardPendingActions.tsx`)
- Displays workforce requests requiring managerial review (leave approvals, shift swaps, profile changes).
- Utilizes the reusable `EmptyState` component (`preset="no-records"`) when no pending items exist:
  - Title: *"No pending requests"*
  - Description: *"All submitted employee leave applications, shift adjustments, and profile changes have been resolved."*
  - CTA: *"Open Approval Queue"* (`leave.view` permission)
- Includes live approval listener telemetry indicator showing idle connection status.

### 3.5 Recent Organization Activity (`DashboardRecentActivity.tsx`)
- Displays the organization audit trail (logins, onboarding events, security changes).
- Utilizes `EmptyState` component (`preset="no-notifications"`):
  - Title: *"No activity recorded"*
  - Description: *"Operational events, team onboarding milestones, and administrative updates will appear here once actions begin."*
  - CTA: *"View Full Audit Trail"* (`reports.view` permission)
- Telemetry footer indicates audit stream connection to Cloud Storage / Realtime Database.

---

## 4. Responsive Design & Breakpoints

The dashboard is designed for seamless usability across all device tiers:

| Breakpoint | Target Devices | Layout Adjustments |
| :--- | :--- | :--- |
| **Desktop** ($> 1024\text{px}$) | Desktop monitors, large laptops | 4-column KPI grid, 3-column quick actions, 2-column split for approvals and activity feeds. Full sidebar visible. |
| **Tablet** ($641\text{px} - 1024\text{px}$) | iPads, tablets, narrow windows | 2-column KPI grid, 2-column quick actions, 1-column stacked split for approvals and activity. Drawer-based collapsible sidebar. |
| **Mobile** ($\le 640\text{px}$) | Smartphones | Single-column linear layout. Full-width touch-friendly buttons (minimum 44px tap targets). Mobile menu trigger in sticky topbar. |

---

## 5. Future Firebase Integration Blueprint

Connecting live Firebase Realtime Database feeds will require zero changes to the UI layer:

```text
Firebase Realtime Database
        ↓
databaseService.subscribeToPath(`organizations/${orgId}/telemetry`, callback)
        ↓
useDashboardTelemetry() custom hook
        ↓
DashboardKpis & DashboardPendingActions (replaces '—' with live counts)
```

The strict separation of concerns established in Step 8 (Service Boundary Architecture) ensures the UI remains fully decoupled from Firebase SDK implementations.
