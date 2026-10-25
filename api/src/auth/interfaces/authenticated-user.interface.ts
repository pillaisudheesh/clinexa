export interface AuthenticatedUser {
  id: string;
  clinicId: string;
  email: string;
  status: string;
  isPlatformAdmin?: boolean;
  mustChangePassword: boolean;
  roles: string[];
  roleCodes?: string[];
}
