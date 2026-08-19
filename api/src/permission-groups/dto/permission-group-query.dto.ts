import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PermissionGroupSortField } from '../enums/permission-group-sort-field.enum';

export class PermissionGroupQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(PermissionGroupSortField)
  sortBy?: PermissionGroupSortField = PermissionGroupSortField.DISPLAY_ORDER;
}
