export type LabOrderStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type LabOrderItemStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface LabResult {
  id: string;
  labOrderItemId: string;
  result: string;
  notes: string | null;
  performedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabOrderItem {
  id: string;
  labOrderId: string;
  labTestId: string;
  labTestCode: string;
  labTestName: string;
  price: number;
  status: LabOrderItemStatus;
  result: LabResult | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabOrder {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  appointment?: LabOrderAppointment | null;
  status: LabOrderStatus;
  notes: string | null;
  items: LabOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedLabOrders {
  data: LabOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LabOrderQuery {
  page?: number;
  limit?: number;
  search?: string;
  patientId?: string;
  doctorId?: string;
  appointmentId?: string;
  status?: LabOrderStatus;
}

export interface CreateLabOrderRequest {
  appointmentId: string;
  labTestIds: string[];
  notes?: string;
}

export interface CreateLabResultRequest {
  result: string;
  notes?: string;
  performedAt?: string;
}

export interface LabTest {
  id: string;
  clinicId: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  unit: string | null;
  normalRange: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedLabTests {
  data: LabTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LabTestQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
}

export interface CreateLabTestRequest {
  code: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  unit?: string;
  normalRange?: string;
}

export interface LabOrderAppointment {
  id: string;
  appointmentNumber: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  patient: {
    id: string;
    patientNumber: string;
    firstName: string;
    lastName: string;
  };
  doctor: {
    id: string;
    doctorNumber: string;
    firstName: string;
    lastName: string;
  };
}

export interface UpdateLabTestRequest extends Partial<CreateLabTestRequest> {}
