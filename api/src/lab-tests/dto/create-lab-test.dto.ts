import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateLabTestDto {
  @ApiProperty({
    description: 'Lab test code',
    example: 'CBC',
  })
  @IsString()
  code!: string;

  @ApiProperty({
    description: 'Lab test name',
    example: 'Complete Blood Count',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'Description of the laboratory test',
    example: 'Complete blood count including hemoglobin and platelet count.',
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

  @ApiProperty({
    description: 'Price of the test',
    example: 500,
  })
  @IsNumber()
  @Min(0)
  price!: number;

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
