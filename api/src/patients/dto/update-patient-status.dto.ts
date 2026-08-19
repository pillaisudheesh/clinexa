import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdatePatientStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}
