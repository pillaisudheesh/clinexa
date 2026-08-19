import { ApiProperty } from '@nestjs/swagger';

export class QualificationReferenceDto {
  @ApiProperty({
    example: '9d1a7b6d-c01f-43b4-9552-c234f98dfc1e',
  })
  id!: string;

  @ApiProperty({
    example: 'MBBS',
  })
  code!: string;

  @ApiProperty({
    example: 'Bachelor of Medicine, Bachelor of Surgery',
  })
  name!: string;
}
