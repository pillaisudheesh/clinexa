import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMedicalRecordDto {
  @ApiPropertyOptional({
    description: 'Primary reason for the consultation',
  })
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional({
    description: 'History of present illness',
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
