import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class DispensePrescriptionDto {
  @ApiPropertyOptional({
    description: 'Draft invoice to which pharmacy charges should be added',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiPropertyOptional({
    example: 'Dispensed at pharmacy counter',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
