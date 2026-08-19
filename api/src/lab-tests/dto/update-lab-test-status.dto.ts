import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateLabTestStatusDto {
  @ApiProperty({
    description: 'Whether the laboratory test is active',
    example: true,
  })
  @IsBoolean()
  isActive!: boolean;
}
