import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean } from 'class-validator';

export class UpdateDoctorStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}
