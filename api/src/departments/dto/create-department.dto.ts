import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @Length(2, 50)
  code!: string;

  @IsString()
  @Length(2, 150)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number = 0;
}
