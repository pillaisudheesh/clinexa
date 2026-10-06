import { apiClient } from "./api-client";

import type {
  PaginatedQualifications,
  Qualification,
  QualificationQuery,
} from "@/types/qualification";

export const qualificationService = {
  async getQualifications(
    query?: QualificationQuery,
  ): Promise<PaginatedQualifications> {
    const response = await apiClient.get<PaginatedQualifications>(
      "/qualifications",
      {
        params: query,
      },
    );

    return response.data;
  },

  async getQualification(id: string): Promise<Qualification> {
    const response = await apiClient.get<Qualification>(
      `/qualifications/${id}`,
    );

    return response.data;
  },
};
