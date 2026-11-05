import { IsEnum, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ClinicSortField } from '../enums/clinic-sort-field.enum';

export class ClinicQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ClinicSortField)
  sortBy?: ClinicSortField = ClinicSortField.CREATED_AT;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  independent?: boolean;
}
