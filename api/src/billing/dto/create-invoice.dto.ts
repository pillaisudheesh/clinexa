import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';

const NON_NEGATIVE_MONEY = /^\d+(\.\d{1,2})?$/;
const POSITIVE_MONEY = /^(?=.*[1-9])\d+(\.\d{1,2})?$/;

export class CreateInvoiceItemDto {
  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty({ example: '1.00', description: 'Must be greater than zero' })
  @Matches(POSITIVE_MONEY)
  quantity!: string;

  @ApiProperty({ example: '250.00' })
  @Matches(NON_NEGATIVE_MONEY)
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

export class CreateBillingInvoiceDto {
  @ApiProperty()
  @IsUUID()
  patientId!: string;

  @ApiProperty()
  @IsUUID()
  appointmentId!: string;

  @ApiPropertyOptional({ example: '0.00' })
  @IsOptional()
  @Matches(NON_NEGATIVE_MONEY)
  discount?: string;

  @ApiPropertyOptional({ example: '0.00' })
  @IsOptional()
  @Matches(NON_NEGATIVE_MONEY)
  tax?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];

  @ApiProperty({ enum: InvoiceType })
  @IsEnum(InvoiceType)
  type!: InvoiceType;
}
