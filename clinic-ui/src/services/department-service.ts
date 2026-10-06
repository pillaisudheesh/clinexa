import { apiClient } from "./api-client";

import type {
  Department,
  DepartmentQuery,
  PaginatedDepartments,
} from "@/types/department";

export const departmentService = {
  async getDepartments(query?: DepartmentQuery): Promise<PaginatedDepartments> {
    const response = await apiClient.get<PaginatedDepartments>("/departments", {
      params: query,
    });

    return response.data;
  },

  async getDepartment(id: string): Promise<Department> {
    const response = await apiClient.get<Department>(`/departments/${id}`);

    return response.data;
  },
};
