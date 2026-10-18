import { PrismaClient } from '@prisma/client';
import { provisionClinicMasterData } from '../../src/clinics/clinic-master-data';
import { systemRoles } from '../data/roles';
import { assignDefaultRolePermissions } from '../../src/roles/default-role-permissions';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const clinics = await prisma.clinic.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Provisioning standard departments and specialties for ${clinics.length} clinics...`);

  for (const clinic of clinics) {
    await prisma.$transaction(async (tx) => {
      // Backfill missing system roles without deleting or replacing custom roles.
      for (const role of systemRoles) {
        await tx.role.upsert({
          where: { clinicId_code: { clinicId: clinic.id, code: role.code } },
          update: {},
          create: {
            clinicId: clinic.id,
            code: role.code,
            name: role.name,
            description: role.description,
            displayOrder: role.displayOrder,
            isSystem: true,
            isActive: true,
          },
        });
      }
      await assignDefaultRolePermissions(tx, clinic.id);
      await provisionClinicMasterData(tx, clinic.id);
    });
    console.log(`✓ ${clinic.name} (${clinic.code})`);
  }

  console.log('Clinic roles, role permissions, departments, and specialties backfill completed.');
}

main()
  .catch((error) => {
    console.error('Clinic master-data backfill failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
