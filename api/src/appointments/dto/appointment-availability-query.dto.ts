import { ApiProperty } from '@nestjs/swagger';

import { IsDateString, IsString } from 'class-validator';

export class AppointmentAvailabilityQueryDto {
  @ApiProperty({
    description: 'Doctor ID',
    example: '7f2c3b8e-1234-4567-8901-123456789abc',
  })
  @IsString()
  doctorId!: string;

  @ApiProperty({
    description: 'Date for which availability is required',
    example: '2026-08-24',
    format: 'date',
  })
  @IsDateString()
  date!: string;
}
