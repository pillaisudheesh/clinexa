export interface AuthenticatedUser {
  id: string;
  clinicId: string;
  email: string;
  status: string;
  isPlatformAdmin?: boolean;
  roles: string[];
  roleCodes?: string[];
}
