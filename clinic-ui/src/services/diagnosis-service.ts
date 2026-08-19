import { apiClient } from "./api-client";

import type {
  CreateDiagnosisRequest,
  Diagnosis,
  UpdateDiagnosisRequest,
} from "@/types/diagnosis";

interface DiagnosisListResponse {
  data: Diagnosis[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const diagnosisService = {
  async getByMedicalRecord(medicalRecordId: string): Promise<Diagnosis[]> {
    const response = await apiClient.get<DiagnosisListResponse>("/diagnoses", {
      params: {
        medicalRecordId,
        page: 1,
        limit: 100,
      },
    });

    return response.data.data;
  },

  async create(data: CreateDiagnosisRequest): Promise<Diagnosis> {
    const response = await apiClient.post<Diagnosis>("/diagnoses", data);

    return response.data;
  },

  async update(id: string, data: UpdateDiagnosisRequest): Promise<Diagnosis> {
    const response = await apiClient.patch<Diagnosis>(`/diagnoses/${id}`, data);

    return response.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/diagnoses/${id}`);
  },
};
