import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { InvoiceStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class InvoiceQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: InvoiceStatus,
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patientId?: string;
}
