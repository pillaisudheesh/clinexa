import { PrismaClient, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(
  prisma: PrismaClient,
  clinicId: string,
  roles: Record<string, string>,
) {
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  console.log('🌱 Seeding users...');

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@clinexa.com',
    },
    update: {},
    create: {
      clinicId,

      firstName: 'System',
      lastName: 'Administrator',

      email: 'admin@clinexa.com',

      passwordHash,

      status: UserStatus.ACTIVE,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: roles.SUPER_ADMIN,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: roles.SUPER_ADMIN,
    },
  });

  console.log('✅ Users seeded.');
}
