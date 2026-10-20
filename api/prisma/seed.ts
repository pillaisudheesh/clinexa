import { PrismaClient } from '@prisma/client';

import { seedClinic } from './seeds/clinic.seed';
import { seedPermissionGroups } from './seeds/permission-group.seed';
import { seedPermissions } from './seeds/permission.seed';
import { seedRoles } from './seeds/role.seed';
import { seedUsers } from './seeds/user.seed';
import { seedRolePermissions } from './seeds/role-permission.seed';
import { assignDefaultRolePermissions } from '../src/roles/default-role-permissions';
import { seedDepartments } from './seeds/department.seed';
import { seedSpecialties } from './seeds/specialty.seed';
import { qualifications } from './data/master/qualifications';
import { languages } from './data/master/languages';
import { registrationCouncils } from './data/master/registration-councils';
import { seedLabTests } from './seeds/lab-test.seed';

const prisma = new PrismaClient();

async function main() {
  const platformAdminEmail = process.env.PLATFORM_ADMIN_EMAIL?.trim();
  const platformAdminPassword = process.env.PLATFORM_ADMIN_PASSWORD;

  if (
    !platformAdminEmail ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(platformAdminEmail)
  ) {
    throw new Error(
      'Set PLATFORM_ADMIN_EMAIL to the email address for the initial platform administrator before seeding.',
    );
  }

  if (!platformAdminPassword || platformAdminPassword.length < 16) {
    throw new Error(
      'Set PLATFORM_ADMIN_PASSWORD to a unique password of at least 16 characters before seeding.',
    );
  }

  console.log('🌱 Seeding database...\n');

  const clinic = await seedClinic(prisma, platformAdminEmail);

  await seedPermissionGroups(prisma);

  await seedPermissions(prisma);

  const roles = await seedRoles(prisma, clinic.id);

  await seedRolePermissions(prisma, roles);
  await prisma.$transaction((tx) =>
    assignDefaultRolePermissions(tx, clinic.id),
  );

  await seedUsers(
    prisma,
    clinic.id,
    roles,
    platformAdminEmail,
    platformAdminPassword,
  );

  await seedDepartments(clinic.id);
  await seedSpecialties(clinic.id);
  await seedLabTests(prisma, clinic.id);

  // ============================================================
  // Qualifications
  // ============================================================

  console.log('Seeding qualifications...');

  for (const qualification of qualifications) {
    await prisma.qualification.upsert({
      where: {
        code: qualification.code,
      },
      update: {
        name: qualification.name,
        displayOrder: qualification.displayOrder,
        isActive: true,
      },
      create: {
        code: qualification.code,
        name: qualification.name,
        displayOrder: qualification.displayOrder,
        isSystem: true,
        isActive: true,
      },
    });
  }

  console.log(`✓ ${qualifications.length} qualifications seeded`);

  // ============================================================
  // Languages
  // ============================================================

  console.log('Seeding languages...');

  for (const language of languages) {
    await prisma.language.upsert({
      where: {
        code: language.code,
      },
      update: {
        name: language.name,
        displayOrder: language.displayOrder,
        isActive: true,
      },
      create: {
        code: language.code,
        name: language.name,
        displayOrder: language.displayOrder,
        isSystem: true,
        isActive: true,
      },
    });
  }

  console.log(`✓ ${languages.length} languages seeded`);

  // ============================================================
  // Registration Councils
  // ============================================================

  console.log('Seeding registration councils...');

  for (const council of registrationCouncils) {
    await prisma.registrationCouncil.upsert({
      where: {
        code: council.code,
      },

      update: {
        name: council.name,
        country: council.country,
        isActive: true,
      },

      create: {
        code: council.code,
        name: council.name,
        country: council.country,
        isSystem: true,
        isActive: true,
      },
    });
  }

  console.log(`✓ ${registrationCouncils.length} registration councils seeded`);

  console.log('\n🎉 Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
