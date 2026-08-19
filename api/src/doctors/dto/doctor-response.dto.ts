import { EmploymentType, Gender, DoctorTitle } from '@prisma/client';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DepartmentReferenceDto } from '../../common/reference/department-reference.dto';
import { SpecialtyReferenceDto } from '../../common/reference/specialty-reference.dto';
import { QualificationReferenceDto } from '../../common/reference/qualification-reference.dto';
import { LanguageReferenceDto } from '../../common/reference/language-reference.dto';
import { RegistrationCouncilReferenceDto } from '../../common/reference/registration-council-reference.dto';

export class DoctorResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  doctorNumber!: string;

  @ApiProperty({
    enum: DoctorTitle,
  })
  title!: DoctorTitle;

  @ApiProperty()
  firstName!: string;

  @ApiPropertyOptional()
  middleName?: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({
    enum: Gender,
  })
  gender!: Gender;

  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  biography?: string;

  @ApiPropertyOptional()
  yearsOfExperience?: number;

  @ApiProperty({
    enum: EmploymentType,
  })
  employmentType!: EmploymentType;

  @ApiPropertyOptional()
  registrationNumber?: string;

  @ApiPropertyOptional({
    type: RegistrationCouncilReferenceDto,
  })
  registrationCouncil?: RegistrationCouncilReferenceDto;

  @ApiProperty({
    type: DepartmentReferenceDto,
  })
  department!: DepartmentReferenceDto;

  @ApiProperty({
    type: SpecialtyReferenceDto,
  })
  primarySpecialty!: SpecialtyReferenceDto;

  @ApiProperty({
    type: [SpecialtyReferenceDto],
  })
  specialties!: SpecialtyReferenceDto[];

  @ApiProperty({
    type: [QualificationReferenceDto],
  })
  qualifications!: QualificationReferenceDto[];

  @ApiProperty({
    type: [LanguageReferenceDto],
  })
  languages!: LanguageReferenceDto[];

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
