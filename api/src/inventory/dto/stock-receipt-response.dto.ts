import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockReceiptItemResponseDto {
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
  purchasePrice!: number;

  @ApiProperty()
  sellingPrice!: number;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  expiryDate!: Date;
}

export class StockReceiptResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  clinicId!: string;

  @ApiProperty()
  receiptNumber!: string;

  @ApiPropertyOptional()
  supplierName!: string | null;

  @ApiPropertyOptional()
  supplierInvoiceNumber!: string | null;

  @ApiPropertyOptional()
  notes!: string | null;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({
    type: [StockReceiptItemResponseDto],
  })
  items!: StockReceiptItemResponseDto[];
}
