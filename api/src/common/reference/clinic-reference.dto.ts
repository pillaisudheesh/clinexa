import { ApiProperty } from '@nestjs/swagger';

export class ClinicReferenceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    example: 'CLX001',
  })
  code!: string;

  @ApiProperty({
    example: 'SamaRoot Medical Centre',
  })
  name!: string;
}
