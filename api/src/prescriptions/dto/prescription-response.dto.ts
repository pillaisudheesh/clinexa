import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PrescriptionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  medicalRecordId!: string;

  @ApiProperty()
  medicineId!: string;

  @ApiProperty()
  medicationName!: string;

  @ApiProperty()
  dosage!: string;

  @ApiProperty()
  frequency!: string;

  @ApiPropertyOptional()
  route!: string | null;

  @ApiPropertyOptional()
  duration!: string | null;

  @ApiPropertyOptional()
  quantity!: string | null;

  @ApiPropertyOptional()
  instructions!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({
    example: 'RX-2026-000001',
    description: 'Human-readable prescription reference number',
  })
  prescriptionNumber!: string;
}
