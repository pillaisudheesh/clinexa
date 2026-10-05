import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsDecimal, IsOptional, IsString, Min } from 'class-validator';

export class UpdateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  @Min(0)
  discount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  @Min(0)
  tax?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
