import { PrismaClient, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(
  prisma: PrismaClient,
  clinicId: string,
  roles: Record<string, string>,
  platformAdminEmail: string,
  platformAdminPassword: string,
) {
  const passwordHash = await bcrypt.hash(platformAdminPassword, 12);

  console.log('🌱 Seeding users...');

  // Retire the legacy seeded account when a different administrator email is configured.
  // The old seed shipped with a publicly known password and must not remain usable.
  if (platformAdminEmail.toLowerCase() !== 'admin@samaroot.com') {
    await prisma.user.updateMany({
      where: { email: 'admin@samaroot.com' },
      data: {
        isPlatformAdmin: false,
        status: UserStatus.INACTIVE,
      },
    });
  }

  const admin = await prisma.user.upsert({
    where: {
      email: platformAdminEmail,
    },
    update: {
      passwordHash,
      isPlatformAdmin: true,
      status: UserStatus.ACTIVE,
    },
    create: {
      clinicId,
      firstName: 'System',
      lastName: 'Administrator',
      email: platformAdminEmail,
      passwordHash,
      status: UserStatus.ACTIVE,
      isPlatformAdmin: true,
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

  console.log('✅ Platform Super Administrator seeded.');
}
