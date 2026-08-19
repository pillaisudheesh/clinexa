import { ApiProperty } from '@nestjs/swagger';

export class PatientReferenceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    example: 'CLX-PAT-000001',
  })
  patientNumber!: string;

  @ApiProperty({
    example: 'John',
  })
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
  })
  lastName!: string;
}
