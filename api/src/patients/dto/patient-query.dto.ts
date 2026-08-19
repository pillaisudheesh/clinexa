import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

import { PatientSortField } from '../enums/patient-sort-field.enum';

export class PatientQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(PatientSortField)
  sortBy?: PatientSortField = PatientSortField.CREATED_AT;
}
