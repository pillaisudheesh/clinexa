export interface Specialty {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  description?: string;
  displayOrder: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialtyQuery {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
}

export interface PaginatedSpecialties {
  data: Specialty[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
