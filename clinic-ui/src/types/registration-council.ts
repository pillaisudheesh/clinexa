export interface RegistrationCouncil {
  id: string;
  code: string;
  name: string;
  country?: string;
  isSystem: boolean;
  isActive: boolean;
}

export interface RegistrationCouncilQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedRegistrationCouncils {
  data: RegistrationCouncil[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
