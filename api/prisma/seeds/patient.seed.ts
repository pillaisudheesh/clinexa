import { PrismaClient } from '@prisma/client';

import { demoPatients } from '../data/demo/patients';

const prisma = new PrismaClient();

export async function seedPatients(clinicId: string) {
  console.log('🌱 Seeding patients...');

  const clinic = await prisma.clinic.findUnique({
    where: {
      id: clinicId,
    },
  });

  if (!clinic) {
    throw new Error('Clinic not found.');
  }

  let sequence = 1;

  for (const patient of demoPatients) {
    const exists = await prisma.patient.findFirst({
      where: {
        clinicId,
        email: patient.email,
      },
    });

    if (exists) {
      continue;
    }

    const patientNumber = `${clinic.code}-PAT-${String(sequence).padStart(6, '0')}`;

    await prisma.patient.create({
      data: {
        clinicId,

        patientNumber,

        firstName: patient.firstName,
        middleName: patient.middleName,
        lastName: patient.lastName,

        gender: patient.gender,

        dateOfBirth: new Date(patient.dateOfBirth),

        phone: patient.phone,
        email: patient.email.toLowerCase(),

        bloodGroup: patient.bloodGroup,
        maritalStatus: patient.maritalStatus,

        city: patient.city,
        state: patient.state,
        country: patient.country,

        isActive: true,
      },
    });

    sequence++;
  }

  console.log('✅ Patients seeded.');
}
