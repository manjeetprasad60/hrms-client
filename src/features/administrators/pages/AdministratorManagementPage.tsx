import { useState } from 'react';
import { PageContainer } from '../../../layouts';
import { Button } from '../../../components/ui';
import { AdminTable } from '../components/AdminTable';
import { InviteAdminModal } from '../components/InviteAdminModal';
export function AdministratorManagementPage() {
  const [showInvite, setShowInvite] = useState(false);
  return <PageContainer title="Administrators">
    <Button onClick={() => setShowInvite(true)}>Invite Admin</Button>
    <AdminTable />
    <InviteAdminModal isOpen={showInvite} onClose={() => setShowInvite(false)} />
  </PageContainer>;
}