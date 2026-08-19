import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiagnosisResponseDto {
  @ApiProperty({
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
  })
  medicalRecordId!: string;

  @ApiPropertyOptional({
    example: 'G44.209',
  })
  code?: string | null;

  @ApiProperty({
    example: 'Tension-type headache',
  })
  name!: string;

  @ApiProperty({
    example: true,
  })
  isPrimary!: boolean;

  @ApiPropertyOptional({
    example: 'Symptoms consistent with tension-type headache.',
  })
  notes?: string | null;

  @ApiProperty()
  createdAt!: Date;
}
