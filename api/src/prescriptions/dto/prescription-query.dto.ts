import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class PrescriptionQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter prescriptions by medical record',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  medicalRecordId?: string;

  @ApiPropertyOptional({
    description: 'Filter prescriptions by medicine',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  medicineId?: string;
}
