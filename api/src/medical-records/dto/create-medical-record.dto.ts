import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMedicalRecordDto {
  @ApiProperty({
    description: 'Patient ID',
    format: 'uuid',
  })
  @IsUUID()
  patientId!: string;

  @ApiProperty({
    description: 'Doctor ID',
    format: 'uuid',
  })
  @IsUUID()
  doctorId!: string;

  @ApiProperty({
    description: 'Appointment ID associated with this medical record',
    format: 'uuid',
  })
  @IsUUID()
  appointmentId!: string;

  @ApiPropertyOptional({
    description: 'Primary reason for the consultation',
    example: 'Persistent headache for the past three days',
  })
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional({
    description: 'History of present illness',
    example:
      'Patient reports intermittent headache for three days, mainly occurring in the evening.',
  })
  @IsOptional()
  @IsString()
  historyOfPresentIllness?: string;

  @ApiPropertyOptional({
    description: 'Clinical examination notes',
  })
  @IsOptional()
  @IsString()
  examinationNotes?: string;

  @ApiPropertyOptional({
    description: 'Clinical assessment',
  })
  @IsOptional()
  @IsString()
  assessment?: string;

  @ApiPropertyOptional({
    description: 'Treatment plan',
  })
  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @ApiPropertyOptional({
    description: 'Instructions for patient follow-up',
  })
  @IsOptional()
  @IsString()
  followUpInstructions?: string;
}
