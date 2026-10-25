export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  clinicId: string;
  status?: string;
  /** Explicit platform-wide authority; never infer this from a clinic role name. */
  isPlatformAdmin?: boolean;
  role?: string | null;
  roles: Array<string | { id?: string; name?: string; code?: string }>;
  permissions: string[];
  mustChangePassword: boolean;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: AuthUser;
  mustChangePassword: boolean;
}
