import { PrismaClient } from '@prisma/client';

export async function seedClinic(prisma: PrismaClient) {
  console.log('🌱 Seeding clinic...');
  return prisma.clinic.upsert({
    where: {
      code: 'CLINIC001',
    },
    update: {},
    create: {
      code: 'CLINIC001',
      name: 'Clinexa Demo Clinic',

      email: 'admin@clinexa.com',
      phone: '+1-555-123-4567',

      website: 'https://clinexa.demo',

      addressLine1: '123 Main Street',

      city: 'New York',
      state: 'New York',
      country: 'USA',
      postalCode: '10001',

      timezone: 'America/New_York',
    },
  });
}
