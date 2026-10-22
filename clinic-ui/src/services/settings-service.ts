import { apiClient } from "@/services/api-client";

export interface RolePermissionRecord {
  id: string;
  code: string;
  name?: string;
  description?: string | null;
}

export type RolePermissionsResponse =
  | RolePermissionRecord[]
  | { data: RolePermissionRecord[] };

export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AvailableDoctorRecord {
  id: string;
  doctorNumber: string;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  department?: { name: string } | null;
  primarySpecialty?: { name: string } | null;
}

export const settingsService = {
  getUsers: (params: Record<string, string | number | undefined>) =>
    apiClient.get<PageResult<any>>("/users", { params }),
  getRoles: (params: Record<string, string | number | undefined>) =>
    apiClient.get<PageResult<any>>("/roles", { params }),
  getPermissions: (params: Record<string, string | number | undefined>) =>
    apiClient.get<PageResult<any>>("/permissions", { params }),
  getClinics: (params: Record<string, string | number | undefined>) =>
    apiClient.get<PageResult<any>>("/clinics", { params }),
  createUser: (payload: unknown) => apiClient.post("/users", payload),
  updateUserStatus: (id: string, status: string) =>
    apiClient.patch(`/users/${id}/status`, { status }),
  createRole: (payload: unknown) => apiClient.post("/roles", payload),
  updateRoleStatus: (id: string, isActive: boolean) =>
    apiClient.patch(`/roles/${id}/status`, { isActive }),
  getRolePermissions: (roleId: string) =>
    apiClient.get<RolePermissionsResponse>(`/roles/${roleId}/permissions`),
  updateRolePermissions: (roleId: string, permissionIds: string[]) =>
    apiClient.put(`/roles/${roleId}/permissions`, { permissionIds }),
  getAvailableDoctors: (clinicId: string) =>
    apiClient.get<AvailableDoctorRecord[]>("/users/available-doctors", {
      params: { clinicId },
    }),
};
