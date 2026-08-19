import { apiClient } from "./api-client";

import type { Doctor, DoctorQuery, PaginatedDoctors } from "@/types/doctor";

export const doctorService = {
  async getDoctors(query?: DoctorQuery): Promise<PaginatedDoctors> {
    const response = await apiClient.get<PaginatedDoctors>("/doctors", {
      params: query,
    });

    return response.data;
  },

  async getDoctor(id: string): Promise<Doctor> {
    const response = await apiClient.get<Doctor>(`/doctors/${id}`);

    return response.data;
  },
};
