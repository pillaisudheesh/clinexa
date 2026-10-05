import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class SpecialtyQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
