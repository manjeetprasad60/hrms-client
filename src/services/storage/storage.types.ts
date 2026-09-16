/**
 * Firebase Storage Service Contracts
 *
 * Defines the abstract interface and multi-tenant path standards for Storage operations.
 * Architecture: UI -> Feature -> StorageService -> Firebase Storage
 */

export interface StorageUploadOptions {
  readonly contentType?: string;
  readonly customMetadata?: Record<string, string>;
  readonly onProgress?: (percent: number) => void;
}

export interface StorageUploadResult {
  readonly downloadUrl: string;
  readonly fullPath: string;
  readonly bytesTransferred: number;
}

export type StorageFileCategory =
  | 'branding'
  | 'avatars'
  | 'employee-documents'
  | 'payslips'
  | 'documents';

export interface StorageValidationRule {
  readonly allowedMimeTypes: readonly string[];
  readonly maxSizeMb: number;
  readonly maxSizeBytes: number;
  readonly description: string;
}

export interface StorageValidationResult {
  readonly valid: boolean;
  readonly error?: string;
  readonly code?: 'storage/invalid-type' | 'storage/file-too-large' | 'storage/empty-file';
}

export const STORAGE_VALIDATION_RULES: Record<StorageFileCategory, StorageValidationRule> = {
  branding: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxSizeMb: 5,
    maxSizeBytes: 5 * 1024 * 1024,
    description: 'Company branding images (JPEG, PNG, WebP, SVG) up to 5 MB',
  },
  avatars: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMb: 5,
    maxSizeBytes: 5 * 1024 * 1024,
    description: 'User profile photos (JPEG, PNG, WebP) up to 5 MB',
  },
  'employee-documents': {
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeMb: 15,
    maxSizeBytes: 15 * 1024 * 1024,
    description: 'Employee contracts and records (PDF, JPEG, PNG) up to 15 MB',
  },
  payslips: {
    allowedMimeTypes: ['application/pdf'],
    maxSizeMb: 10,
    maxSizeBytes: 10 * 1024 * 1024,
    description: 'Employee payslips (PDF only) up to 10 MB',
  },
  documents: {
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ],
    maxSizeMb: 25,
    maxSizeBytes: 25 * 1024 * 1024,
    description: 'Organizational HR documents, policies, and spreadsheets up to 25 MB',
  },
};

export interface StorageService {
  /**
   * Uploads a file or binary blob to the specified storage path.
   */
  uploadFile(
    path: string,
    file: Blob | File,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult>;

  /**
   * Retrieves the publicly accessible or signed download URL for an existing storage object.
   */
  getDownloadUrl(path: string): Promise<string>;

  /**
   * Deletes a storage object at the specified path.
   */
  deleteFile(path: string): Promise<void>;

  /**
   * Validates a file against size and MIME type constraints for a given category.
   */
  validateFile(file: Blob | File, category: StorageFileCategory): StorageValidationResult;

  /**
   * Constructs a strictly isolated multi-tenant Storage path.
   * Format: organizations/{organizationId}/{category}/{filename}
   */
  buildTenantStoragePath(
    organizationId: string,
    category: StorageFileCategory | string,
    filename: string
  ): string;

  /**
   * Reports whether Firebase Storage is configured with a valid storageBucket.
   */
  isConfigured(): boolean;
}

