import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UserSortField } from '../enums/user-sort-field-enum';

export class UserQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(UserSortField)
  sortBy: UserSortField = UserSortField.CREATED_AT;
}
