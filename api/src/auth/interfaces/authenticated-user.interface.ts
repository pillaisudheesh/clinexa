export interface AuthenticatedUser {
  id: string;
  clinicId: string;
  email: string;
  status: string;
  roles: string[];
}
