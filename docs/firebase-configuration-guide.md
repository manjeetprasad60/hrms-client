# Firebase Configuration Guide — HRIS Client Admin Web

This guide documents the centralized Firebase configuration architecture, environment variable management, multi-environment tiers, and security model for the HRIS Client Admin Web application.

---

## 1. Architectural Overview

The HRIS Client Admin Web enforces strict architectural separation between user interface components and external infrastructure SDKs. Direct imports of `firebase/app`, `firebase/auth`, `firebase/database`, or `firebase/storage` inside React UI components are strictly forbidden.

```
UI Components (Buttons, Tables, Forms)
          ↓
Feature Hooks (e.g., useAuth, useEmployees)
          ↓
Service Boundaries (services/auth, services/database, services/storage)
          ↓
Firebase Client Coordinator (services/firebase/firebaseClient.ts)
          ↓
Centralized Configuration (config/firebase.ts)
          ↓
Vite Environment Variables (import.meta.env.VITE_FIREBASE_*)
          ↓
Firebase Modular Web SDK (v12)
```

---

## 2. Environment Variables Specification

All Firebase client credentials must be provided using standard Vite environment variables prefixed with `VITE_`:

| Environment Variable | Required | Description | Example Format |
| :--- | :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Yes | Google Cloud / Firebase Web API key | `AIzaSyB...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Authentication handler domain | `hris-client-admin-dev.firebaseapp.com` |
| `VITE_FIREBASE_DATABASE_URL` | Yes | Realtime Database instance URL | `https://hris-client-admin-dev-default-rtdb.firebaseio.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Google Cloud / Firebase Project ID | `hris-client-admin-dev` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Cloud Storage default bucket | `hris-client-admin-dev.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Cloud Messaging Sender ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase Web Client Application ID | `1:123456789012:web:abcdef12345678` |

---

## 3. Environment Tier Management

The project supports three distinct operational tiers:

### 3.1 Local Development (`development`)
- Target config: `.env.local`
- Firebase project: Dedicated sandbox/dev project (e.g., `hris-dev-*`)
- Emulators: Can point `databaseURL` to `http://127.0.0.1:9000?ns=hris-client-dev` if using the Firebase Local Emulator Suite.

### 3.2 Staging / QA (`staging`)
- Target config: `.env.staging.local` or CI/CD injected pipeline secrets
- Firebase project: Isolated staging project (e.g., `hris-staging-*`)
- Purpose: Automated integration testing, end-to-end testing, and client preview validation.

### 3.3 Production (`production`)
- Target config: `.env.production.local` or cloud deployment environment variables (e.g., Cloudflare Pages, Vercel, Firebase Hosting)
- Firebase project: Hardened multi-region production project (e.g., `hris-prod-*`)
- Strict security rules and production rate limits enforced.

### 3.4 Secret Management and `.gitignore`
The repository's `.gitignore` guarantees that no sensitive local environments are committed:
```gitignore
# Local environment secret overrides
.env
.env.local
.env.*.local
*.env.local

# Template configuration committed to version control
!.env.example
```

Developers create their local config by copying `.env.example`:
```bash
cp .env.example .env.local
```

---

## 4. Centralized Configuration Layer (`src/config/firebase.ts`)

The configuration layer performs non-destructive environment validation:

- **`getFirebaseWebConfig()`**: Extracts all 7 environment variables into a typed `FirebaseWebConfig` record.
- **`checkFirebaseConfig()`**: Inspects variables and returns a diagnostic status (`isConfigured: boolean`, `missingKeys: string[]`). It does NOT throw, ensuring local development works even before `.env.local` is populated.
- **`validateFirebaseConfig()`**: Strict assertion function. Throws a structured `FirebaseConfigurationError` if any mandatory keys are missing, preventing `undefined` runtime errors in production.
- **`FirebaseConfigurationError`**: Structured custom error capturing exact missing keys.

---

## 5. Firebase Modular Client Coordinator (`src/services/firebase/firebaseClient.ts`)

Initialization is handled as a resilient singleton through `FirebaseClientCoordinator`:

```typescript
import {
  firebaseClient,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseDatabase,
  getFirebaseStorage,
  isFirebaseReady,
} from '@/services/firebase';

// Status diagnostics
const status = firebaseClient.getStatus();
console.log('Firebase ready status:', status.isReady);
```

### Lifecycle States
1. **`unconfigured`**: Missing environment variables. The SDK does not initialize; all service getters return `null`. The UI displays informative unconfigured notices without crashing.
2. **`ready`**: Valid environment variables loaded. `FirebaseApp`, `Auth`, `Database`, and `FirebaseStorage` are fully initialized.
3. **`error`**: Initialization threw an error (e.g., invalid API key format). Error message is captured and logged safely without leaking sensitive information.

---

## 6. Service Boundaries

Service boundaries wrap Firebase SDK operations behind domain-specific abstractions:

### 6.1 Authentication (`src/services/auth`)
- Interface: `AuthService` (`signInWithEmail`, `signOut`, `sendPasswordResetEmail`, `onAuthStateChanged`, `isConfigured`)
- Direct accessor: `getFirebaseAuth()`
- UI components consume `useAuth()` or `authService`, never `firebase/auth` directly.

### 6.2 Realtime Database (`src/services/database`)
- Interface: `DatabaseService` (`get`, `set`, `update`, `remove`, `push`, `subscribe`, `buildTenantPath`, `isConfigured`)
- Direct accessor: `getFirebaseDatabase()`
- Enforces strict multi-tenant path prefixes: `organizations/{organizationId}/{resource}/{entityId}`.

### 6.3 Storage (`src/services/storage`)
- Interface: `StorageService` (`uploadFile`, `getDownloadUrl`, `deleteFile`, `buildTenantStoragePath`, `isConfigured`)
- Direct accessor: `getFirebaseStorage()`
- Enforces tenant-isolated storage buckets: `organizations/{organizationId}/{category}/{filename}`.

---

## 7. Security Model & Defense in Depth

### 7.1 Public Web Client Identifiers
> [!NOTE]
> Firebase Web configuration values (`apiKey`, `projectId`, `appId`, etc.) are packaged directly into the client JavaScript bundle. They are **public identifiers**, not private secrets. Restricting visibility of `apiKey` on the client is impossible in any Single Page Application.

### 7.2 The Real Security Perimeter
True security is achieved through two mandatory server-side mechanisms:
1. **Firebase Authentication Tokens (JWTs)**: Every authenticated user request carries a cryptographically signed identity token containing the user's `uid`, tenant `organizationId`, and custom claims.
2. **Server-Side Security Rules**: Firebase Realtime Database and Cloud Storage security rules evaluate every read and write request against the authenticated token:
   ```json
   {
     "rules": {
       "organizations": {
         "$orgId": {
           ".read": "auth != null && auth.token.organizationId === $orgId",
           ".write": "auth != null && auth.token.organizationId === $orgId && auth.token.role === 'org_admin'"
         }
       }
     }
   }
   ```
3. **Google Cloud API Key Restrictions**: In production, restrict the API key in the Google Cloud Console to:
   - Specific authorized HTTP referrers (e.g., `https://admin.yourdomain.com/*`).
   - Specific API services (Identity Toolkit API, Firebase Realtime Database API, Cloud Storage for Firebase).
