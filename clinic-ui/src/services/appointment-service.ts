import { apiClient } from "./api-client";

import type {
  Appointment,
  AppointmentAvailabilityResponse,
  AppointmentQuery,
  CreateAppointmentRequest,
  PaginatedAppointments,
  UpdateAppointmentRequest,
} from "@/types/appointment";

export const appointmentService = {
  async getAppointments(
    query: AppointmentQuery = {},
  ): Promise<PaginatedAppointments> {
    const response = await apiClient.get<PaginatedAppointments>(
      "/appointments",
      {
        params: query,
      },
    );

    return response.data;
  },

  async getAppointment(id: string): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(`/appointments/${id}`);

    return response.data;
  },

  async getAvailability(
    doctorId: string,
    date: string,
  ): Promise<AppointmentAvailabilityResponse> {
    const response = await apiClient.get<AppointmentAvailabilityResponse>(
      "/appointments/availability",
      {
        params: {
          doctorId,
          date,
        },
      },
    );

    return response.data;
  },

  async createAppointment(
    data: CreateAppointmentRequest,
  ): Promise<Appointment> {
    const response = await apiClient.post<Appointment>("/appointments", data);

    return response.data;
  },

  async updateAppointment(
    id: string,
    data: UpdateAppointmentRequest,
  ): Promise<Appointment> {
    const response = await apiClient.patch<Appointment>(
      `/appointments/${id}`,
      data,
    );

    return response.data;
  },

  async confirmAppointment(id: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(
      `/appointments/${id}/confirm`,
    );

    return response.data;
  },

  async checkInAppointment(id: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(
      `/appointments/${id}/check-in`,
    );

    return response.data;
  },

  async startAppointment(id: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(
      `/appointments/${id}/start`,
    );

    return response.data;
  },

  async completeAppointment(id: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(
      `/appointments/${id}/complete`,
    );

    return response.data;
  },

  async markNoShow(id: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(
      `/appointments/${id}/no-show`,
    );

    return response.data;
  },

  async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    const response = await apiClient.delete<Appointment>(
      `/appointments/${id}`,
      {
        data: {
          reason,
        },
      },
    );

    return response.data;
  },

  async startConsultation(id: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(
      `/appointments/${id}/start`,
    );

    return response.data;
  },
};
