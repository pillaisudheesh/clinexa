import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MedicineBatchResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  clinicId!: string;

  @ApiProperty()
  medicineId!: string;

  @ApiProperty()
  medicineName!: string;

  @ApiProperty()
  batchNumber!: string;

  @ApiProperty()
  expiryDate!: Date;

  @ApiProperty()
  purchasePrice!: number;

  @ApiProperty()
  sellingPrice!: number;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  reorderLevel!: number;

  @ApiProperty()
  isLowStock!: boolean;

  @ApiProperty()
  isExpired!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
