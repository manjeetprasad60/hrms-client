export interface CompanyDocument {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly mimeType: string;
  readonly storagePath: string;
  readonly downloadUrl: string;
  readonly category?: 'policy' | 'handbook' | 'template' | 'logo' | 'certificate' | 'other';
  readonly uploadedBy: { userId: string; name?: string; email?: string };
  readonly status: 'active' | 'archived';
  readonly createdAt: number;
  readonly updatedAt: number;
}
