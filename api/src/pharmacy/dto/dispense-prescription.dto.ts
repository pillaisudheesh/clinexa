import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class DispensePrescriptionDto {
  @ApiPropertyOptional({
    description:
      'Quantity to dispense in this operation. Defaults to the outstanding prescribed quantity.',
    example: 30,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

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
