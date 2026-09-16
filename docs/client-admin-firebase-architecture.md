# HRIS Client Admin — Firebase Integration Architecture

## 1. Architectural Principles

This document defines the **Firebase Integration Architecture** for the HRIS Client Admin Web application.

### 1.1 The Strict Layering Rule

Direct access to Firebase SDKs from React UI components (pages, views, forms, dialogs) is strictly forbidden.

All communication must follow the 4-tier pipeline:

```text
┌──────────────────────────────────────────────┐
│ 1. UI Layer (Components & Layouts)           │
│    - Buttons, inputs, forms, navigation      │
│    - Renders visual state & captures user intent
└──────────────────────┬───────────────────────┘
                       │ Calls custom hooks / context
                       ▼
┌──────────────────────────────────────────────┐
│ 2. Feature / Context Layer                   │
│    - AuthContext, feature hooks, state store │
│    - Coordinates UX state, feedback, toasts  │
└──────────────────────┬───────────────────────┘
                       │ Invokes service contracts
                       ▼
┌──────────────────────────────────────────────┐
│ 3. Service Layer (Domain Service Boundaries) │
│    - authService, databaseService,           │
│      storageService                          │
│    - Multi-tenant pathing, validation, error │
│      translation                             │
└──────────────────────┬───────────────────────┘
                       │ Interacts with SDK
                       ▼
┌──────────────────────────────────────────────┐
│ 4. Firebase Platform (Client SDK Drivers)    │
│    - Firebase Authentication                 │
│    - Firebase Realtime Database              │
│    - Firebase Storage                        │
└──────────────────────────────────────────────┘
```

---

## 2. Service Boundaries

The service layer is structured under `src/services/` into distinct domain boundaries:

```text
src/services/
├── auth/
│   ├── auth.types.ts       # AuthService interface, credential shapes, and errors
│   ├── authService.ts      # Concrete service coordinating authentication state
│   └── index.ts            # Public barrel export
├── database/
│   ├── database.types.ts   # DatabaseService interface & Realtime DB query options
│   ├── databaseService.ts  # Multi-tenant Realtime Database path builder & operations
│   └── index.ts            # Public barrel export
├── storage/
│   ├── storage.types.ts    # StorageService interface & upload options/progress
│   ├── storageService.ts   # Multi-tenant Storage path builder & binary operations
│   └── index.ts            # Public barrel export
├── firebase/
│   ├── firebaseConfig.ts   # Environment options reader & diagnostic validation
│   ├── firebaseClient.ts   # Lifecycle coordinator managing FirebaseApp instance
│   └── index.ts            # Public barrel export
└── index.ts                # Unified services catalog
```

---

## 3. Environment Configuration

All Firebase configuration is strictly externalized into Vite environment variables. No secrets or project credentials exist within the source code.

### 3.1 Environment Catalog

| Environment Variable | Target Firebase Service | Description |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Core / Auth | Web API client key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth | OAuth and identity authorization domain |
| `VITE_FIREBASE_DATABASE_URL` | Realtime Database | Realtime Database instance endpoint URL |
| `VITE_FIREBASE_PROJECT_ID` | Core | Google Cloud / Firebase Project identifier |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage | Cloud Storage bucket URI |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging | FCM sender ID for notifications |
| `VITE_FIREBASE_APP_ID` | Core | Unique application identity string |

A developer template is provided in [`.env.example`](file:///Users/aswani/Desktop/react/hris-client-web/.env.example).

### 3.2 Configuration Validation

The application safely evaluates environment configuration on startup via [`checkFirebaseConfig()`](file:///Users/aswani/Desktop/react/hris-client-web/src/services/firebase/firebaseConfig.ts):
- Missing variables are reported gracefully without crashing or throwing unhandled exceptions.
- Services safely operate in unconfigured development mode until credentials are provided.

---

## 4. Multi-Tenant Partitioning Standards

Because the HRIS Client Admin portal serves client organizations, all database records and storage assets are strictly scoped to the tenant organization.

### 4.1 Realtime Database Hierarchy

Paths are formatted using [`databaseService.buildTenantPath(organizationId, resource, entityId)`](file:///Users/aswani/Desktop/react/hris-client-web/src/services/database/databaseService.ts):

$$\text{organizations} \,/\, \{\text{organizationId}\} \,/\, \{\text{resource}\} \,[\,/\, \{\text{entityId}\}\,]$$

Example Realtime Database structure:
```text
organizations/
└── org_acme_corp_01/
    ├── employees/
    │   └── emp_101: { firstName: "John", lastName: "Doe", role: "employee" }
    ├── attendance/
    │   └── 2026-09-04/
    │       └── emp_101: { clockIn: "09:00", clockOut: "18:00" }
    ├── leave/
    │   └── req_501: { type: "annual", days: 3, status: "pending" }
    └── settings/
        └── policies: { workDaysPerWeek: 5 }
```

### 4.2 Storage Hierarchy

Storage objects are partitioned using [`storageService.buildTenantStoragePath(organizationId, category, filename)`](file:///Users/aswani/Desktop/react/hris-client-web/src/services/storage/storageService.ts):

$$\text{organizations} \,/\, \{\text{organizationId}\} \,/\, \{\text{category}\} \,/\, \{\text{filename}\}$$

Example Storage structure:
```text
organizations/
└── org_acme_corp_01/
    ├── avatars/
    │   └── usr_alex_morgan_avatar.jpg
    ├── documents/
    │   └── emp_101_employment_contract.pdf
    └── reports/
        └── payroll_summary_aug_2026.csv
```

---

## 5. Next-Phase Integration Guide

When transitioning from the architecture foundation to live production Firebase:

1. **Install Firebase SDK**:
   ```bash
   npm install firebase
   ```
2. **Populate `.env.local`**:
   Fill in credentials from Firebase Console $\to$ Project Settings.
3. **Link SDK in [`firebaseClient.ts`](file:///Users/aswani/Desktop/react/hris-client-web/src/services/firebase/firebaseClient.ts)**:
   Import `initializeApp` from `firebase/app` and instantiate the client.
4. **Zero UI Impact**:
   Because UI components depend exclusively on [`useAuth()`](file:///Users/aswani/Desktop/react/hris-client-web/src/routes/AuthContext.ts) and service contracts, not a single UI button, form, or route component needs to be rewritten.
