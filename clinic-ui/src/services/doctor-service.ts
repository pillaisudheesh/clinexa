import { apiClient } from "./api-client";

import type {
  CreateDoctorRequest,
  Doctor,
  DoctorQuery,
  PaginatedDoctors,
  UpdateDoctorRequest,
  UpdateDoctorStatusRequest,
} from "@/types/doctor";

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

  async createDoctor(data: CreateDoctorRequest): Promise<Doctor> {
    const response = await apiClient.post<Doctor>("/doctors", data);

    return response.data;
  },

  async updateDoctor(id: string, data: UpdateDoctorRequest): Promise<Doctor> {
    const response = await apiClient.patch<Doctor>(`/doctors/${id}`, data);

    return response.data;
  },

  async updateDoctorStatus(
    id: string,
    data: UpdateDoctorStatusRequest,
  ): Promise<Doctor> {
    const response = await apiClient.put<Doctor>(`/doctors/${id}/status`, data);

    return response.data;
  },

  async deleteDoctor(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{
      message: string;
    }>(`/doctors/${id}`);

    return response.data;
  },
};
