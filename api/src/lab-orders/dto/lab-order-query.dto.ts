import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

import { LabOrderStatus } from '@prisma/client';

export class LabOrderQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by patient',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({
    description: 'Filter by doctor',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by appointment',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiPropertyOptional({
    enum: LabOrderStatus,
  })
  @IsOptional()
  @IsEnum(LabOrderStatus)
  status?: LabOrderStatus;
}
