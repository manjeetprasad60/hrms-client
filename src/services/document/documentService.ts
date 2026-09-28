import { apiClient } from '../api/apiClient';
import type { CompanyDocument } from './document.types';
import { firebaseClient } from '../firebase';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { activityService } from '../activity/activityService';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv'
];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

class DocumentService {
  private getStorage() {
    const app = firebaseClient.getApp();
    if (!app) throw new Error('Firebase app not initialized');
    return getStorage(app);
  }

  public async getDocuments(companyId: string): Promise<CompanyDocument[]> {
    if (!companyId) throw new Error('Company ID is required');
    try {
      const docs = await apiClient.get<Record<string, CompanyDocument> | CompanyDocument[]>(
        `companies/${companyId}/documents`
      );
      if (!docs) return [];
      const list = Array.isArray(docs) ? docs : Object.values(docs);
      return list.filter(doc => doc.status === 'active');
    } catch {
      return [];
    }
  }

  public async uploadDocument(
    companyId: string, 
    file: File, 
    metadata: { name: string; category?: CompanyDocument['category'] },
    actorId: string
  ): Promise<CompanyDocument> {
    if (!companyId) throw new Error('Company ID is required');
    
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File exceeds maximum size of 25MB');
    }

    const id = `doc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2,6)}`;
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `companies/${companyId}/documents/${id}/${safeFileName}`;

    const storage = this.getStorage();
    const fileRef = storageRef(storage, storagePath);
    
    await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(fileRef);

    const now = Date.now();
    const document: CompanyDocument = {
      id,
      companyId,
      name: metadata.name,
      fileName: safeFileName,
      fileSize: file.size,
      mimeType: file.type,
      storagePath,
      downloadUrl,
      category: metadata.category,
      uploadedBy: { userId: actorId },
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    try {
      await apiClient.post(`companies/${companyId}/documents`, document);
    } catch {
      // Non-blocking in dev
    }
    
    await activityService.logActivity(companyId, {
      action: 'uploaded',
      description: `Uploaded document ${metadata.name}`,
      performedBy: { userId: actorId },
      resourceType: 'document',
      resourceId: id
    });

    return document;
  }

  public async replaceDocument(
    companyId: string, 
    documentId: string, 
    file: File, 
    actorId: string
  ): Promise<CompanyDocument> {
    if (!companyId || !documentId) throw new Error('Company ID and Document ID are required');
    
    let existing: CompanyDocument | undefined;
    try {
      existing = await apiClient.get<CompanyDocument>(`companies/${companyId}/documents/${documentId}`);
    } catch {
      // ignore
    }
    if (!existing) throw new Error('Document not found');
    
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File exceeds maximum size of 25MB');
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `companies/${companyId}/documents/${documentId}/${safeFileName}`;

    const storage = this.getStorage();
    const newFileRef = storageRef(storage, storagePath);
    await uploadBytes(newFileRef, file);
    const downloadUrl = await getDownloadURL(newFileRef);
    
    // Optionally delete old file in storage if paths differ
    if (existing.storagePath !== storagePath) {
      try {
        await deleteObject(storageRef(storage, existing.storagePath));
      } catch (e) {
        console.warn('Failed to delete old document in storage', e);
      }
    }

    const updated: CompanyDocument = {
      ...existing,
      fileName: safeFileName,
      fileSize: file.size,
      mimeType: file.type,
      storagePath,
      downloadUrl,
      updatedAt: Date.now()
    };

    try {
      await apiClient.patch(`companies/${companyId}/documents/${documentId}`, updated);
    } catch {
      // Non-blocking in dev
    }
    
    await activityService.logActivity(companyId, {
      action: 'replaced',
      description: `Replaced document ${existing.name}`,
      performedBy: { userId: actorId },
      resourceType: 'document',
      resourceId: documentId
    });

    return updated;
  }

  public async deleteDocument(companyId: string, documentId: string, actorId: string): Promise<void> {
    if (!companyId || !documentId) throw new Error('Company ID and Document ID are required');
    
    let existing: CompanyDocument | undefined;
    try {
      existing = await apiClient.get<CompanyDocument>(`companies/${companyId}/documents/${documentId}`);
    } catch {
      // ignore
    }
    if (!existing) throw new Error('Document not found');

    const storage = this.getStorage();
    try {
      await deleteObject(storageRef(storage, existing.storagePath));
    } catch (e) {
      console.warn('Failed to delete document in storage', e);
    }
    
    // Soft delete
    try {
      await apiClient.patch(`companies/${companyId}/documents/${documentId}`, {
        status: 'archived',
        updatedAt: Date.now()
      });
    } catch {
      // Non-blocking in dev
    }

    await activityService.logActivity(companyId, {
      action: 'deleted',
      description: `Deleted document ${existing.name}`,
      performedBy: { userId: actorId },
      resourceType: 'document',
      resourceId: documentId
    });
  }
}

export const documentService = new DocumentService();
