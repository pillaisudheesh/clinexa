import { ApiProperty } from '@nestjs/swagger';

class PermissionGroupDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

export class PermissionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string | null;

  @ApiProperty()
  isSystem!: boolean;

  @ApiProperty({
    type: PermissionGroupDto,
  })
  permissionGroup!: PermissionGroupDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
