import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMedicineBatchDto {
  @ApiProperty({
    format: 'uuid',
  })
  @IsString()
  medicineId!: string;

  @ApiProperty({
    example: 'BATCH-2026-001',
  })
  @IsString()
  batchNumber!: string;

  @ApiProperty({
    example: '2027-12-31',
  })
  @IsDateString()
  expiryDate!: string;

  @ApiProperty({
    example: 4.25,
  })
  @IsNumber()
  @Min(0)
  purchasePrice!: number;

  @ApiProperty({
    example: 5.5,
  })
  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @ApiProperty({
    example: 100,
  })
  @IsInt()
  @IsPositive()
  quantity!: number;

  @ApiPropertyOptional({
    example: 20,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderLevel?: number;

  @ApiPropertyOptional({
    example: 'Initial stock received',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
