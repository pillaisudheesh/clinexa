import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

import { InvoiceStatus } from '@prisma/client';

export class InvoiceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by patient',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({
    description: 'Filter by appointment',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by invoice status',
    enum: InvoiceStatus,
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}
