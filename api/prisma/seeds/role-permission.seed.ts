import { PrismaClient } from '@prisma/client';

export async function seedRolePermissions(
  prisma: PrismaClient,
  roles: Record<string, string>,
) {
  console.log('🌱 Assigning permissions to roles...');

  const superAdminRoleId = roles.SUPER_ADMIN;

  const permissions = await prisma.permission.findMany({
    select: {
      id: true,
    },
  });

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRoleId,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRoleId,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Role permissions seeded.');
}
