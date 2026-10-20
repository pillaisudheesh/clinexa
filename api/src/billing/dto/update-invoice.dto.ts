import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

const NON_NEGATIVE_MONEY = /^\d+(\.\d{1,2})?$/;

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ example: '0.00' })
  @IsOptional()
  @Matches(NON_NEGATIVE_MONEY)
  discount?: string;

  @ApiPropertyOptional({ example: '0.00' })
  @IsOptional()
  @Matches(NON_NEGATIVE_MONEY)
  tax?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
