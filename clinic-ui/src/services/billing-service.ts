import { apiClient } from "./api-client";

import type {
  Invoice,
  InvoiceStatus,
  PaginatedInvoices,
} from "@/types/billing";

export interface InvoiceQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  patientId?: string;
}

export interface CreateInvoiceItemRequest {
  description: string;
  quantity: string;
  unitPrice: string;
  labOrderItemId?: string;
  pharmacyDispensingItemId?: string;
}

export interface CreateInvoiceRequest {
  patientId: string;
  appointmentId: string;
  discount?: string;
  tax?: string;
  notes?: string;
  items: CreateInvoiceItemRequest[];
}

export interface UpdateInvoiceRequest {
  discount?: string;
  tax?: string;
  notes?: string;
}

export interface CreatePaymentRequest {
  amount: string;
  method: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "OTHER";
  transactionReference?: string;
  notes?: string;
}

export const billingService = {
  async getInvoices(query?: InvoiceQuery): Promise<PaginatedInvoices> {
    const response = await apiClient.get<PaginatedInvoices>("/billing", {
      params: query,
    });

    return response.data;
  },

  async getInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`/billing/${id}`);

    return response.data;
  },

  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    const response = await apiClient.post<Invoice>("/billing", data);

    return response.data;
  },

  async updateInvoice(
    id: string,
    data: UpdateInvoiceRequest,
  ): Promise<Invoice> {
    const response = await apiClient.patch<Invoice>(`/billing/${id}`, data);

    return response.data;
  },

  async issueInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(`/billing/${id}/issue`);

    return response.data;
  },

  async cancelInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(`/billing/${id}/cancel`);

    return response.data;
  },

  async createPayment(id: string, data: CreatePaymentRequest) {
    const response = await apiClient.post(`/billing/${id}/payments`, data);

    return response.data;
  },
};
