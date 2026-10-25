import { apiClient } from "./api-client";

import type { LoginRequest, LoginResponse, AuthUser } from "@/types/auth";

const ACCESS_TOKEN_KEY = "samaroot_access_token";
const USER_KEY = "samaroot_user";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials,
    );

    const data = response.data;
    const user = {
      ...data.user,
      mustChangePassword:
        data.mustChangePassword ?? data.user.mustChangePassword,
    };

    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);

    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return {
      ...data,
      user,
    };
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<{ user: AuthUser }>("/auth/me");

    const user = response.data.user;

    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  async logout() {
    try {
      // Call the backend while the JWT is still available.
      const response = await apiClient.post<{ user: AuthUser }>("/auth/logout");
    } finally {
      // Always clear local credentials, even if the API fails.
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
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

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(
      "/auth/change-password",
      payload,
    );

    return response.data;
  },

  async forgotPassword(payload: {
    email: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/auth/forgot-password",
      payload,
    );

    return response.data;
  },

  async resetPassword(payload: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/auth/reset-password",
      payload,
    );

    return response.data;
  },
};
