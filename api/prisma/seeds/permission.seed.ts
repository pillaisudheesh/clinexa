import { PrismaClient } from '@prisma/client';
import { permissions } from '../data/permissions';

export async function seedPermissions(prisma: PrismaClient) {
  console.log('🌱 Seeding permissions...');

  for (const [groupCode, permissionList] of Object.entries(permissions)) {
    const group = await prisma.permissionGroup.findUniqueOrThrow({
      where: {
        code: groupCode,
      },
    });

    for (const permission of permissionList) {
      await prisma.permission.upsert({
        where: {
          code: permission.code,
        },
        update: {
          name: permission.name,
          permissionGroupId: group.id,
        },
        create: {
          code: permission.code,
          name: permission.name,
          permissionGroupId: group.id,
        },
      });
    }
  }

  console.log('✅ Permissions seeded.');
}
