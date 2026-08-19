import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ExpiringStockQueryDto {
  @ApiPropertyOptional({
    description: 'Number of days within which batches are considered expiring',
    example: 90,
    default: 90,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days = 90;
}
