export interface Department {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedDepartments {
  data: Department[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
