import { apiClient } from "./api-client";

import type {
  PaginatedPharmacyPrescriptions,
  PharmacyPrescriptionQuery,
} from "@/types/pharmacy";

export const pharmacyService = {
  async getPrescriptions(
    query?: PharmacyPrescriptionQuery,
  ): Promise<PaginatedPharmacyPrescriptions> {
    const response = await apiClient.get<PaginatedPharmacyPrescriptions>(
      "/pharmacy/prescriptions",
      {
        params: query,
      },
    );

    return response.data;
  },

  async dispensePrescription(
    prescriptionId: string,
    data?: {
      quantity?: number;
      invoiceId?: string;
      notes?: string;
    },
  ) {
    const response = await apiClient.post(
      `/pharmacy/dispensing/prescriptions/${prescriptionId}`,
      data,
    );

    return response.data;
  },

  async getDispensing(prescriptionId: string) {
    const response = await apiClient.get(
      `/pharmacy/dispensing/prescriptions/${prescriptionId}`,
    );

    return response.data;
  },

  async cancelDispensing(dispensingId: string) {
    const response = await apiClient.post(
      `/pharmacy/dispensing/${dispensingId}/cancel`,
    );

    return response.data;
  },
};
