import { apiClient } from "./api-client";
import type {
  CreateStockReceiptRequest,
  InventoryBatch,
  InventorySummary,
  InventoryTransaction,
  Paginated,
  StockReceipt,
  AdjustStockRequest,
} from "@/types/inventory";

export const inventoryService = {
  async getSummary(): Promise<InventorySummary> {
    const response =
      await apiClient.get<InventorySummary>("/inventory/summary");
    return response.data;
  },

  async getBatches(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
      lowStock?: boolean;
      expired?: boolean;
    } = {},
  ): Promise<Paginated<InventoryBatch>> {
    const response = await apiClient.get<Paginated<InventoryBatch>>(
      "/inventory/batches",
      {
        params,
      },
    );
    return response.data;
  },

  async getReceipts(
    params: {
      page?: number;
      limit?: number;
      receiptNumber?: string;
      supplierName?: string;
    } = {},
  ): Promise<Paginated<StockReceipt>> {
    const response = await apiClient.get<Paginated<StockReceipt>>(
      "/inventory/receipts",
      {
        params,
      },
    );
    return response.data;
  },

  async getTransactions(
    params: {
      page?: number;
      limit?: number;
      type?: string;
    } = {},
  ): Promise<Paginated<InventoryTransaction>> {
    const response = await apiClient.get<Paginated<InventoryTransaction>>(
      "/inventory/transactions",
      { params },
    );
    return response.data;
  },

  async getLowStock(): Promise<InventoryBatch[]> {
    const response = await apiClient.get<InventoryBatch[]>(
      "/inventory/low-stock",
    );
    return response.data;
  },

  async getExpiring(days = 90): Promise<InventoryBatch[]> {
    const response = await apiClient.get<InventoryBatch[]>(
      "/inventory/expiring",
      {
        params: { days },
      },
    );
    return response.data;
  },

  async getExpired(): Promise<InventoryBatch[]> {
    const response =
      await apiClient.get<InventoryBatch[]>("/inventory/expired");
    return response.data;
  },

  async markExpired(id: string): Promise<InventoryBatch> {
    const response = await apiClient.post<InventoryBatch>(
      `/inventory/batches/${id}/mark-expired`,
    );
    return response.data;
  },

  async createReceipt(data: CreateStockReceiptRequest): Promise<StockReceipt> {
    const response = await apiClient.post<StockReceipt>(
      "/inventory/receipts",
      data,
    );
    return response.data;
  },
  async adjustStock(
    id: string,
    data: { quantity: number; notes: string },
  ): Promise<InventoryBatch> {
    const response = await apiClient.patch<InventoryBatch>(
      `/inventory/batches/${id}/stock`,
      data,
    );
    return response.data;
  },
};
