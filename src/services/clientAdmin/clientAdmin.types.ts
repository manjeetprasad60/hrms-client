export interface ClientAdminInput {
  readonly email: string;
  readonly name?: string;
  readonly role: 'company_owner' | 'hr_admin';
}
