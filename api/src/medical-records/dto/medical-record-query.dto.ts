import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class MedicalRecordQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by patient ID',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({
    description: 'Filter by doctor ID',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by appointment ID',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;
}
