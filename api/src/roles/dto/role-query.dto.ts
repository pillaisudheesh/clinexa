import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

import { RoleSortField } from '../enums/role-sort-field.enum';

export class RoleQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(RoleSortField)
  sortBy?: RoleSortField = RoleSortField.DISPLAY_ORDER;
}
