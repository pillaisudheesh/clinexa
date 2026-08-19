import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateRoleStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}
