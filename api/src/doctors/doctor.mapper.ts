import { DoctorWithRelations } from './doctor.prisma';

import { DoctorResponseDto } from './dto/doctor-response.dto';

import { ReferenceMapper } from '../common/mappers/reference.mapper';

export class DoctorMapper {
  static toResponse(doctor: DoctorWithRelations): DoctorResponseDto {
    return {
      id: doctor.id,

      doctorNumber: doctor.doctorNumber,

      title: doctor.title,

      firstName: doctor.firstName,

      middleName: doctor.middleName ?? undefined,

      lastName: doctor.lastName,

      gender: doctor.gender,

      dateOfBirth: doctor.dateOfBirth ?? undefined,

      email: doctor.email ?? undefined,

      phone: doctor.phone ?? undefined,

      biography: doctor.biography ?? undefined,

      yearsOfExperience: doctor.yearsOfExperience ?? undefined,

      employmentType: doctor.employmentType,

      registrationNumber: doctor.registrationNumber ?? undefined,

      registrationCouncil: doctor.registrationCouncil
        ? ReferenceMapper.toRegistrationCouncil(doctor.registrationCouncil)
        : undefined,

      department: ReferenceMapper.toDepartment(doctor.department),

      primarySpecialty: ReferenceMapper.toSpecialty(doctor.primarySpecialty),

      specialties: doctor.specialties.map((item) =>
        ReferenceMapper.toSpecialty(item.specialty),
      ),

      qualifications: doctor.qualifications.map((item) =>
        ReferenceMapper.toQualification(item.qualification),
      ),

      languages: doctor.languages.map((item) =>
        ReferenceMapper.toLanguage(item.language),
      ),

      isActive: doctor.isActive,

      createdAt: doctor.createdAt,

      updatedAt: doctor.updatedAt,
    };
  }

  static toResponseList(doctors: DoctorWithRelations[]): DoctorResponseDto[] {
    return doctors.map((doctor) => DoctorMapper.toResponse(doctor));
  }
}
