import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ClinicSortField } from '../enums/clinic-sort-field.enum';

export class ClinicQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ClinicSortField)
  sortBy?: ClinicSortField = ClinicSortField.CREATED_AT;
}
