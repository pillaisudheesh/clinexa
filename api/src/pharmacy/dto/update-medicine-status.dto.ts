import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateMedicineStatusDto {
  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  isActive!: boolean;
}
