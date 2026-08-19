import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @Length(2, 100)
  code!: string;

  @IsString()
  @Length(2, 100)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder = 0;
}
