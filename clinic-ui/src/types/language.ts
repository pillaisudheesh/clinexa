export interface Language {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedLanguages {
  data: Language[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
