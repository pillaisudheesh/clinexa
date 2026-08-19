import { PrismaClient } from '@prisma/client';
import { permissionGroups } from '../data/permission-groups';

export async function seedPermissionGroups(prisma: PrismaClient) {
  console.log('🌱 Seeding permission groups...');

  for (const group of permissionGroups) {
    await prisma.permissionGroup.upsert({
      where: {
        code: group.code,
      },
      update: {
        name: group.name,
        displayOrder: group.displayOrder,
      },
      create: group,
    });
  }

  console.log('✅ Permission groups seeded.');
}
