import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateLabResultDto {
  @ApiProperty({
    description: 'Laboratory result',
    example: 'Hemoglobin: 14.2 g/dL',
  })
  @IsString()
  result!: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Within normal range.',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Date/time the test was performed',
    example: '2026-08-15T10:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  performedAt?: string;
}
