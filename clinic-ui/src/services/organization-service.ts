import { apiClient } from "@/services/api-client";

export interface Organization {
  id: string;
  code: string;
  name: string;
  branchCount: number;
  email: string | null;
  phone: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateOrganizationPayload {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
}

export interface CreateBranchPayload {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
}

export type UpdateOrganizationPayload = Omit<CreateOrganizationPayload, "code">;

export const organizationService = {
  getAll: () => apiClient.get<Organization[]>("/organizations"),

  getById: (id: string) => apiClient.get<Organization>(`/organizations/${id}`),

  create: (payload: CreateOrganizationPayload) =>
    apiClient.post<Organization>("/organizations", payload),

  update: (id: string, payload: UpdateOrganizationPayload) =>
    apiClient.patch<Organization>(`/organizations/${id}`, payload),

  updateStatus: (id: string, isActive: boolean) =>
    apiClient.patch<Organization>(`/organizations/${id}/status`, {
      isActive,
    }),

  getBranches: (
    organizationId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: "name" | "code" | "createdAt";
      sortOrder?: "asc" | "desc";
    } = {},
  ) =>
    apiClient.get<PaginatedResponse<Branch>>(
      `/organizations/${organizationId}/branches`,
      { params },
    ),

  createBranch: (organizationId: string, payload: CreateBranchPayload) =>
    apiClient.post<Branch>(
      `/organizations/${organizationId}/branches`,
      payload,
    ),
};
