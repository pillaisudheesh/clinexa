import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export enum OrganizationBranchSortField {
  NAME = 'name',
  CODE = 'code',
  CREATED_AT = 'createdAt',
}

export class OrganizationBranchQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OrganizationBranchSortField)
  sortBy: OrganizationBranchSortField = OrganizationBranchSortField.CREATED_AT;
}
