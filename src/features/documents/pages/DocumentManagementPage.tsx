import { useState } from 'react';
import { PageContainer } from '../../../layouts';
import { Button } from '../../../components/ui';
import { DocumentList } from '../components/DocumentList';
import { UploadDocumentModal } from '../components/UploadDocumentModal';
export function DocumentManagementPage() {
  const [showUpload, setShowUpload] = useState(false);
  return <PageContainer title="Documents">
    <Button onClick={() => setShowUpload(true)}>Upload</Button>
    <DocumentList />
    <UploadDocumentModal isOpen={showUpload} onClose={() => setShowUpload(false)} />
  </PageContainer>;
}