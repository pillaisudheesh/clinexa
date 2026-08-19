import { ApiProperty } from '@nestjs/swagger';

export class LanguageReferenceDto {
  @ApiProperty({
    example: 'b1bc4bc4-df9f-43c4-bd85-df4b8a81d57f',
  })
  id!: string;

  @ApiProperty({
    example: 'EN',
  })
  code!: string;

  @ApiProperty({
    example: 'English',
  })
  name!: string;
}
