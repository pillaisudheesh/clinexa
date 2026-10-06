export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentMethod = "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "OTHER";

export type PaymentStatus =
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "REFUNDED"
  | "SUCCESS";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  labOrderItemId?: string | null;
  pharmacyDispensingItemId?: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string | null;
  notes?: string | null;
  paidAt: string;
  createdAt: string;
}

export interface InvoicePatient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
}

export interface InvoiceAppointment {
  id: string;
  appointmentDate: string;
  status: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clinicId: string;
  patientId: string;
  type: "CONSULTATION" | "LABORATORY" | "PHARMACY" | "OTHER";
  appointmentId: string;
  status: InvoiceStatus;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  amountPaid: string;
  balanceDue: string;
  notes?: string | null;
  issuedAt?: string | null;
  dueAt?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: InvoicePatient;
  appointment?: InvoiceAppointment;
  items: InvoiceItem[];
  payments: Payment[];
}

export interface PaginatedInvoices {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
