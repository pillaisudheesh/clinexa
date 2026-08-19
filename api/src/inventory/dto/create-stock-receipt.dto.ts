import { Type } from 'class-transformer';

import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockReceiptItemDto {
  @ApiProperty({
    description: 'Medicine ID',
    format: 'uuid',
  })
  @IsUUID()
  medicineId!: string;

  @ApiProperty({
    description: 'Batch number',
    example: 'PCM-2026-08-A',
  })
  @IsString()
  @IsNotEmpty()
  batchNumber!: string;

  @ApiProperty({
    description: 'Expiry date',
    example: '2027-08-31',
  })
  @IsDateString()
  expiryDate!: string;

  @ApiProperty({
    description: 'Quantity received',
    example: 100,
  })
  @IsInt()
  @IsPositive()
  quantity!: number;

  @ApiProperty({
    description: 'Purchase price per unit',
    example: 4.25,
  })
  @IsNumber()
  @Min(0)
  purchasePrice!: number;

  @ApiProperty({
    description: 'Selling price per unit',
    example: 5.5,
  })
  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @ApiPropertyOptional({
    description: 'Reorder level for this batch',
    example: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderLevel?: number;
}

export class CreateStockReceiptDto {
  @ApiProperty({
    description: 'Receipt number',
    example: 'GRN-2026-0001',
  })
  @IsString()
  @IsNotEmpty()
  receiptNumber!: string;

  @ApiPropertyOptional({
    description: 'Supplier name',
    example: 'ABC Pharmaceuticals',
  })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiPropertyOptional({
    description: 'Purchase invoice/reference number',
    example: 'SUP-INV-78231',
  })
  @IsOptional()
  @IsString()
  supplierInvoiceNumber?: string;

  @ApiPropertyOptional({
    description: 'Receipt notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Medicines received',
    type: [CreateStockReceiptItemDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateStockReceiptItemDto)
  items!: CreateStockReceiptItemDto[];
}
