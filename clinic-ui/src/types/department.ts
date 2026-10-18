export interface Department {
  id: string;
  code: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentRequest {
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export type UpdateDepartmentRequest = Partial<CreateDepartmentRequest>;

export interface DepartmentQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedDepartments {
  data: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
