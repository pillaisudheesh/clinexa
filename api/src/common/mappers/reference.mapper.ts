import {
  Clinic,
  Department,
  Doctor,
  Language,
  Patient,
  Qualification,
  RegistrationCouncil,
  Specialty,
  User,
} from '@prisma/client';

import { ClinicReferenceDto } from '../reference/clinic-reference.dto';
import { DepartmentReferenceDto } from '../reference/department-reference.dto';
import { DoctorReferenceDto } from '../reference/doctor-reference.dto';
import { LanguageReferenceDto } from '../reference/language-reference.dto';
import { PatientReferenceDto } from '../reference/patient-reference.dto';
import { QualificationReferenceDto } from '../reference/qualification-reference.dto';
import { RegistrationCouncilReferenceDto } from '../reference/registration-council-reference.dto';
import { SpecialtyReferenceDto } from '../reference/specialty-reference.dto';
import { UserReferenceDto } from '../reference/user-reference.dto';

export class ReferenceMapper {
  static toClinic(clinic: Clinic): ClinicReferenceDto {
    return {
      id: clinic.id,
      code: clinic.code,
      name: clinic.name,
    };
  }

  static toDepartment(department: Department): DepartmentReferenceDto {
    return {
      id: department.id,
      code: department.code,
      name: department.name,
    };
  }

  static toSpecialty(specialty: Specialty): SpecialtyReferenceDto {
    return {
      id: specialty.id,
      code: specialty.code,
      name: specialty.name,
    };
  }

  static toQualification(
    qualification: Qualification,
  ): QualificationReferenceDto {
    return {
      id: qualification.id,
      code: qualification.code,
      name: qualification.name,
    };
  }

  static toLanguage(language: Language): LanguageReferenceDto {
    return {
      id: language.id,
      code: language.code,
      name: language.name,
    };
  }

  static toRegistrationCouncil(
    council: RegistrationCouncil,
  ): RegistrationCouncilReferenceDto {
    return {
      id: council.id,
      code: council.code,
      name: council.name,
    };
  }

  static toDoctor(doctor: Doctor): DoctorReferenceDto {
    return {
      id: doctor.id,
      doctorNumber: doctor.doctorNumber,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
    };
  }

  static toPatient(patient: Patient): PatientReferenceDto {
    return {
      id: patient.id,
      patientNumber: patient.patientNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
    };
  }

  static toUser(user: User): UserReferenceDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName ?? '',
      email: user.email,
    };
  }

  static toDepartments(departments: Department[]): DepartmentReferenceDto[] {
    return departments.map((department) =>
      ReferenceMapper.toDepartment(department),
    );
  }

  static toSpecialties(specialties: Specialty[]): SpecialtyReferenceDto[] {
    return specialties.map((specialty) =>
      ReferenceMapper.toSpecialty(specialty),
    );
  }

  static toQualifications(
    qualifications: Qualification[],
  ): QualificationReferenceDto[] {
    return qualifications.map((qualification) =>
      ReferenceMapper.toQualification(qualification),
    );
  }

  static toLanguages(languages: Language[]): LanguageReferenceDto[] {
    return languages.map((language) => ReferenceMapper.toLanguage(language));
  }

  static toDoctors(doctors: Doctor[]): DoctorReferenceDto[] {
    return doctors.map((doctor) => ReferenceMapper.toDoctor(doctor));
  }

  static toPatients(patients: Patient[]): PatientReferenceDto[] {
    return patients.map((patient) => ReferenceMapper.toPatient(patient));
  }
}
