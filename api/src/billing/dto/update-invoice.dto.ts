import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsDecimal, IsOptional, IsString } from 'class-validator';

export class UpdateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  discount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  tax?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
