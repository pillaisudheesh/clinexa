import { PrismaClient } from '@prisma/client';

import { specialties } from '../data/master/specialties';

const prisma = new PrismaClient();

export async function seedSpecialties(
  clinicId: string,
): Promise<Record<string, string>> {
  console.log('🌱 Seeding specialties...');

  const specialtyIds: Record<string, string> = {};

  // Load all departments for the clinic
  const departments = await prisma.department.findMany({
    where: {
      clinicId,
    },
  });

  // Create a lookup map: Department Code -> Department
  const departmentMap = new Map(
    departments.map((department) => [department.code, department]),
  );

  for (const specialty of specialties) {
    const department = departmentMap.get(specialty.departmentCode);

    if (!department) {
      throw new Error(
        `Department '${specialty.departmentCode}' not found while seeding specialties.`,
      );
    }

    const createdSpecialty = await prisma.specialty.upsert({
      where: {
        departmentId_code: {
          departmentId: department.id,
          code: specialty.code,
        },
      },

      update: {
        name: specialty.name,
        description: specialty.description,
        displayOrder: specialty.displayOrder,
        isActive: true,
      },

      create: {
        departmentId: department.id,

        code: specialty.code,

        name: specialty.name,

        description: specialty.description,

        displayOrder: specialty.displayOrder,

        isSystem: true,

        isActive: true,
      },
    });

    specialtyIds[specialty.code] = createdSpecialty.id;
  }

  console.log('✅ Specialties seeded.');

  return specialtyIds;
}
