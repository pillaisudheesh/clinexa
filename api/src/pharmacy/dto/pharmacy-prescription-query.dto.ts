import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PharmacyPrescriptionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['PENDING', 'PARTIALLY_DISPENSED', 'DISPENSED', 'CANCELLED'])
  status?: 'PENDING' | 'PARTIALLY_DISPENSED' | 'DISPENSED' | 'CANCELLED';
}
