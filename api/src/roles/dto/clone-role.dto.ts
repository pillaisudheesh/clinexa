import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CloneRoleDto {
  @ApiProperty()
  @IsString()
  @Length(2, 100)
  code!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
