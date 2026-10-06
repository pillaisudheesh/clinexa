import { apiClient } from "./api-client";

import type {
  CreateMedicineRequest,
  Medicine,
  MedicineQuery,
  PaginatedMedicines,
  UpdateMedicineRequest,
} from "@/types/medicine";

export const medicineService = {
  async getMedicines(query?: MedicineQuery): Promise<PaginatedMedicines> {
    const response = await apiClient.get<PaginatedMedicines>("/medicines", {
      params: query,
    });

    return response.data;
  },

  async getMedicine(id: string): Promise<Medicine> {
    const response = await apiClient.get<Medicine>(`/medicines/${id}`);

    return response.data;
  },

  async createMedicine(data: CreateMedicineRequest): Promise<Medicine> {
    const response = await apiClient.post<Medicine>("/medicines", data);

    return response.data;
  },

  async updateMedicine(
    id: string,
    data: UpdateMedicineRequest,
  ): Promise<Medicine> {
    const response = await apiClient.patch<Medicine>(`/medicines/${id}`, data);

    return response.data;
  },

  async deleteMedicine(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{
      message: string;
    }>(`/medicines/${id}`);

    return response.data;
  },
};
