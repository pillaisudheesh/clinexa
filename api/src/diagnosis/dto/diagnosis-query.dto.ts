import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class DiagnosisQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter diagnoses by medical record',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  medicalRecordId?: string;
}
