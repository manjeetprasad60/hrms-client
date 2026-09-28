export interface ClientMembership {
  readonly id: string;
  readonly userId: string;
  readonly companyId: string;
  readonly companyDisplayId?: string;
  readonly companyName?: string;
  readonly email: string;
  readonly name?: string;
  readonly phone?: string;
  readonly role: 'company_owner' | 'hr_admin';
  readonly accountStatus: 'active' | 'inactive' | 'suspended' | 'disabled';
  readonly invitationStatus: 'accepted' | 'pending' | 'expired' | 'revoked';
  readonly invitationAcceptedAt?: string;
  readonly isPrimary: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
}
