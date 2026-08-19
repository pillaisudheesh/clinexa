import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AppointmentResponseDto } from './appointment-response.dto';
import { MedicalRecordResponseDto } from '../../medical-records/dto/medical-record-response.dto';
import { DiagnosisResponseDto } from '../../diagnosis/dto/diagnosis-response.dto';
import { PrescriptionResponseDto } from '../../prescriptions/dto/prescription-response.dto';
import { LabOrderResponseDto } from '../../lab-orders/dto/lab-order-response.dto';
import { InvoiceResponseDto } from '../../invoices/dto/invoice-response.dto';

export class ConsultationSummaryResponseDto {
  @ApiProperty({
    type: AppointmentResponseDto,
  })
  appointment!: AppointmentResponseDto;

  @ApiPropertyOptional({
    type: MedicalRecordResponseDto,
    nullable: true,
  })
  medicalRecord!: MedicalRecordResponseDto | null;

  @ApiProperty({
    type: [DiagnosisResponseDto],
  })
  diagnoses!: DiagnosisResponseDto[];

  @ApiProperty({
    type: [PrescriptionResponseDto],
  })
  prescriptions!: PrescriptionResponseDto[];

  @ApiProperty({
    type: [LabOrderResponseDto],
  })
  labOrders!: LabOrderResponseDto[];

  @ApiPropertyOptional({
    type: InvoiceResponseDto,
    nullable: true,
  })
  invoice!: InvoiceResponseDto | null;
}
