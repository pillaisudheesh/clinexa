import { Clinic } from '@prisma/client';
import { ClinicResponseDto } from '../dto/clinic-response.dto';

export class ClinicMapper {
  static toResponseDto(clinic: Clinic): ClinicResponseDto {
    return {
      id: clinic.id,
      code: clinic.code,
      name: clinic.name,
      email: clinic.email,
      phone: clinic.phone,
      website: clinic.website,
      addressLine1: clinic.addressLine1,
      addressLine2: clinic.addressLine2,
      city: clinic.city,
      state: clinic.state,
      country: clinic.country,
      postalCode: clinic.postalCode,
      timezone: clinic.timezone,
      isActive: clinic.isActive,
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
    };
  }
}
