import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { InventoryTransactionType } from '@prisma/client';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class InventoryTransactionQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by medicine',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  medicineId?: string;

  @ApiPropertyOptional({
    description: 'Filter by medicine batch',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  medicineBatchId?: string;

  @ApiPropertyOptional({
    description: 'Filter by transaction type',
    enum: InventoryTransactionType,
  })
  @IsOptional()
  @IsEnum(InventoryTransactionType)
  type?: InventoryTransactionType;

  @ApiPropertyOptional({
    description: 'Transactions from this date',
    example: '2026-08-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Transactions until this date',
    example: '2026-08-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
