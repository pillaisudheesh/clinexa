import { PrismaClient } from '@prisma/client';

export async function seedClinic(
  prisma: PrismaClient,
  platformAdminEmail: string,
) {
  console.log('🌱 Seeding clinic...');
  return prisma.clinic.upsert({
    where: {
      code: 'CLINIC001',
    },
    update: {},
    create: {
      code: 'CLINIC001',
      name: 'SamaRoot Demo Clinic',

      email: platformAdminEmail,
      phone: '+1-555-123-4567',

      website: 'https://samaroot.demo',

      addressLine1: '123 Main Street',

      city: 'New York',
      state: 'New York',
      country: 'USA',
      postalCode: '10001',

      timezone: 'America/New_York',
    },
  });
}
