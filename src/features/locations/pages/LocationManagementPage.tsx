import { useState } from 'react';
import { PageContainer } from '../../../layouts';
import { Button } from '../../../components/ui';
import { LocationTable } from '../components/LocationTable';
import { CreateLocationModal } from '../components/CreateLocationModal';
import { EditLocationModal } from '../components/EditLocationModal';

export function LocationManagementPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editLoc, setEditLoc] = useState<Record<string, unknown> | null>(null);
  return (
    <PageContainer title="Locations">
      <Button onClick={() => setShowCreate(true)}>Add Location</Button>
      <LocationTable locations={[]} onEdit={(l) => setEditLoc(l as Record<string, unknown>)} />
      <CreateLocationModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      {editLoc && <EditLocationModal isOpen={true} location={editLoc} onClose={() => setEditLoc(null)} />}
    </PageContainer>
  );
}