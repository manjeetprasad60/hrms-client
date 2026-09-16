/**
 * Firebase Storage Service Implementation
 *
 * Implements the StorageService boundary separating UI and features from Firebase Storage.
 * Enforces tenant-isolated storage path hierarchies:
 * organizations/{organizationId}/{category}/{filename}
 */

import { firebaseClient, getFirebaseStorage } from '../firebase';
import {
  STORAGE_VALIDATION_RULES,
  type StorageFileCategory,
  type StorageService,
  type StorageUploadOptions,
  type StorageUploadResult,
  type StorageValidationResult,
} from './storage.types';

/**
 * Validates a file against size and MIME type constraints for a given category.
 */
export function validateStorageFile(
  file: Blob | File,
  category: StorageFileCategory
): StorageValidationResult {
  const rule = STORAGE_VALIDATION_RULES[category];
  if (!rule) {
    return {
      valid: false,
      error: `Unknown storage category "${category}".`,
      code: 'storage/invalid-type',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty (0 bytes).',
      code: 'storage/empty-file',
    };
  }

  if (file.size > rule.maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed limit of ${rule.maxSizeMb} MB for ${category}.`,
      code: 'storage/file-too-large',
    };
  }

  if (file.type) {
    const isAllowed = rule.allowedMimeTypes.some((allowed) => {
      if (allowed.endsWith('/*')) {
        return file.type.startsWith(allowed.slice(0, -1));
      }
      return file.type === allowed;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: `File type "${file.type}" is not permitted for ${category}. Allowed types: ${rule.allowedMimeTypes.join(', ')}.`,
        code: 'storage/invalid-type',
      };
    }
  }

  return { valid: true };
}

export class StorageServiceImpl implements StorageService {
  public isConfigured(): boolean {
    return firebaseClient.isReady() && Boolean(getFirebaseStorage());
  }

  public validateFile(file: Blob | File, category: StorageFileCategory): StorageValidationResult {
    return validateStorageFile(file, category);
  }

  public buildTenantStoragePath(
    organizationId: string,
    category: StorageFileCategory | string,
    filename: string
  ): string {
    const cleanOrg = organizationId.trim().replace(/^\/+|\/+$/g, '');
    const cleanCategory = category.trim().replace(/^\/+|\/+$/g, '');
    const cleanFilename = filename.trim().replace(/^\/+|\/+$/g, '');

    if (!cleanOrg) {
      throw new Error('Tenant organization ID is required to construct storage path.');
    }
    if (!cleanCategory) {
      throw new Error('Storage category is required to construct storage path.');
    }
    if (!cleanFilename) {
      throw new Error('Filename is required to construct storage path.');
    }

    return `organizations/${cleanOrg}/${cleanCategory}/${cleanFilename}`;
  }

  public async uploadFile(
    path: string,
    file: Blob | File,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    if (!this.isConfigured()) {
      console.warn(`[StorageService] Firebase Storage not configured. Simulating development upload for path: ${path}`);

      // Simulate instantaneous progress for development UX
      if (options?.onProgress) {
        options.onProgress(100);
      }

      return {
        downloadUrl: `https://storage.placeholder.internal/${path}`,
        fullPath: path,
        bytesTransferred: file.size,
      };
    }

    // In upcoming phase:
    // const storageRef = ref(getStorage(), path);
    // const uploadTask = uploadBytesResumable(storageRef, file, { contentType: options?.contentType });
    // ...
    return {
      downloadUrl: '',
      fullPath: path,
      bytesTransferred: file.size,
    };
  }

  public async getDownloadUrl(path: string): Promise<string> {
    if (!this.isConfigured()) {
      return `https://storage.placeholder.internal/${path}`;
    }

    // In upcoming phase: return await getDownloadURL(ref(getStorage(), path));
    return '';
  }

  public async deleteFile(path: string): Promise<void> {
    if (!this.isConfigured()) {
      console.warn(`[StorageService] Firebase Storage not configured. Delete skipped for path: ${path}`);
      return;
    }

    // In upcoming phase: await deleteObject(ref(getStorage(), path));
  }
}

export const storageService: StorageService = new StorageServiceImpl();
