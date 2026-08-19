import { Type } from 'class-transformer';

import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvoiceItemDto {
  @ApiProperty({
    description: 'Description of the billed item',
    example: 'Consultation',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'Quantity',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @ApiProperty({
    description: 'Unit price',
    example: 800,
  })
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Appointment associated with the invoice',
    format: 'uuid',
  })
  @IsUUID()
  appointmentId!: string;

  @ApiProperty({
    description: 'Invoice line items',
    type: [CreateInvoiceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];

  @ApiPropertyOptional({
    description: 'Discount amount',
    example: 50,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({
    description: 'Tax amount',
    example: 90,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiPropertyOptional({
    description: 'Invoice notes',
    example: 'Payment due at reception.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
