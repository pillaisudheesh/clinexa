import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PharmacyPrescriptionPatientDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  patientNumber!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}

export class PharmacyPrescriptionDoctorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  doctorNumber!: string;

  @ApiPropertyOptional()
  title!: string | null;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}

export class PharmacyDispensingSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    enum: ['PARTIALLY_DISPENSED', 'COMPLETED', 'CANCELLED'],
  })
  status!: 'PARTIALLY_DISPENSED' | 'COMPLETED' | 'CANCELLED';

  //   @ApiProperty()
  //   dispensedAt!: Date;
}

export class PharmacyPrescriptionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  prescriptionNumber!: string;

  @ApiProperty()
  medicalRecordId!: string;

  @ApiProperty()
  medicineId!: string;

  @ApiProperty()
  medicationName!: string;

  @ApiProperty()
  dosage!: string;

  @ApiProperty()
  frequency!: string;

  @ApiPropertyOptional()
  route!: string | null;

  @ApiPropertyOptional()
  duration!: string | null;

  @ApiPropertyOptional()
  quantity!: string | null;

  @ApiPropertyOptional()
  instructions!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({
    type: PharmacyPrescriptionPatientDto,
  })
  patient!: PharmacyPrescriptionPatientDto;

  @ApiProperty({
    type: PharmacyPrescriptionDoctorDto,
  })
  doctor!: PharmacyPrescriptionDoctorDto;

  @ApiPropertyOptional({
    type: PharmacyDispensingSummaryDto,
    nullable: true,
  })
  dispensing!: PharmacyDispensingSummaryDto | null;
}
