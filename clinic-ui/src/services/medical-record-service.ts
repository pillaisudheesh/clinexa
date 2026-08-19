import { apiClient } from "./api-client";

import type {
  CreateMedicalRecordRequest,
  MedicalRecord,
  UpdateMedicalRecordRequest,
} from "@/types/medical-record";

export const medicalRecordService = {
  async getMedicalRecords(appointmentId?: string): Promise<{
    data: MedicalRecord[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get("/medical-records", {
      params: {
        appointmentId,
      },
    });

    return response.data;
  },

  async getMedicalRecord(id: string): Promise<MedicalRecord> {
    const response = await apiClient.get<MedicalRecord>(
      `/medical-records/${id}`,
    );

    return response.data;
  },

  async createMedicalRecord(
    data: CreateMedicalRecordRequest,
  ): Promise<MedicalRecord> {
    const response = await apiClient.post<MedicalRecord>(
      "/medical-records",
      data,
    );

    return response.data;
  },

  async updateMedicalRecord(
    id: string,
    data: UpdateMedicalRecordRequest,
  ): Promise<MedicalRecord> {
    const response = await apiClient.patch<MedicalRecord>(
      `/medical-records/${id}`,
      data,
    );

    return response.data;
  },
};
