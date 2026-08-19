import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'Medical record associated with the prescription',
    format: 'uuid',
  })
  @IsUUID()
  medicalRecordId!: string;

  @ApiProperty({
    description: 'Medicine being prescribed',
    format: 'uuid',
  })
  @IsUUID()
  medicineId!: string;

  @ApiProperty({
    example: '500 mg',
  })
  @IsString()
  dosage!: string;

  @ApiProperty({
    example: 'Twice daily',
  })
  @IsString()
  frequency!: string;

  @ApiPropertyOptional({
    example: 'Oral',
  })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional({
    example: '5 days',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({
    example: '10 tablets',
  })
  @IsOptional()
  @IsString()
  quantity?: string;

  @ApiPropertyOptional({
    example: 'Take after food',
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}
