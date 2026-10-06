export interface Qualification {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QualificationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedQualifications {
  data: Qualification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
