import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdatePrescriptionDto {
  @ApiPropertyOptional({
    description: 'Medicine being prescribed',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  medicineId?: string;

  @ApiPropertyOptional({
    description: 'Medication dosage',
    example: '500 mg',
  })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional({
    description: 'Medication frequency',
    example: 'Twice daily',
  })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional({
    description: 'Route of administration',
    example: 'Oral',
  })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional({
    description: 'Duration of treatment',
    example: '5 days',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({
    description: 'Quantity to dispense',
    example: '10 tablets',
  })
  @IsOptional()
  @IsString()
  quantity?: string;

  @ApiPropertyOptional({
    description: 'Additional medication instructions',
    example: 'Take after food',
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}
