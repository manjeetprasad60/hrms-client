# Client User Authorization Architecture

## 1. Core Authorization Pipeline

In the HRIS Client Admin Web application, user access and capabilities are resolved strictly through a deterministic 5-tier authorization pipeline:

```text
Firebase Auth UID
        ↓
   Client User
        ↓
Client Organization
        ↓
     Role(s)
        ↓
   Permissions
        ↓
   Navigation & UI Actions
        ↓
     Routes
```

---

## 2. Separation of Concerns: Identity vs. Authorization

A critical principle of multi-tenant enterprise SaaS is that **Authentication is distinct from Authorization**:

| Concern | Responsibility | Questions Answered | Authoritative System |
| :--- | :--- | :--- | :--- |
| **Authentication Identity** | Verify identity credentials, password hashes, OAuth tokens, and email verification status. | *"Who is this user?"*<br/>*"Is their identity authentic?"* | Firebase Authentication (`FirebaseUser`) |
| **Tenant Authorization** | Determine tenant membership, assigned administrative roles, organizational permissions, departmental scopes, and account lifecycle. | *"What is this user allowed to do inside this organization?"*<br/>*"Which departments can they manage?"* | Client User Record (`ClientUser`) under `organizations/{orgId}/users/{uid}` |

### Why Firebase Auth Alone is Insufficient
- Firebase Authentication is a global identity system with no innate understanding of tenant tenancy boundaries, organizational departments, approval hierarchies, or HRIS employee records.
- If a user changes email or links a new identity provider, their organizational authorization record (`ClientUser`) maintains stability via `authUid` and `organizationId`.

---

## 3. Client User Data Model

The `ClientUser` contract ([`src/types/user.ts`](file:///Users/aswani/Desktop/react/hris-client-web/src/types/user.ts)) defines the authoritative tenant-scoped user profile:

```typescript
export interface ClientUser {
  readonly id: string;                    // Tenant user record ID (matches Firebase Auth UID)
  readonly authUid: string;               // Direct link to Firebase Authentication UID
  readonly organizationId: string;        // Permanent tenant boundary identifier
  readonly clientId?: string;             // Canonical alias for organizationId
  readonly email: string;                 // User corporate email address
  readonly firstName: string;             // Given name
  readonly lastName: string;              // Family name
  readonly displayName?: string;          // Formatted full display name
  readonly phone?: string;                // Direct phone/mobile number
  readonly phoneNumber?: string;          // Formatted phone number alias
  readonly photoURL?: string;             // Firebase Auth photo URL
  readonly avatarUrl?: string;            // Application avatar URL
  readonly role: ClientRole;              // Primary role (org_admin, hr_manager, etc.)
  readonly roleId?: string;               // Single role reference
  readonly roleIds?: readonly string[];   // Multi-role capability
  readonly customPermissions?: readonly string[]; // Granular permission overrides
  readonly departmentIds: readonly string[];      // Assigned organizational departments
  readonly locationIds: readonly string[];        // Assigned operating work locations
  readonly employeeId?: string;           // Direct reference to HR employee profile
  readonly isEmailVerified: boolean;      // Authentication verification flag
  readonly status: ClientUserStatus;      // Application lifecycle status
  readonly lastLoginAt?: string;          // ISO 8601 sign-in timestamp
  readonly createdAt: string;             // ISO 8601 provisioning timestamp
  readonly updatedAt: string;             // ISO 8601 modification timestamp
}
```

---

## 4. User Status Lifecycle

Application-user status is maintained independently of Firebase Auth token status:

```text
       ┌───────────┐
       │  INVITED  │ ── User invited by Organization Admin, pending initial onboarding
       └─────┬─────┘
             │ Onboarding complete
             ▼
       ┌───────────┐
       │  ACTIVE   │ ── Full operational access within assigned roles and permissions
       └─────┬─────┘
             ├──────────────────────────┐
             ▼                          ▼
      ┌─────────────┐            ┌──────────────┐
      │  SUSPENDED  │            │   DISABLED   │
      └─────────────┘            └──────────────┘
      Temporary freeze           Permanent deactivation /
      (e.g., billing hold,       offboarding archive
      security investigation)
```

### Server-Side Security Enforcement
Firebase Realtime Database Security Rules actively enforce this lifecycle. Every client data read and write requires:
```javascript
root.child('organizations').child($orgId).child('users').child(auth.uid).child('status').val() === 'active'
```
Any user in `suspended`, `disabled`, or `invited` status is blocked at the database level from accessing protected HRIS operational records.
