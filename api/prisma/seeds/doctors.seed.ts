import { PrismaClient } from '@prisma/client';
import { demoDoctors } from '../data/demo/demo-doctors';
const prisma = new PrismaClient();

export async function seedDoctors(clinicId: string) {
  console.log('Seeding demo doctors...');

  for (const doctorData of demoDoctors) {
    const department = await prisma.department.findFirst({
      where: {
        clinicId,
        code: doctorData.departmentCode,
        isActive: true,
      },
    });

    if (!department) {
      throw new Error(`Department not found: ${doctorData.departmentCode}`);
    }

    const primarySpecialty = await prisma.specialty.findFirst({
      where: {
        departmentId: department.id,
        code: doctorData.primarySpecialtyCode,
        isActive: true,
      },
    });

    if (!primarySpecialty) {
      throw new Error(
        `Specialty not found: ${doctorData.departmentCode}/${doctorData.primarySpecialtyCode}`,
      );
    }

    const specialties = await prisma.specialty.findMany({
      where: {
        departmentId: department.id,
        code: {
          in: doctorData.specialtyCodes,
        },
        isActive: true,
      },
    });

    if (specialties.length !== doctorData.specialtyCodes.length) {
      const found = new Set(specialties.map((s) => s.code));

      const missing = doctorData.specialtyCodes.filter(
        (code) => !found.has(code),
      );

      throw new Error(
        `Specialties not found for ${doctorData.doctorNumber}: ${missing.join(', ')}`,
      );
    }

    const qualifications = await prisma.qualification.findMany({
      where: {
        code: {
          in: doctorData.qualificationCodes,
        },
        isActive: true,
      },
    });

    if (qualifications.length !== doctorData.qualificationCodes.length) {
      const found = new Set(qualifications.map((q) => q.code));

      const missing = doctorData.qualificationCodes.filter(
        (code) => !found.has(code),
      );

      throw new Error(
        `Qualifications not found for ${doctorData.doctorNumber}: ${missing.join(', ')}`,
      );
    }

    const languages = await prisma.language.findMany({
      where: {
        code: {
          in: doctorData.languageCodes,
        },
        isActive: true,
      },
    });

    if (languages.length !== doctorData.languageCodes.length) {
      const found = new Set(languages.map((language) => language.code));

      const missing = doctorData.languageCodes.filter(
        (code) => !found.has(code),
      );

      throw new Error(
        `Languages not found for ${doctorData.doctorNumber}: ${missing.join(', ')}`,
      );
    }

    let registrationCouncilId: string | undefined;

    if (doctorData.registrationCouncilCode) {
      const council = await prisma.registrationCouncil.findUnique({
        where: {
          code: doctorData.registrationCouncilCode,
        },
      });

      if (!council) {
        throw new Error(
          `Registration council not found: ${doctorData.registrationCouncilCode}`,
        );
      }

      registrationCouncilId = council.id;
    }

    const doctor = await prisma.doctor.upsert({
      where: {
        clinicId_doctorNumber: {
          clinicId,
          doctorNumber: doctorData.doctorNumber,
        },
      },

      update: {
        title: doctorData.title,
        firstName: doctorData.firstName,
        middleName: doctorData.middleName ?? null,
        lastName: doctorData.lastName,
        gender: doctorData.gender,
        dateOfBirth: doctorData.dateOfBirth
          ? new Date(doctorData.dateOfBirth)
          : null,
        email: doctorData.email,
        phone: doctorData.phone,
        registrationNumber: doctorData.registrationNumber,
        registrationCouncilId,
        biography: doctorData.biography,
        yearsOfExperience: doctorData.yearsOfExperience,
        employmentType: doctorData.employmentType,
        departmentId: department.id,
        primarySpecialtyId: primarySpecialty.id,
        isActive: true,
      },

      create: {
        clinicId,
        doctorNumber: doctorData.doctorNumber,
        title: doctorData.title,
        firstName: doctorData.firstName,
        middleName: doctorData.middleName,
        lastName: doctorData.lastName,
        gender: doctorData.gender,
        dateOfBirth: doctorData.dateOfBirth
          ? new Date(doctorData.dateOfBirth)
          : null,
        email: doctorData.email,
        phone: doctorData.phone,
        registrationNumber: doctorData.registrationNumber,
        registrationCouncilId,
        biography: doctorData.biography,
        yearsOfExperience: doctorData.yearsOfExperience,
        employmentType: doctorData.employmentType,
        departmentId: department.id,
        primarySpecialtyId: primarySpecialty.id,
        isSystem: false,
        isActive: true,
      },
    });

    // Remove existing relationships so the seed is idempotent.
    await prisma.doctorSpecialty.deleteMany({
      where: {
        doctorId: doctor.id,
      },
    });

    await prisma.doctorQualification.deleteMany({
      where: {
        doctorId: doctor.id,
      },
    });

    await prisma.doctorLanguage.deleteMany({
      where: {
        doctorId: doctor.id,
      },
    });

    // Doctor specialties
    await prisma.doctorSpecialty.createMany({
      data: specialties.map((specialty) => ({
        doctorId: doctor.id,
        specialtyId: specialty.id,
      })),
      skipDuplicates: true,
    });

    // Doctor qualifications
    await prisma.doctorQualification.createMany({
      data: qualifications.map((qualification) => ({
        doctorId: doctor.id,
        qualificationId: qualification.id,
      })),
      skipDuplicates: true,
    });

    // Doctor languages
    await prisma.doctorLanguage.createMany({
      data: languages.map((language) => ({
        doctorId: doctor.id,
        languageId: language.id,
      })),
      skipDuplicates: true,
    });

    // Consultation fee
    await prisma.doctorConsultationFee.upsert({
      where: {
        doctorId: doctor.id,
      },

      update: {
        consultationFee: doctorData.consultationFee,
        followUpFee: doctorData.followUpFee,
        emergencyFee: doctorData.emergencyFee,
        teleConsultationFee: doctorData.teleConsultationFee,
      },

      create: {
        doctorId: doctor.id,
        consultationFee: doctorData.consultationFee,
        followUpFee: doctorData.followUpFee,
        emergencyFee: doctorData.emergencyFee,
        teleConsultationFee: doctorData.teleConsultationFee,
      },
    });

    console.log(
      `✓ ${doctorData.doctorNumber} - ${doctorData.firstName} ${doctorData.lastName}`,
    );
  }

  console.log(`✓ ${demoDoctors.length} doctors seeded`);
}
