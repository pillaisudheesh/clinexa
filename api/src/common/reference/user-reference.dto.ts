import { ApiProperty } from '@nestjs/swagger';

export class UserReferenceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    example: 'John',
  })
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
  })
  lastName!: string;

  @ApiProperty({
    example: 'john.doe@samaroot.com',
  })
  email!: string;
}
