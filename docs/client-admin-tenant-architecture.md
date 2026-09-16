# HRIS Client Admin — Multi-Tenant & Client Organization Architecture

This document defines the **Client/Tenant Context Architecture** for the HRIS Client Admin Web application.

---

## 1. Multi-Tenant Core Concept

The HRIS Client Admin Web is architected as a strict multi-tenant software-as-a-service (SaaS) portal. Every client company operates within an isolated tenant boundary:

```text
┌─────────────────────────────────────────────────────────────┐
│                        HRIS Platform                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ provisions
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Client Company (Organization)               │
└──────────────────────────────┬──────────────────────────────┘
                               │ employs & authorizes
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         Client Users                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ assigned
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                            Roles                            │
└──────────────────────────────┬──────────────────────────────┘
                               │ grants
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         Permissions                         │
└──────────────────────────────┬──────────────────────────────┘
                               │ enables
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        HR Operations                        │
│   (Employees, Attendance, Leaves, Payroll, Settings)        │
└─────────────────────────────────────────────────────────────┘
```

A user never exists as a standalone root entity in operational HR modules; they always belong to a specific **Client Organization**.

---

## 2. Client Organization Domain Model (`ClientOrganization`)

The client organization model represents the legal entity and tenant boundary for an HRIS enterprise customer:

```typescript
export interface ClientOrganization {
  /** Unique tenant identifier (e.g., "org_acme_corp_01") */
  readonly id: string;

  /** Commercial display / trading name */
  readonly name: string;

  /** Registered corporate legal entity name */
  readonly legalName?: string;

  /** Clean URL and subdomain slug (e.g., "acme-corp") */
  readonly slug: string;

  /** Corporate domain for email auto-discovery / SSO (e.g., "acme.com") */
  readonly domain?: string;

  /** Organization logo URL asset */
  readonly logoUrl?: string;
  readonly logo?: string; // Convenience alias

  /** Primary workplace location reference */
  readonly headquartersLocationId?: string;

  /** Corporate tax ID, EIN, or VAT registration number */
  readonly taxIdentifier?: string;

  /** Default ISO 4217 transaction currency (e.g., "USD", "EUR", "GBP") */
  readonly defaultCurrency: string;
  readonly currency?: string; // Convenience alias

  /** Default IANA timezone for attendance & scheduling (e.g., "America/New_York") */
  readonly defaultTimezone: string;
  readonly timezone?: string; // Convenience alias

  /** Two-letter ISO 3166-1 country code (e.g., "US", "GB", "DE") */
  readonly country?: string;

  /** Operational lifecycle state */
  readonly status: 'active' | 'inactive' | 'pending' | 'suspended';

  /** Organization policy and module toggle settings */
  readonly settings?: OrganizationSettings;

  /** ISO 8601 record creation timestamp */
  readonly createdAt: string;

  /** ISO 8601 record last-update timestamp */
  readonly updatedAt: string;
}
```

---

## 3. User-to-Tenant Mapping Pipeline

The relationship between an authenticated identity and a tenant company follows a 5-stage trusted pipeline:

```text
Stage 1: Firebase Auth UID
           │
           ▼
Stage 2: Root User Index Lookup (users/{uid})
           │
           ▼
Stage 3: Client Organization ID (organizations/{organizationId})
           │
           ▼
Stage 4: Tenant User Record (organizations/{organizationId}/users/{uid})
           │
           ▼
Stage 5: Role & Permissions Evaluation (roles/{roleId} -> can("resource.action"))
```

### 3.1 Mapping Flow Details

1. **Firebase Auth UID**:
   - The user authenticates via Firebase Authentication (`user.uid`).
2. **Root User Index Lookup (`users/{uid}`)**:
   - The database maintains a trusted root lookup record:
     ```json
     {
       "uid": "usr_alex_01",
       "organizationId": "org_acme_corp_01",
       "role": "org_admin",
       "email": "alex.morgan@acme.com",
       "status": "active"
     }
     ```
   - *Security*: Regular client users have read-only access to their own `users/{auth.uid}` node. Only backend cloud functions or system admin provisioning can write to this index.
3. **Tenant Organization Record (`organizations/{organizationId}/organization`)**:
   - The tenant profile is retrieved using the validated `organizationId`.
4. **Tenant User Record (`organizations/{organizationId}/users/{uid}`)**:
   - Contains tenant-specific details such as assigned departments, office locations, and linked employee ID.
5. **Role & Resolved Permissions**:
   - The user's role resolves to granular capabilities (`employees.view`, `payroll.process`, etc.) enforced in both UI components and server-side rules.

---

## 4. Security Principles & Anti-Patterns Avoided

### 4.1 Anti-Pattern 1: `localStorage.clientId`
> [!CAUTION]
> **Prohibited**: Never store `clientId` in `localStorage` or `sessionStorage` and treat it as the source of truth for authorization. A malicious client could edit `localStorage` in Developer Tools to claim membership in another tenant's workspace.

**Resolution**: The tenant ID is derived strictly from verified Firebase Auth identity claims and root database lookup records in memory.

### 4.2 Anti-Pattern 2: URL Trust (`/client/:clientId`)
> [!CAUTION]
> **Prohibited**: Never trust a client ID passed in URL path segments or query parameters as proof that the visitor belongs to that tenant company.

**Resolution**: Navigation routes in the Client Admin Web do not expose arbitrary tenant IDs in the path. URL routing is functional (`/dashboard`, `/employees`, `/payroll`), while the tenant scope is anchored strictly to the authenticated identity.

### 4.3 Defense-in-Depth: Server-Side Firebase Security Rules
Frontend tenant checks are strictly for UX. Server-side security rules enforce tenant data isolation at the infrastructure layer:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": false
      }
    },
    "organizations": {
      "$organizationId": {
        ".read": "auth != null && (root.child('users').child(auth.uid).child('organizationId').val() === $organizationId || auth.token.organizationId === $organizationId)",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('organizationId').val() === $organizationId || auth.token.organizationId === $organizationId) && (root.child('users').child(auth.uid).child('role').val() === 'org_admin' || auth.token.role === 'org_admin')"
      }
    }
  }
}
```

---

## 5. Multi-Tenant Database Resource Partitioning Standards

Every future client-owned resource must have an unambiguous tenant relationship prefixed by `organizationId`:

$$\text{organizations} \,/\, \{\text{organizationId}\} \,/\, \{\text{resource}\} \,[\,/\, \{\text{entityId}\}\,]$$

| Resource | Path Pattern | Description |
| :--- | :--- | :--- |
| **Organization Profile** | `organizations/{orgId}/organization` | Organization legal entity, currency, timezone |
| **Settings & Policies** | `organizations/{orgId}/settings` | Attendance, leave, and payroll policies |
| **Departments** | `organizations/{orgId}/departments/{deptId}` | Corporate divisions and reporting tree |
| **Locations** | `organizations/{orgId}/locations/{locId}` | Office campuses and regional hubs |
| **Roles** | `organizations/{orgId}/roles/{roleId}` | Custom and system role definitions |
| **Tenant Users** | `organizations/{orgId}/users/{uid}` | User operational scopes (departments/locations) |
| **Employees** | `organizations/{orgId}/employees/{empId}` | Workforce directory, profiles, contracts |
| **Attendance Logs** | `organizations/{orgId}/attendance/{date}/{empId}` | Daily clock-ins, timestamps, geolocation |
| **Leave Requests** | `organizations/{orgId}/leave/{requestId}` | Time-off requests, approvals, balances |
| **Payroll Runs** | `organizations/{orgId}/payroll/{payRunId}` | Pay periods, salary calculations, disbursements |

---

## 6. React Integration (`useTenant` Hook)

The tenant context is exposed to UI components via `useTenant()`:

```tsx
import { useTenant } from '@/routes';

export function CompanyBranding() {
  const { organization, organizationId, currency, timezone, isLoading } = useTenant();

  if (isLoading) {
    return <span>Loading workspace...</span>;
  }

  return (
    <div>
      <h2>{organization?.name}</h2>
      <p>Tenant ID: {organizationId}</p>
      <p>Timezone: {timezone} | Currency: {currency}</p>
    </div>
  );
}
```

### Lifecycle & State Invalidation
- **Login**: When `useAuth()` reports `isAuthenticated === true`, `TenantProvider` loads the verified tenant profile from `databaseService`.
- **Logout**: When `useAuth()` logs out, `TenantProvider` immediately purges `organization`, `organizationId`, and all cached tenant state from memory.
