import { ApiProperty } from '@nestjs/swagger';

import { BloodGroup, Gender, MaritalStatus } from '@prisma/client';

class ClinicSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

export class PatientResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  patientNumber!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  middleName!: string | null;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  fullName!: string;

  age!: number;

  @ApiProperty({ enum: Gender })
  gender!: Gender;

  @ApiProperty()
  dateOfBirth!: Date;

  @ApiProperty({ required: false })
  phone!: string | null;

  @ApiProperty({ required: false })
  email!: string | null;

  @ApiProperty({ enum: BloodGroup, required: false })
  bloodGroup!: BloodGroup | null;

  @ApiProperty({ enum: MaritalStatus, required: false })
  maritalStatus!: MaritalStatus | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: ClinicSummaryDto })
  clinic!: ClinicSummaryDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ required: false })
  addressLine1!: string | null;

  @ApiProperty({ required: false })
  addressLine2!: string | null;

  @ApiProperty({ required: false })
  city!: string | null;

  @ApiProperty({ required: false })
  state!: string | null;

  @ApiProperty({ required: false })
  country!: string | null;

  @ApiProperty({ required: false })
  postalCode!: string | null;

  @ApiProperty({ required: false })
  emergencyContactName!: string | null;

  @ApiProperty({ required: false })
  emergencyContactPhone!: string | null;

  @ApiProperty({ required: false })
  emergencyContactRelation!: string | null;
}
