export type AppointmentType =
  | "NEW_CONSULTATION"
  | "FOLLOW_UP"
  | "EMERGENCY"
  | "TELECONSULTATION";

export type AppointmentPriority = "ROUTINE" | "URGENT" | "EMERGENCY";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED";

export interface AppointmentPatient {
  id: string;
  patientNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface AppointmentDoctor {
  id: string;
  doctorNumber: string;
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface Appointment {
  id: string;
  clinicId: string;
  appointmentNumber: string;

  patientId: string;
  doctorId: string;

  appointmentDate: string;
  startTime: string;
  endTime: string;

  type: AppointmentType;
  status: AppointmentStatus;
  priority: AppointmentPriority;

  reason?: string;
  notes?: string;
  cancellationReason?: string;
  consultationFee?: string;

  createdAt: string;
  updatedAt: string;

  patient?: AppointmentPatient;
  doctor?: AppointmentDoctor;
}

export interface AppointmentQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;

  appointmentDate?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PaginatedAppointments {
  items: Appointment[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAppointmentRequest {
  patientId: string;
  doctorId: string;

  appointmentDate: string;
  startTime: string;
  endTime: string;

  type?: AppointmentType;
  priority?: AppointmentPriority;

  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;

  type?: AppointmentType;
  priority?: AppointmentPriority;
  status?: AppointmentStatus;

  reason?: string;
  notes?: string;
}

export interface AppointmentAvailabilitySlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AppointmentAvailabilityResponse {
  doctorId: string;
  date: string;
  slotDuration: number;
  bufferTime: number;
  slots: AppointmentAvailabilitySlot[];
}
