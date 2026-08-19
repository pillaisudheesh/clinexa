import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateDiagnosisDto {
  @ApiPropertyOptional({
    description: 'Diagnosis code',
    example: 'G44.209',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Diagnosis name',
    example: 'Tension-type headache',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Whether this is the primary diagnosis',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Additional clinical notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
