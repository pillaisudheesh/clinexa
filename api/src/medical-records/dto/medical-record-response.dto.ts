import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MedicalRecordResponseDto {
  @ApiProperty({
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
  })
  patientId!: string;

  @ApiProperty({
    format: 'uuid',
  })
  doctorId!: string;

  @ApiProperty({
    format: 'uuid',
  })
  appointmentId!: string;

  @ApiPropertyOptional()
  chiefComplaint?: string | null;

  @ApiPropertyOptional()
  historyOfPresentIllness?: string | null;

  @ApiPropertyOptional()
  examinationNotes?: string | null;

  @ApiPropertyOptional()
  assessment?: string | null;

  @ApiPropertyOptional()
  treatmentPlan?: string | null;

  @ApiPropertyOptional()
  followUpInstructions?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
