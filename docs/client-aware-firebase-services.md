# Client-Aware Firebase Services Architecture

This document specifies the **Client-Aware Firebase Service Layer** for the HRIS Client Admin Web application. It establishes how all data queries, persistence operations, and asset storage are authoritatively bound to the authenticated client organization without relying on untrusted, client-supplied identifiers.

---

## 1. Architectural Model

```text
Authenticated Session / ClientProvider
        ↓ (Registers verified organizationId, userId, role)
ClientDataService (src/services/client/clientDataService.ts)
        ↓ (Injects verified tenant path: organizations/{orgId}/{resource})
DatabaseService & StorageService (src/services/database, src/services/storage)
        ↓
Firebase Realtime Database & Storage (SDK v12)
```

---

## 2. Core Security Guarantees

### Principle 1: Zero Trust of Client-Supplied Identifiers
* **The Anti-Pattern**: Allowing UI components or caller functions to pass an unverified `clientId` argument, e.g.:
  ```ts
  // ❌ ANTI-PATTERN: Insecure; user could pass another tenant's ID
  async function getEmployees(clientId: string) { ... }
  ```
* **The Secure Pattern**: `clientDataService` automatically resolves the verified client organization ID from the authenticated session context:
  ```ts
  // ✅ SECURE: Automatically scoped to the verified tenant boundary
  const employees = await clientDataService.get<EmployeeRecord[]>('employees');
  ```
* Any attempt to perform operations without an active, verified client context immediately fails with `ClientUnauthorizedError`.

### Principle 2: Strict Multi-Tenant Path Hierarchy
All data paths in the Firebase Realtime Database are structured under:
`organizations/{organizationId}/{resource}` or `organizations/{organizationId}/{resource}/{entityId}`

And Storage buckets are structured under:
`organizations/{organizationId}/{category}/{filename}`

---

## 3. Reusable Service Patterns

### High-Level Domain Operations

```ts
import { clientDataService } from '../services/client';

// 1. Retrieve active client company profile
const organization = await clientDataService.getClient();

// 2. Retrieve current user's profile within the tenant
const currentUser = await clientDataService.getClientUser();

// 3. Retrieve another employee's profile within the same tenant
const employeeUser = await clientDataService.getClientUser('usr_target_456');

// 4. Retrieve tenant operational settings
const settings = await clientDataService.getClientSettings();

// 5. Update tenant operational settings
await clientDataService.updateClientSettings({
  workingDaysPerWeek: 5,
  defaultWorkingHours: 8,
});
```

### Generic Resource Operations

```ts
// Read all records for a resource
const records = await clientDataService.get<RecordMap>('attendance');

// Read a single entity by ID
const record = await clientDataService.get<LeaveRequest>('leave', 'req_123');

// Create or overwrite an entity
await clientDataService.set('employees', 'emp_001', newEmployeeData);

// Apply partial update to an entity
await clientDataService.update('employees', 'emp_001', { departmentId: 'dept_eng' });

// Remove an entity
await clientDataService.remove('employees', 'emp_001');

// Push a new auto-keyed record
const { key } = await clientDataService.push('audit_logs', logEntry);

// Subscribe to real-time changes
const unsubscribe = clientDataService.subscribe<AttendanceLog[]>(
  'attendance',
  (logs) => updateUI(logs)
);
```

### Client-Scoped Storage Operations

```ts
// Upload avatar, document, or contract scoped to tenant
const uploadResult = await clientDataService.uploadClientFile(
  'documents',
  'employment-contract.pdf',
  fileBlob,
  { contentType: 'application/pdf' }
);

// Delete file from client workspace
await clientDataService.deleteClientFile('documents', 'old-policy.pdf');
```

### React Hook Integration

Components and feature hooks can access the service layer via `useClientDataService`:

```tsx
import { useClientDataService } from '../../services/client';

export function useEmployeeDirectory() {
  const clientService = useClientDataService();
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (!clientService.isReady) return;

    return clientService.subscribe<Record<string, Employee>>(
      'employees',
      (data) => {
        setEmployees(data ? Object.values(data) : []);
      }
    );
  }, [clientService]);

  return { employees };
}
```

---

## 4. Typed Error Handling Architecture

The client service layer provides consistent, typed errors extending `ClientServiceError`:

| Error Class | Code | HTTP Eq. | Description |
| :--- | :--- | :--- | :--- |
| **`ClientUnauthorizedError`** | `client/unauthorized` | 401 | Operation attempted without an authenticated, verified tenant session |
| **`ClientPermissionDeniedError`** | `client/permission-denied` | 403 | Missing capability or cross-tenant access attempt |
| **`ClientNotFoundError`** | `client/not-found` | 404 | Requested entity or profile does not exist under this tenant |
| **`ClientNetworkError`** | `client/network-error` | 503 | Timeout or connectivity failure connecting to Firebase services |
| **`ClientUnavailableError`** | `client/unavailable` | 503 | Firebase Realtime Database or Storage is unconfigured or offline |
| **`ClientInvalidDataError`** | `client/invalid-data` | 400 | Malformed schema payload or invalid resource identifier |

All low-level exceptions thrown by Firebase or database adapters are caught and normalized using `mapToClientServiceError(err, tenantId)`.

---

## 5. Guidelines for Phase 3 Feature Modules

When creating future HRIS modules (Employees, Attendance, Leave, Payroll, Settings):
1. **Always consume `clientDataService` or `useClientDataService()`**: Do not import low-level `databaseService` directly in feature components.
2. **Never expose `clientId` props to UI components**: Let the service layer maintain the boundary authoritatively.
3. **Handle typed service errors**: Catch `ClientNotFoundError`, `ClientPermissionDeniedError`, and display appropriate feedback views.
