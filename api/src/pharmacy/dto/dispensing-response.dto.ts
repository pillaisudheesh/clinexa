import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DispensingItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  medicineId!: string;

  @ApiProperty()
  medicineName!: string;

  @ApiProperty()
  medicineBatchId!: string;

  @ApiProperty()
  batchNumber!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPrice!: number;

  @ApiProperty()
  amount!: number;
}

export class DispensingResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  clinicId!: string;

  @ApiProperty()
  prescriptionId!: string;

  @ApiPropertyOptional()
  invoiceId!: string | null;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({
    type: [DispensingItemResponseDto],
  })
  items!: DispensingItemResponseDto[];
}
