import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LabOrderItemStatus, LabOrderStatus } from '@prisma/client';

export class LabResultResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  labOrderItemId!: string;

  @ApiProperty()
  result!: string;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiPropertyOptional()
  performedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class LabOrderItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  labOrderId!: string;

  @ApiProperty()
  labTestId!: string;

  @ApiProperty()
  labTestCode!: string;

  @ApiProperty()
  labTestName!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty({
    enum: LabOrderItemStatus,
  })
  status!: LabOrderItemStatus;

  @ApiPropertyOptional({
    type: LabResultResponseDto,
    nullable: true,
  })
  result?: LabResultResponseDto | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class LabOrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  clinicId!: string;

  @ApiProperty()
  patientId!: string;

  @ApiProperty()
  doctorId!: string;

  @ApiProperty()
  appointmentId!: string;

  @ApiProperty({
    enum: LabOrderStatus,
  })
  status!: LabOrderStatus;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty({
    type: [LabOrderItemResponseDto],
  })
  items!: LabOrderItemResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
