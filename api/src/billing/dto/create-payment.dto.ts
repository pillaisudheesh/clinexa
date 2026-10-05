import { PaymentMethod } from '@prisma/client';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsDecimal, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty()
  @IsDecimal()
  amount!: string;

  @ApiProperty({
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
