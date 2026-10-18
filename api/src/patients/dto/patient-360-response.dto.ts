import { ApiProperty } from '@nestjs/swagger';

import { PatientResponseDto } from './patient-response.dto';

export class Patient360ResponseDto {
  @ApiProperty({ type: PatientResponseDto })
  patient!: PatientResponseDto;

  @ApiProperty({
    type: [Object],
  })
  appointments!: Record<string, unknown>[];

  @ApiProperty({
    type: [Object],
  })
  medicalRecords!: Record<string, unknown>[];

  @ApiProperty({
    type: [Object],
  })
  labOrders!: Record<string, unknown>[];

  @ApiProperty({
    type: [Object],
  })
  invoices!: Record<string, unknown>[];
}
