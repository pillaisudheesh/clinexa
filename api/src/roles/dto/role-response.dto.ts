import { ApiProperty } from '@nestjs/swagger';

class ClinicSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

export class RoleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string | null;

  @ApiProperty()
  displayOrder!: number;

  @ApiProperty()
  isSystem!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({
    type: ClinicSummaryDto,
  })
  clinic!: ClinicSummaryDto;

  @ApiProperty()
  permissionCount!: number;

  @ApiProperty()
  userCount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
