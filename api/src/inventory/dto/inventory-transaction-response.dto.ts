import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { InventoryTransactionType } from '@prisma/client';

export class InventoryTransactionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  clinicId!: string;

  @ApiProperty()
  medicineBatchId!: string;

  @ApiProperty()
  medicineId!: string;

  @ApiProperty()
  medicineName!: string;

  @ApiProperty()
  batchNumber!: string;

  @ApiProperty({
    enum: InventoryTransactionType,
  })
  type!: InventoryTransactionType;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  previousQuantity!: number;

  @ApiProperty()
  newQuantity!: number;

  @ApiPropertyOptional()
  referenceId!: string | null;

  @ApiPropertyOptional()
  notes!: string | null;

  @ApiProperty()
  createdAt!: Date;
}
