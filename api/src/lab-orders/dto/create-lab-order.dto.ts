import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateLabOrderDto {
  @ApiProperty({
    description: 'Appointment associated with the lab order',
    format: 'uuid',
  })
  @IsUUID()
  appointmentId!: string;

  @ApiProperty({
    description: 'Laboratory tests to order',
    type: [String],
    example: ['cbc-test-uuid', 'blood-glucose-test-uuid'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  labTestIds!: string[];

  @ApiPropertyOptional({
    description: 'Additional notes for the laboratory',
    example: 'Patient should be fasting.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
