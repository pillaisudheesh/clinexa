import { Transform, TransformFnParams } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { DoctorSortField } from '../enums/doctor-sort-field.enum';

function transformBoolean({
  value,
}: TransformFnParams): boolean | string | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false) {
    return false;
  }

  return String(value);
}

export class DoctorQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by department',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by specialty',
  })
  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(transformBoolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: DoctorSortField,
    default: DoctorSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(DoctorSortField)
  declare sortBy?: DoctorSortField;
}
