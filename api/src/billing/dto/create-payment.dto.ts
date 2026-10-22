import { PaymentMethod } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

export class CreateBillingPaymentDto {
  @ApiProperty({ example: '250.00', description: 'Must be greater than zero' })
  @Matches(/^\d+(\.\d{1,2})?$/)
  amount!: string;

  @ApiProperty({ enum: PaymentMethod })
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
