import { PrismaClient } from '@prisma/client';
import { labTests } from '../data/master/lab-tests';

type LabTestSeedClient = Pick<PrismaClient, 'labTest'>;

export async function seedLabTests(
  prisma: LabTestSeedClient,
  clinicId: string,
) {
  console.log('Seeding laboratory tests...');

  for (const test of labTests) {
    await prisma.labTest.upsert({
      where: {
        clinicId_code: {
          clinicId,
          code: test.code,
        },
      },
      update: {
        name: test.name,
        description: test.description,
        category: test.category,
        unit: test.unit,
        normalRange: test.normalRange,
        // Do not overwrite clinic-maintained price/isActive.
      },
      create: {
        clinicId,
        code: test.code,
        name: test.name,
        description: test.description,
        category: test.category,
        price: test.price,
        unit: test.unit,
        normalRange: test.normalRange,
        isActive: true,
      },
    });
  }

  console.log(`✓ ${labTests.length} laboratory tests seeded`);
}
