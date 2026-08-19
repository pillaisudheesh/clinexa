import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LabTestResponseDto {
  @ApiProperty({
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
  })
  clinicId!: string;

  @ApiProperty({
    example: 'CBC',
  })
  code!: string;

  @ApiProperty({
    example: 'Complete Blood Count',
  })
  name!: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional({
    example: 'Hematology',
  })
  category?: string | null;

  @ApiProperty({
    example: 500,
  })
  price!: number;

  @ApiPropertyOptional({
    example: 'mg/dL',
  })
  unit?: string | null;

  @ApiPropertyOptional({
    example: '13.0 - 17.0 g/dL',
  })
  normalRange?: string | null;

  @ApiProperty({
    example: true,
  })
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
