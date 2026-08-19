import { apiClient } from "./api-client";

import type {
  CreatePatientRequest,
  Patient,
  PatientQuery,
  PaginatedPatients,
  UpdatePatientRequest,
  UpdatePatientStatusRequest,
} from "@/types/patient";

export const patientService = {
  async getPatients(query?: PatientQuery): Promise<PaginatedPatients> {
    const response = await apiClient.get<PaginatedPatients>("/patients", {
      params: query,
    });

    return response.data;
  },

  async getPatient(id: string): Promise<Patient> {
    const response = await apiClient.get<Patient>(`/patients/${id}`);

    return response.data;
  },

  async createPatient(data: CreatePatientRequest): Promise<Patient> {
    const response = await apiClient.post<Patient>("/patients", data);

    return response.data;
  },

  async updatePatient(
    id: string,
    data: UpdatePatientRequest,
  ): Promise<Patient> {
    const response = await apiClient.patch<Patient>(`/patients/${id}`, data);

    return response.data;
  },

  async updatePatientStatus(
    id: string,
    data: UpdatePatientStatusRequest,
  ): Promise<Patient> {
    const response = await apiClient.put<Patient>(
      `/patients/${id}/status`,
      data,
    );

    return response.data;
  },
};
