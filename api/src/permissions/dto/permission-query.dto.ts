import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

import { PermissionSortField } from '../enums/permission-sort-field.enum';

export class PermissionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(PermissionSortField)
  sortBy?: PermissionSortField = PermissionSortField.NAME;

  @IsOptional()
  @IsUUID()
  permissionGroupId?: string;

  @IsOptional()
  permissionGroupCode?: string;
}
