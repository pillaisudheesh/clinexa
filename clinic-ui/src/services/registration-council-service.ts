import { apiClient } from "./api-client";

import type {
  PaginatedRegistrationCouncils,
  RegistrationCouncil,
  RegistrationCouncilQuery,
} from "@/types/registration-council";

export const registrationCouncilService = {
  async getRegistrationCouncils(
    query?: RegistrationCouncilQuery,
  ): Promise<PaginatedRegistrationCouncils> {
    const response = await apiClient.get<PaginatedRegistrationCouncils>(
      "/registration-councils",
      {
        params: query,
      },
    );

    return response.data;
  },

  async getRegistrationCouncil(id: string): Promise<RegistrationCouncil> {
    const response = await apiClient.get<RegistrationCouncil>(
      `/registration-councils/${id}`,
    );

    return response.data;
  },
};
