import { ApiProperty } from '@nestjs/swagger';

export class InventorySummaryResponseDto {
  @ApiProperty({
    example: 125,
  })
  totalMedicines!: number;

  @ApiProperty({
    example: 248,
  })
  totalBatches!: number;

  @ApiProperty({
    example: 18450,
  })
  totalUnits!: number;

  @ApiProperty({
    example: 17,
  })
  lowStockBatches!: number;

  @ApiProperty({
    example: 8,
  })
  expiringSoonBatches!: number;

  @ApiProperty({
    example: 3,
  })
  expiredBatches!: number;
}
