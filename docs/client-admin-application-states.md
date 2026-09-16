# HRIS Client Admin — Global Application States Architecture

## 1. Core UX Principles

Enterprise HR software manages mission-critical business data. When network errors, data delays, or permissions prevent an action, the user must always experience clarity, calmness, and an actionable path forward.

> [!IMPORTANT]
> **The Golden Rule of Client Admin UX**
> Never leave the user staring at:
> 1. **A Blank Page**: Every view has skeletons, fallbacks, or an active loading shell.
> 2. **A Broken Component**: Any unhandled runtime exception is caught by an Error Boundary.
> 3. **An Infinite Spinner**: Every async request has timeouts, cancellation, or error states.
> 4. **An Unexplained Error**: Every error communicates what happened, why, and what recovery action to take.

---

## 2. Complete State Catalog & Components

| State Category | Component | Scope / Intended Usage | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **App Loading** | [`AppLoading`](file:///Users/aswani/Desktop/react/hris-client-web/src/components/feedback/Loading/AppLoading.tsx) | Full-screen application splash during initial boot & auth resolution | Branded icon pulse, accessible status announcer, calm explanatory copy |
| **Page Loading** | [`PageLoading`](file:///Users/aswani/Desktop/react/hris-client-web/src/components/feedback/Loading/PageLoading.tsx) | Page-level skeleton for route transitions | Breadcrumb, header, metric cards, and table content skeleton shapes |
| **Data Loading** | [`DataLoading`](file:///Users/aswani/Desktop/react/hris-client-web/src/components/feedback/Loading/DataLoading.tsx) | Card, widget, or section-level asynchronous fetch | Skeleton lines or centered spinner mode with customizable height |
| **Table Loading** | [`TableLoading`](file:///Users/aswani/Desktop/react/hris-client-web/src/components/feedback/Loading/TableLoading.tsx) | Tabular data grids (Employees, Attendance, Payroll) | Zero-layout-shift simulated table rows matching header proportions |
| **Button Loading** | [`Button`](file:///Users/aswani/Desktop/react/hris-client-web/src/components/ui/Button.tsx) | User action buttons during async mutation | Inlined spinner, preserves width, blocks duplicate clicks (`disabled + aria-busy`) |
| **Empty State** | [`EmptyState`](file:///Users/aswani/Desktop/react/hris-client-web/src/components/feedback/EmptyState.tsx) | Zero-data conditions, fresh workspaces, and empty searches | Presets: `no-employees`, `no-notifications`, `no-records`, `search-empty` |
| **Error State** | [`ErrorState`](file:///Users/aswani/Desktop/react/hris-client-web/src/components/feedback/ErrorState.tsx) | Recoverable async operational failures | Presets: `network`, `unauthorized`, `forbidden`, `server`, `validation`, `generic` |
| **Permission Denied** | [`PermissionDenied`](file:///Users/aswani/Desktop/react/hris-client-web/src/components/feedback/PermissionDenied.tsx) | 403 Forbidden / Access restricted views | Role and required permission breakdown with Return to Dashboard CTA |
| **Not Found** | [`NotFoundPage`](file:///Users/aswani/Desktop/react/hris-client-web/src/routes/NotFoundPage.tsx) | 404 Route or missing entity | 404 badge, explanation, "Go Back", and quick navigation alternatives |
| **Error Boundary** | [`ErrorBoundary`](file:///Users/aswani/Desktop/react/hris-client-web/src/components/feedback/ErrorBoundary.tsx) | React tree crash recovery | Two-tier crash protection (Root app boundary + React Router error element) |

---

## 3. Detailed Component Usage Guidelines

### 3.1 Loading States Suite

#### When to Use Skeleton vs. Spinner:
- **Use Skeletons (`PageLoading`, `TableLoading`, `DataLoading mode="skeleton"`)**:
  When replacing an existing layout or loading primary content. Skeletons prime the user's mental model and eliminate layout shifts (CLS).
- **Use Spinners (`Spinner`, `DataLoading mode="spinner"`, `Button isLoading`)**:
  For background refreshes, modal submissions, small buttons, or full-screen splash boots (`AppLoading`).

```tsx
// Example: Table Loading while fetching employee records
{isLoading ? (
  <TableLoading rows={5} columns={6} headers={['Employee', 'Role', 'Department', 'Location', 'Status', 'Actions']} />
) : (
  <EmployeeTable data={employees} />
)}
```

---

### 3.2 Empty States Presets

Empty states are never dead ends; they guide the user to the next logical action:

```tsx
// Preset: Search result empty state
<EmptyState 
  preset="search-empty" 
  action={<Button variant="secondary" onClick={clearSearch}>Clear Filters</Button>} 
/>

// Preset: Empty employee directory
<EmptyState 
  preset="no-employees" 
  action={<Button variant="primary" onClick={openAddEmployeeModal}>Add First Employee</Button>} 
/>
```

---

### 3.3 Semantic Error States

Error states use specific icons and messaging according to the failure mode:

```tsx
// Network failure (offline / timeout)
<ErrorState 
  variant="network" 
  onRetry={fetchData} 
/>

// Session expired (401)
<ErrorState 
  variant="unauthorized" 
  onSignIn={() => navigate(ROUTE_PATHS.LOGIN)} 
/>

// Server / Firebase unavailable (500)
<ErrorState 
  variant="server" 
  onRetry={fetchData} 
  error={serverError} 
/>
```

---

### 3.4 Two-Tier Error Boundary Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Root Error Boundary (<ErrorBoundary> in App.tsx)         │
│    - Protects the entire application from fatal crashes     │
│    - Actions: "Reload Application", "Try Recovering"        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Route Error Boundary (errorElement in router.tsx)        │
│    - Protects individual route elements                     │
│    - Preserves Header, Sidebar, and Navigation intact       │
│    - Actions: "Reload Page", "Return to Dashboard"          │
└─────────────────────────────────────────────────────────────┘
```

If a table or charting component throws a render error on `/payroll`, the user still has full access to the sidebar, user menu, and other modules, rather than facing a white screen.
