import { ApiProperty } from '@nestjs/swagger';

export class DoctorReferenceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    example: 'CLX-DOC-000001',
  })
  doctorNumber!: string;

  @ApiProperty({
    example: 'Dr Rahul',
  })
  firstName!: string;

  @ApiProperty({
    example: 'Nair',
  })
  lastName!: string;
}
