import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsArray,
  IsDecimal,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsDecimal()
  @Min(0)
  quantity!: string;

  @ApiProperty()
  @IsDecimal()
  @Min(0)
  unitPrice!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  labOrderItemId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  pharmacyDispensingItemId?: string;
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsUUID()
  patientId!: string;

  @ApiProperty()
  @IsUUID()
  appointmentId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  @Min(0)
  discount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  @Min(0)
  tax?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    type: [CreateInvoiceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];
}
