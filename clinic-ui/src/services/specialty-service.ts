import { apiClient } from "./api-client";

import type {
  PaginatedSpecialties,
  Specialty,
  SpecialtyQuery,
} from "@/types/specialty";

export const specialtyService = {
  async getSpecialties(query?: SpecialtyQuery): Promise<PaginatedSpecialties> {
    const response = await apiClient.get<PaginatedSpecialties>("/specialties", {
      params: query,
    });

    return response.data;
  },

  async getSpecialty(id: string): Promise<Specialty> {
    const response = await apiClient.get<Specialty>(`/specialties/${id}`);

    return response.data;
  },
};
