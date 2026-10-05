import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LabOrderItemStatus, LabOrderStatus } from '@prisma/client';

export class LabResultResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  labOrderItemId!: string;

  @ApiProperty()
  result!: string;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiPropertyOptional()
  performedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class LabOrderItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  labOrderId!: string;

  @ApiProperty()
  labTestId!: string;

  @ApiProperty()
  labTestCode!: string;

  @ApiProperty()
  labTestName!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty({
    enum: LabOrderItemStatus,
  })
  status!: LabOrderItemStatus;

  @ApiPropertyOptional({
    type: LabResultResponseDto,
    nullable: true,
  })
  result?: LabResultResponseDto | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class LabOrderAppointmentPatientResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  patientNumber!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}

export class LabOrderAppointmentDoctorResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  doctorNumber!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}

export class LabOrderAppointmentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  appointmentNumber!: string;

  @ApiProperty()
  appointmentDate!: Date;

  @ApiProperty()
  startTime!: string;

  @ApiProperty()
  endTime!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({
    type: LabOrderAppointmentPatientResponseDto,
  })
  patient!: LabOrderAppointmentPatientResponseDto;

  @ApiProperty({
    type: LabOrderAppointmentDoctorResponseDto,
  })
  doctor!: LabOrderAppointmentDoctorResponseDto;
}

export class LabOrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  clinicId!: string;

  @ApiProperty()
  patientId!: string;

  @ApiProperty()
  doctorId!: string;

  @ApiProperty()
  appointmentId!: string;

  @ApiPropertyOptional({
    type: LabOrderAppointmentResponseDto,
    nullable: true,
  })
  appointment?: LabOrderAppointmentResponseDto | null;

  @ApiProperty({
    enum: LabOrderStatus,
  })
  status!: LabOrderStatus;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty({
    type: [LabOrderItemResponseDto],
  })
  items!: LabOrderItemResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
