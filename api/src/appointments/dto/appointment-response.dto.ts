import {
  AppointmentPriority,
  AppointmentStatus,
  AppointmentType,
} from '@prisma/client';

export class AppointmentResponseDto {
  id!: string;

  clinicId!: string;
  appointmentNumber!: string;

  patientId!: string;
  doctorId!: string;

  appointmentDate!: Date;

  startTime!: string;
  endTime!: string;

  type!: AppointmentType;
  status!: AppointmentStatus;
  priority!: AppointmentPriority;

  reason?: string;
  notes?: string;

  cancellationReason?: string;

  consultationFee?: string;

  createdAt!: Date;
  updatedAt!: Date;

  patient?: {
    id: string;
    patientNumber: string;
    firstName: string;
    middleName?: string;
    lastName: string;
  };

  doctor?: {
    id: string;
    doctorNumber: string;
    title: string;
    firstName: string;
    middleName?: string;
    lastName: string;
  };
}
