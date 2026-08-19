import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

import { DepartmentSortField } from '../enums/department-sort-field.enum';

export class DepartmentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(DepartmentSortField)
  sortBy?: DepartmentSortField = DepartmentSortField.CREATED_AT;
}
