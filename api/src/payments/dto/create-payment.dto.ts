import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Invoice ID',
    format: 'uuid',
  })
  @IsUUID()
  invoiceId!: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 500,
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Payment transaction reference',
    example: 'TXN-2026-000123',
  })
  @IsOptional()
  @IsString()
  transactionReference?: string;

  @ApiPropertyOptional({
    description: 'Payment notes',
    example: 'Payment received at reception.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
