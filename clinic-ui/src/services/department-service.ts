import { apiClient } from "./api-client";
import type {
  CreateDepartmentRequest,
  Department,
  DepartmentQuery,
  PaginatedDepartments,
  UpdateDepartmentRequest,
} from "@/types/department";

export const departmentService = {
  async getDepartments(query?: DepartmentQuery): Promise<PaginatedDepartments> {
    const response = await apiClient.get<PaginatedDepartments>("/departments", { params: query });
    return response.data;
  },
  async getDepartment(id: string): Promise<Department> {
    const response = await apiClient.get<Department>(`/departments/${id}`);
    return response.data;
  },
  async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    const response = await apiClient.post<Department>("/departments", data);
    return response.data;
  },
  async updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    const response = await apiClient.patch<Department>(`/departments/${id}`, data);
    return response.data;
  },
  async updateDepartmentStatus(id: string, isActive: boolean): Promise<Department> {
    const response = await apiClient.put<Department>(`/departments/${id}/status`, { isActive });
    return response.data;
  },
};
