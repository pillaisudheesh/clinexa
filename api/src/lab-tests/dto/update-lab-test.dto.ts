import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateLabTestDto {
  @ApiPropertyOptional({
    description: 'Lab test code',
    example: 'CBC',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Lab test name',
    example: 'Complete Blood Count',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the laboratory test',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Test category',
    example: 'Hematology',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Price of the test',
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Result unit',
    example: 'mg/dL',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    description: 'Normal/reference range',
    example: '13.0 - 17.0 g/dL',
  })
  @IsOptional()
  @IsString()
  normalRange?: string;
}
