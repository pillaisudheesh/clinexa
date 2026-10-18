import { EmploymentType, Gender, DoctorTitle } from '@prisma/client';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsNumber,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty()
  @IsEnum(DoctorTitle)
  title!: DoctorTitle;

  @ApiProperty()
  @IsString()
  firstName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty()
  @IsString()
  lastName!: string;

  @ApiProperty()
  @IsEnum(Gender)
  gender!: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty()
  @IsUUID()
  departmentId!: string;

  @ApiProperty()
  @IsUUID()
  primarySpecialtyId!: string;

  @ApiPropertyOptional({
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  additionalSpecialtyIds?: string[];

  @ApiProperty({ description: 'Standard consultation fee', example: 500 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  consultationFee!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  followUpFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  emergencyFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  teleConsultationFee?: number;

  @ApiPropertyOptional({ type: [Number], description: 'Weekdays: Sunday=0 through Saturday=6' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  scheduleDays?: number[];

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  scheduleStartTime?: string;

  @ApiPropertyOptional({ example: '17:00' })
  @IsOptional()
  @IsString()
  scheduleEndTime?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(240)
  slotDuration?: number;

  @ApiPropertyOptional({
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  qualificationIds?: string[];

  @ApiPropertyOptional({
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  languageIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  registrationCouncilId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  yearsOfExperience?: number;

  @ApiProperty()
  @IsEnum(EmploymentType)
  employmentType!: EmploymentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  biography?: string;
}
