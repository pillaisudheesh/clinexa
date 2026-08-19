import { apiClient } from "./api-client";

import type { LoginRequest, LoginResponse, AuthUser } from "@/types/auth";

const ACCESS_TOKEN_KEY = "clinexa_access_token";
const USER_KEY = "clinexa_user";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials,
    );

    const data = response.data;

    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);

    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return data;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<{ user: AuthUser }>("/auth/me");

    const user = response.data.user;

    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);

    localStorage.removeItem(USER_KEY);
  },

  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    const value = localStorage.getItem(USER_KEY);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as AuthUser;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
  },
};
