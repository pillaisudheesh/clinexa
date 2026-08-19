import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { InvoiceStatus } from '@prisma/client';

export class InvoiceItemResponseDto {
  @ApiProperty({
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
  })
  invoiceId!: string;

  @ApiProperty({
    example: 'Consultation',
  })
  description!: string;

  @ApiProperty({
    example: 1,
  })
  quantity!: number;

  @ApiProperty({
    example: 800,
  })
  unitPrice!: number;

  @ApiProperty({
    example: 800,
  })
  amount!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class InvoiceResponseDto {
  @ApiProperty({
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: 'INV-2026-000001',
  })
  invoiceNumber!: string;

  @ApiProperty({
    format: 'uuid',
  })
  clinicId!: string;

  @ApiProperty({
    format: 'uuid',
  })
  patientId!: string;

  @ApiProperty({
    format: 'uuid',
  })
  appointmentId!: string;

  @ApiProperty({
    enum: InvoiceStatus,
    example: InvoiceStatus.ISSUED,
  })
  status!: InvoiceStatus;

  @ApiProperty({
    example: 1000,
  })
  subtotal!: number;

  @ApiProperty({
    example: 50,
  })
  discount!: number;

  @ApiProperty({
    example: 90,
  })
  tax!: number;

  @ApiProperty({
    example: 1040,
  })
  total!: number;

  @ApiProperty({
    example: 500,
  })
  amountPaid!: number;

  @ApiProperty({
    example: 540,
  })
  balanceDue!: number;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiPropertyOptional()
  issuedAt?: Date | null;

  @ApiPropertyOptional()
  dueAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({
    type: [InvoiceItemResponseDto],
  })
  items!: InvoiceItemResponseDto[];
}
