export interface Prescription {
  id: string;
  medicalRecordId: string;
  medicineId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route: string | null;
  duration: string | null;
  quantity: string | null;
  instructions: string | null;
  createdAt: string;
}

export interface CreatePrescriptionRequest {
  medicalRecordId: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  route?: string;
  duration?: string;
  quantity?: string;
  instructions?: string;
}

export interface UpdatePrescriptionRequest {
  medicineId?: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  quantity?: string;
  instructions?: string;
}

export interface PrescriptionQuery {
  page?: number;
  limit?: number;
  medicalRecordId?: string;
  medicineId?: string;
}

export interface PaginatedPrescriptions {
  data: Prescription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
