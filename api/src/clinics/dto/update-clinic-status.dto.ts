import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateClinicStatusDto {
  @ApiProperty({
    example: false,
    description: 'Clinic active status',
  })
  @IsBoolean()
  isActive: boolean;
}
