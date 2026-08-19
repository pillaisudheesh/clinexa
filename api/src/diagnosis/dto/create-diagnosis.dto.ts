import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDiagnosisDto {
  @ApiProperty({
    description: 'Medical record ID',
    format: 'uuid',
  })
  @IsUUID()
  medicalRecordId!: string;

  @ApiPropertyOptional({
    description: 'Diagnosis code, such as ICD-10 code',
    example: 'G44.209',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Diagnosis name',
    example: 'Tension-type headache',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'Whether this is the primary diagnosis',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Additional clinical notes',
    example: 'Symptoms consistent with tension-type headache.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
