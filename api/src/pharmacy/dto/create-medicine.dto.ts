import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMedicineDto {
  @ApiProperty({
    example: 'Paracetamol 500mg',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'Paracetamol',
  })
  @IsOptional()
  @IsString()
  genericName?: string;

  @ApiPropertyOptional({
    example: 'ABC Pharmaceuticals',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({
    example: 'Analgesic',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: '500 mg',
  })
  @IsOptional()
  @IsString()
  strength?: string;

  @ApiPropertyOptional({
    example: 'Tablet',
  })
  @IsOptional()
  @IsString()
  form?: string;

  @ApiPropertyOptional({
    example: 'Tablet',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    example: 5.5,
  })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
