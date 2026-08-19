import { PrismaClient } from '@prisma/client';

import { systemRoles } from '../data/roles';

export async function seedRoles(
  prisma: PrismaClient,
  clinicId: string,
): Promise<Record<string, string>> {
  console.log('🌱 Seeding roles...');

  const roles: Record<string, string> = {};

  for (const role of systemRoles) {
    const createdRole = await prisma.role.upsert({
      where: {
        clinicId_code: {
          clinicId,
          code: role.code,
        },
      },

      update: {
        name: role.name,
        description: role.description,
        displayOrder: role.displayOrder,
        isSystem: true,
        isActive: true,
      },

      create: {
        clinicId,
        code: role.code,
        name: role.name,
        description: role.description,
        displayOrder: role.displayOrder,
        isSystem: true,
        isActive: true,
      },
    });

    roles[role.code] = createdRole.id;
  }

  console.log(`✅ Seeded ${Object.keys(roles).length} roles.`);

  return roles;
}
