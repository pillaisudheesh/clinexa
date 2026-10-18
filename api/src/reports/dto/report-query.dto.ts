import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ReportQueryDto {
  @ApiPropertyOptional({ description: 'Inclusive report start date', example: '2026-10-01' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Inclusive report end date', example: '2026-10-08' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
