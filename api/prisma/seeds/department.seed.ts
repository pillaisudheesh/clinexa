import { PrismaClient } from '@prisma/client';

import { departments } from '../data/master/departments';

const prisma = new PrismaClient();

export async function seedDepartments(
  clinicId: string,
): Promise<Record<string, string>> {
  console.log('🌱 Seeding departments...');

  const departmentIds: Record<string, string> = {};

  for (const department of departments) {
    const createdDepartment = await prisma.department.upsert({
      where: {
        clinicId_code: {
          clinicId,
          code: department.code,
        },
      },
      update: {
        name: department.name,
        description: department.description,
        displayOrder: department.displayOrder,
        isActive: true,
      },
      create: {
        clinicId,
        code: department.code,
        name: department.name,
        description: department.description,
        displayOrder: department.displayOrder,
        isSystem: true,
        isActive: true,
      },
    });

    departmentIds[department.code] = createdDepartment.id;
  }

  console.log('✅ Departments seeded.');

  return departmentIds;
}
