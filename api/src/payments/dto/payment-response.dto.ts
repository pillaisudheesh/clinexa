import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty({
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
  })
  invoiceId!: string;

  @ApiProperty({
    example: 500,
  })
  amount!: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  method!: PaymentMethod;

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.SUCCESS,
  })
  status!: PaymentStatus;

  @ApiPropertyOptional({
    example: 'TXN-2026-000123',
  })
  transactionReference?: string | null;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  paidAt!: Date;

  @ApiProperty()
  createdAt!: Date;
}
