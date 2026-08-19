import { IsInt, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AdjustStockDto {
  @ApiProperty({
    example: 25,
    description:
      'Positive quantity adds stock; negative quantity removes stock.',
  })
  @IsInt()
  quantity!: number;

  @ApiProperty({
    example: 'Stock count correction',
  })
  @IsString()
  notes!: string;
}
