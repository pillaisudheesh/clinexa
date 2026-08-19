import { ApiProperty } from '@nestjs/swagger';

export class SpecialtyReferenceDto {
  @ApiProperty({
    example: '6cfd59fb-f584-4f40-84d5-8c27fc7f07f',
  })
  id!: string;

  @ApiProperty({
    example: 'INTERVENTIONAL_CARDIOLOGY',
  })
  code!: string;

  @ApiProperty({
    example: 'Interventional Cardiology',
  })
  name!: string;
}
