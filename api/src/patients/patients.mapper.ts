import { Clinic, Patient } from '@prisma/client';

import { PatientResponseDto } from './dto/patient-response.dto';

type PatientWithClinic = Patient & {
  clinic: Clinic;
};

export class PatientMapper {
  static calculateAge(dateOfBirth: Date): number {
    const today = new Date();

    let age = today.getFullYear() - dateOfBirth.getFullYear();

    const month = today.getMonth() - dateOfBirth.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }

    return age;
  }
  static toResponseDto(patient: PatientWithClinic): PatientResponseDto {
    const fullName = [patient.firstName, patient.middleName, patient.lastName]
      .filter(Boolean)
      .join(' ');
    return {
      id: patient.id,
      patientNumber: patient.patientNumber,

      firstName: patient.firstName,
      middleName: patient.middleName,
      lastName: patient.lastName,
      fullName: fullName,
      age: this.calculateAge(patient.dateOfBirth),

      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,

      phone: patient.phone,
      email: patient.email,

      bloodGroup: patient.bloodGroup,
      maritalStatus: patient.maritalStatus,

      isActive: patient.isActive,

      clinic: {
        id: patient.clinic.id,
        code: patient.clinic.code,
        name: patient.clinic.name,
      },

      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      addressLine1: patient.addressLine1,
      addressLine2: patient.addressLine2,
      city: patient.city,
      state: patient.state,
      country: patient.country,
      postalCode: patient.postalCode,

      emergencyContactName: patient.emergencyContactName,

      emergencyContactPhone: patient.emergencyContactPhone,

      emergencyContactRelation: patient.emergencyContactRelation,
    };
  }

  static toResponseDtos(patients: PatientWithClinic[]): PatientResponseDto[] {
    return patients.map((patient) => this.toResponseDto(patient));
  }
}
