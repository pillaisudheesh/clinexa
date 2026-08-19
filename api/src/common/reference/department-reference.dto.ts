import { ApiProperty } from '@nestjs/swagger';

export class DepartmentReferenceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}
