import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { DoctorSortField } from '../enums/doctor-sort-field.enum';

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
