import { PrismaClient } from '@prisma/client';

import { seedPatients } from './seeds/patient.seed';
import { seedDoctors } from './seeds/doctors.seed';
import { seedDoctorSchedules } from './seeds/doctor-schedules.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo data...');

  const clinic = await prisma.clinic.findFirst({
    where: {
      code: 'CLINIC001',
    },
  });

  if (!clinic) {
    throw new Error('System seed must be run first.');
  }

  await seedPatients(clinic.id);
  await seedDoctors(clinic.id);
  await seedDoctorSchedules(clinic.id);

  console.log('🎉 Demo data seeded.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
