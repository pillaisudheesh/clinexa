import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MedicineResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  clinicId!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  genericName!: string | null;

  @ApiPropertyOptional()
  manufacturer!: string | null;

  @ApiPropertyOptional()
  category!: string | null;

  @ApiPropertyOptional()
  strength!: string | null;

  @ApiPropertyOptional()
  form!: string | null;

  @ApiPropertyOptional()
  unit!: string | null;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
