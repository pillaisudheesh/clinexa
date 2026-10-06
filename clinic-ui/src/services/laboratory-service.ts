import { apiClient } from "./api-client";
import type {
  CreateLabOrderRequest,
  CreateLabResultRequest,
  CreateLabTestRequest,
  LabOrder,
  LabOrderQuery,
  LabTest,
  LabTestQuery,
  PaginatedLabOrders,
  PaginatedLabTests,
  UpdateLabTestRequest,
} from "@/types/laboratory";

export const laboratoryService = {
  async getOrders(query?: LabOrderQuery): Promise<PaginatedLabOrders> {
    const response = await apiClient.get<PaginatedLabOrders>("/lab-orders", {
      params: query,
    });
    return response.data;
  },

  async getOrder(id: string): Promise<LabOrder> {
    const response = await apiClient.get<LabOrder>(`/lab-orders/${id}`);
    return response.data;
  },

  async createOrder(data: CreateLabOrderRequest): Promise<LabOrder> {
    const response = await apiClient.post<LabOrder>("/lab-orders", data);
    return response.data;
  },

  async updateOrderStatus(
    id: string,
    status: LabOrder["status"],
  ): Promise<LabOrder> {
    const response = await apiClient.patch<LabOrder>(
      `/lab-orders/${id}/status`,
      { status },
    );
    return response.data;
  },

  async updateItemStatus(
    itemId: string,
    status: LabOrder["status"],
  ): Promise<LabOrder> {
    const response = await apiClient.patch<LabOrder>(
      `/lab-orders/items/${itemId}/status`,
      {
        status,
      },
    );
    return response.data;
  },

  async saveResult(
    itemId: string,
    data: CreateLabResultRequest,
  ): Promise<LabOrder> {
    const response = await apiClient.post<LabOrder>(
      `/lab-orders/items/${itemId}/result`,
      data,
    );
    return response.data;
  },

  async getTests(query?: LabTestQuery): Promise<PaginatedLabTests> {
    const response = await apiClient.get<PaginatedLabTests>("/lab-tests", {
      params: query,
    });
    return response.data;
  },

  async getTest(id: string): Promise<LabTest> {
    const response = await apiClient.get<LabTest>(`/lab-tests/${id}`);
    return response.data;
  },

  async createTest(data: CreateLabTestRequest): Promise<LabTest> {
    const response = await apiClient.post<LabTest>("/lab-tests", data);
    return response.data;
  },

  async updateTest(id: string, data: UpdateLabTestRequest): Promise<LabTest> {
    const response = await apiClient.patch<LabTest>(`/lab-tests/${id}`, data);
    return response.data;
  },

  async updateTestStatus(id: string, isActive: boolean): Promise<LabTest> {
    const response = await apiClient.patch<LabTest>(`/lab-tests/${id}/status`, {
      isActive,
    });
    return response.data;
  },
};
