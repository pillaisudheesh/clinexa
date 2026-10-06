export interface InventoryBatch {
  id: string;
  clinicId: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  reorderLevel: number;
  isLowStock: boolean;
  isExpired: boolean;
  isActive: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventorySummary {
  totalMedicines: number;
  totalBatches: number;
  totalUnits: number;
  lowStockBatches: number;
  expiringSoonBatches: number;
  expiredBatches: number;
}

export type InventoryTransactionType =
  | "PURCHASE"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "DISPENSE"
  | "RETURN"
  | "EXPIRED";

export interface InventoryTransaction {
  id: string;
  clinicId: string;
  medicineBatchId: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  type: InventoryTransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface StockReceiptItem {
  id: string;
  medicineId: string;
  medicineName: string;
  medicineBatchId: string;
  batchNumber: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  amount: number;
  expiryDate: string;
}

export interface StockReceipt {
  id: string;
  clinicId: string;
  receiptNumber: string;
  supplierName: string | null;
  supplierInvoiceNumber: string | null;
  notes: string | null;
  totalAmount: number;
  createdAt: string;
  items: StockReceiptItem[];
}

export interface CreateStockReceiptItem {
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  reorderLevel?: number;
}

export interface CreateStockReceiptRequest {
  supplierName?: string;
  supplierInvoiceNumber?: string;
  notes?: string;
  items: CreateStockReceiptItem[];
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
