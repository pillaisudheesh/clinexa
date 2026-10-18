import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { assignDefaultRolePermissions } from '../src/roles/default-role-permissions';
import { systemRoles } from '../src/roles/system-roles';

/**
 * Idempotently create/repair the standard system roles for every existing
 * clinic. Run once after deploying clinic role provisioning:
 *   npx tsx prisma/backfill-clinic-roles.ts
 */
const prisma = new PrismaClient();

async function main() {
  const clinics = await prisma.clinic.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { createdAt: 'asc' },
  });

  for (const clinic of clinics) {
    console.log(`Provisioning default roles for ${clinic.name} (${clinic.code})`);
    await prisma.$transaction(async (tx) => {
      // Seed missing roles, then apply any missing default permission mappings.
      for (const role of systemRoles) {
        await tx.role.upsert({
          where: { clinicId_code: { clinicId: clinic.id, code: role.code } },
          update: { name: role.name, description: role.description, displayOrder: role.displayOrder, isSystem: true, isActive: true },
          create: { clinicId: clinic.id, code: role.code, name: role.name, description: role.description, displayOrder: role.displayOrder, isSystem: true, isActive: true },
        });
      }
      await assignDefaultRolePermissions(tx, clinic.id);
    });
  }

  console.log(`Default roles verified for ${clinics.length} clinics.`);
}

main()
  .catch((error) => {
    console.error('Failed to backfill clinic roles:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
