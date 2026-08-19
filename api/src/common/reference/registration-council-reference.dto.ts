import { ApiProperty } from '@nestjs/swagger';

export class RegistrationCouncilReferenceDto {
  @ApiProperty({
    example: '0a4bb37f-a4f8-40bc-bf8f-32162d8b2d4a',
  })
  id!: string;

  @ApiProperty({
    example: 'MCI',
  })
  code!: string;

  @ApiProperty({
    example: 'Medical Council of India',
  })
  name!: string;
}
