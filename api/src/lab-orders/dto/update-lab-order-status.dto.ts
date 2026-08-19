import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { LabOrderStatus } from '@prisma/client';

export class UpdateLabOrderStatusDto {
  @ApiProperty({
    enum: LabOrderStatus,
    example: LabOrderStatus.IN_PROGRESS,
  })
  @IsEnum(LabOrderStatus)
  status!: LabOrderStatus;
}
