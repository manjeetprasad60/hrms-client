# Firebase Storage Security Foundation

## 1. Architecture Overview

The HRIS Client Admin Web uses Firebase Storage to store client-owned binary assets such as organization branding, user avatars, employee documents, HR policies, and payslips.

To protect sensitive employee and corporate data, Firebase Storage enforces a **zero-trust, multi-tenant isolation model** implemented through declarative Storage Security Rules (`storage.rules`).

```text
React Component / Feature (e.g. Employee Profile, Settings)
         ↓
Client-Side Validation (validateStorageFile — MIME & Size Guards)
         ↓
StorageService / ClientDataService (buildTenantStoragePath)
         ↓
Firebase Storage Client SDK
         ↓ [Firebase Protocol Boundary]
Storage Security Rules (storage.rules — Custom Claims + Tenant Isolation + Role Gates)
         ↓
Firebase Storage Bucket
```

---

## 2. Tenant Path Isolation

Every stored object must reside within an explicitly partitioned tenant directory. The application defines `organizations/{orgId}/...` as the canonical path and supports `clients/{clientId}/...` as a symmetrical alias:

```text
/organizations/{orgId}/
  ├── branding/
  │     └── logo.png
  ├── avatars/{userId}/
  │     └── profile.jpg
  ├── employees/{employeeId}/
  │     ├── documents/
  │     │     ├── contract.pdf
  │     │     └── id_card.jpg
  │     └── payslips/
  │           └── payslip_2026_09.pdf
  └── documents/
        ├── handbook.pdf
        └── policy_benefits.docx
```

---

## 3. Storage Security Formula & Custom Claims

Because Firebase Storage Security Rules execute independently of the Realtime Database, tenant membership and role authorization are verified via **Firebase Auth Custom Claims** embedded in `request.auth.token`:

```javascript
// Decoded Firebase Auth Token with Custom Claims
{
  "uid": "usr_99824",
  "email": "hr.lead@acme.corp",
  "organizationId": "org_acme_corp",
  "role": "hr_manager"
}
```

### Access Condition Formula

$$\text{Storage Access} = \text{Authenticated} + \text{Tenant Claim Match} + \text{Role/Owner Authorization} + \text{MIME Validation} + \text{Size Quota}$$

---

## 4. Category-by-Category Specifications

| Category | Storage Path Pattern | Allowed MIME Types | Max Size | Read Access | Write Access |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Branding** | `/organizations/{orgId}/branding/{file}` | JPEG, PNG, WebP, SVG | 5 MB | Tenant Members | `org_admin`, `hr_manager` |
| **Avatars** | `/organizations/{orgId}/avatars/{userId}/{file}` | JPEG, PNG, WebP | 5 MB | Tenant Members | Profile Owner (`auth.uid == userId`) or `org_admin` |
| **Employee Documents** | `/organizations/{orgId}/employees/{empId}/documents/{file}` | PDF, JPEG, PNG | 15 MB | Employee (`auth.uid == empId`) or `org_admin`, `hr_manager` | Employee (`auth.uid == empId`) or `org_admin`, `hr_manager` |
| **Payslips** | `/organizations/{orgId}/employees/{empId}/payslips/{file}` | PDF only | 10 MB | Employee (`auth.uid == empId`) or `org_admin`, `payroll_admin` | `org_admin`, `payroll_admin` (Strictly denied to `hr_manager`) |
| **HR Documents** | `/organizations/{orgId}/documents/{file}` | PDF, Word, Excel, CSV, Images | 25 MB | Tenant Members | `org_admin`, `hr_manager` |

---

## 5. Security Rules Implementation Summary

The storage security rules are defined in [storage.rules](file:///Users/aswani/Desktop/react/hris-client-web/storage.rules):

1. **Default Deny**: Unmatched paths or anonymous requests are rejected (`allow read, write: if false;`).
2. **Cross-Tenant Blocking**: If `request.auth.token.organizationId != orgId`, all read and write requests are immediately denied.
3. **MIME Type Enforcement**: Files cannot disguise executable content or scripts; content types are strictly matched using regex.
4. **Size Quota Protection**: Prevents denial-of-service or storage exhaustion attacks by capping file sizes per category.
5. **Separation of Duties (HR vs Payroll)**: HR Managers cannot view or upload payslips; only Payroll Admins and Organization Admins possess payroll write/read privileges.

---

## 6. Client-Side Pre-Upload Validation

Before sending bytes over the wire, frontend components utilize `validateStorageFile()` from the storage service layer to give immediate user feedback:

```typescript
import { validateStorageFile } from '@/services/storage';

const validation = validateStorageFile(selectedFile, 'avatars');
if (!validation.valid) {
  // Display validation.error in UI alert
  return;
}

// Proceed to upload via clientDataService
await clientDataService.uploadClientFile('avatars', selectedFile.name, selectedFile);
```

---

## 7. Deployment Instructions

Storage rules are bound to the project configuration in [firebase.json](file:///Users/aswani/Desktop/react/hris-client-web/firebase.json):

```json
{
  "database": {
    "rules": "database.rules.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

To deploy rules to your Firebase environment:

```bash
# Deploy both Database and Storage rules
firebase deploy --only database,storage

# Or deploy Storage rules individually
firebase deploy --only storage
```
