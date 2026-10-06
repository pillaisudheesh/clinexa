import { apiClient } from "./api-client";

import type {
  CreatePrescriptionRequest,
  PaginatedPrescriptions,
  Prescription,
  PrescriptionQuery,
  UpdatePrescriptionRequest,
} from "@/types/prescription";

export const prescriptionService = {
  async getPrescriptions(
    query?: PrescriptionQuery,
  ): Promise<PaginatedPrescriptions> {
    const response = await apiClient.get<PaginatedPrescriptions>(
      "/prescriptions",
      {
        params: query,
      },
    );

    return response.data;
  },

  async getPrescription(id: string): Promise<Prescription> {
    const response = await apiClient.get<Prescription>(`/prescriptions/${id}`);

    return response.data;
  },

  async createPrescription(
    data: CreatePrescriptionRequest,
  ): Promise<Prescription> {
    const response = await apiClient.post<Prescription>("/prescriptions", data);

    return response.data;
  },

  async updatePrescription(
    id: string,
    data: UpdatePrescriptionRequest,
  ): Promise<Prescription> {
    const response = await apiClient.patch<Prescription>(
      `/prescriptions/${id}`,
      data,
    );

    return response.data;
  },

  async deletePrescription(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/prescriptions/${id}`,
    );

    return response.data;
  },
};
