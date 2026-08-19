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
  role?: string | null;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: AuthUser;
}
