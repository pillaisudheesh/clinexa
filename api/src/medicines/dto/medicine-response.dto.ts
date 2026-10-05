import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MedicineResponseDto {
  @ApiProperty({
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
  })
  clinicId!: string;

  @ApiProperty({
    example: 'Paracetamol 500 mg',
  })
  name!: string;

  @ApiPropertyOptional({
    example: 'Paracetamol',
  })
  genericName!: string | null;

  @ApiPropertyOptional({
    example: 'ABC Pharmaceuticals',
  })
  manufacturer!: string | null;

  @ApiPropertyOptional({
    example: 'Analgesic',
  })
  category!: string | null;

  @ApiPropertyOptional({
    example: '500 mg',
  })
  strength!: string | null;

  @ApiPropertyOptional({
    example: 'Tablet',
  })
  form!: string | null;

  @ApiPropertyOptional({
    example: 'tablet',
  })
  unit!: string | null;

  @ApiProperty({
    example: 2.5,
    type: Number,
  })
  price!: number;

  @ApiProperty({
    example: true,
  })
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
