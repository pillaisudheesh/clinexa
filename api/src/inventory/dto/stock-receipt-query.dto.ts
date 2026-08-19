import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class StockReceiptQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by receipt number',
    example: 'GRN-2026',
  })
  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @ApiPropertyOptional({
    description: 'Filter by supplier name',
    example: 'ABC Pharmaceuticals',
  })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiPropertyOptional({
    description: 'Filter receipts from this date',
    example: '2026-08-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter receipts until this date',
    example: '2026-08-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
