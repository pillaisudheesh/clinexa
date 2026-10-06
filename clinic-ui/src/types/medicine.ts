export interface Medicine {
  id: string;
  clinicId: string;
  name: string;
  genericName: string | null;
  manufacturer: string | null;
  category: string | null;
  strength: string | null;
  form: string | null;
  unit: string | null;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateMedicineRequest {
  name: string;
  genericName?: string;
  manufacturer?: string;
  category?: string;
  strength?: string;
  form?: string;
  unit?: string;
  price: number;
  isActive?: boolean;
}

export interface UpdateMedicineRequest {
  name?: string;
  genericName?: string;
  manufacturer?: string;
  category?: string;
  strength?: string;
  form?: string;
  unit?: string;
  price?: number;
  isActive?: boolean;
}

export interface PaginatedMedicines {
  data: Medicine[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
