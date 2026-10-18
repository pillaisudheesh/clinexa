import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    throw new Error(
      'Usage: npm run db:promote-platform-admin -- admin@example.com',
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, isPlatformAdmin: true, status: true },
  });

  if (!user) {
    throw new Error(`No user found for email: ${email}`);
  }

  if (user.status !== 'ACTIVE') {
    throw new Error('Only an active user can be promoted to Platform Administrator.');
  }

  if (user.isPlatformAdmin) {
    console.log(`${user.email} is already a Platform Administrator.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isPlatformAdmin: true },
  });

  console.log(`Promoted ${user.email} to Platform Administrator.`);
  console.log('The account must sign in again before using platform administration.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
