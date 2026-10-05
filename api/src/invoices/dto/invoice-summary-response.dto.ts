import { ApiProperty } from '@nestjs/swagger';

export class InvoiceSummaryResponseDto {
  @ApiProperty()
  totalInvoices!: number;

  @ApiProperty()
  draftInvoices!: number;

  @ApiProperty()
  issuedInvoices!: number;

  @ApiProperty()
  partiallyPaidInvoices!: number;

  @ApiProperty()
  paidInvoices!: number;

  @ApiProperty()
  cancelledInvoices!: number;

  @ApiProperty()
  refundedInvoices!: number;

  @ApiProperty()
  totalBilled!: number;

  @ApiProperty()
  totalCollected!: number;

  @ApiProperty()
  totalOutstanding!: number;
}
