export type PharmacyDispensingStatus =
  | "PARTIALLY_DISPENSED"
  | "COMPLETED"
  | "CANCELLED";

export type PharmacyPrescriptionStatus =
  | "PENDING"
  | "PARTIALLY_DISPENSED"
  | "DISPENSED"
  | "CANCELLED";

export interface PharmacyPatient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
}

export interface PharmacyDoctor {
  id: string;
  doctorNumber: string;
  title?: string | null;
  firstName: string;
  lastName: string;
}

export interface PharmacyDispensingItem {
  id: string;
  medicineId: string;
  medicineName: string;
  medicineBatchId: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PharmacyDispensingSummary {
  id: string;
  status: PharmacyDispensingStatus;
}

export interface PharmacyDispensing {
  id: string;
  clinicId: string;
  prescriptionId: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
  status: PharmacyDispensingStatus;
  createdAt: string;
  updatedAt?: string;
  items: PharmacyDispensingItem[];
}

export interface PharmacyPrescription {
  id: string;
  prescriptionNumber: string;
  medicalRecordId: string;
  medicineId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route?: string | null;
  duration?: string | null;
  quantity?: string | null;
  instructions?: string | null;
  createdAt: string;
  patient: PharmacyPatient;
  doctor: PharmacyDoctor;
  dispensing: PharmacyDispensingSummary | null;
}

export interface PharmacyPrescriptionDetails extends Omit<
  PharmacyPrescription,
  "dispensing"
> {
  dispensing: PharmacyDispensing | null;
}

export interface PharmacyPrescriptionQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: PharmacyPrescriptionStatus;
  patientId?: string;
}

export interface PaginatedPharmacyPrescriptions {
  data: PharmacyPrescription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
