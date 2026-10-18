import { Prisma } from '@prisma/client';

import { departments } from '../../prisma/data/master/departments';
import { specialties } from '../../prisma/data/master/specialties';

/**
 * Ensures a clinic has the standard department and specialty catalogue.
 * Safe to run repeatedly: records are upserted by their clinic-scoped keys.
 * Must be called within the transaction that creates or repairs the clinic.
 */
export async function provisionClinicMasterData(
  tx: Prisma.TransactionClient,
  clinicId: string,
): Promise<void> {
  const departmentIds = new Map<string, string>();

  for (const department of departments) {
    const existingByCode = await tx.department.findUnique({
      where: {
        clinicId_code: {
          clinicId,
          code: department.code,
        },
      },
    });

    const existingByName = await tx.department.findUnique({
      where: {
        clinicId_name: {
          clinicId,
          name: department.name,
        },
      },
    });

    // Prefer the code match, then reuse a matching name.
    const existing = existingByCode ?? existingByName;

    const record = existing
      ? await tx.department.update({
          where: { id: existing.id },
          data: {
            description: department.description,
            displayOrder: department.displayOrder,
          },
        })
      : await tx.department.create({
          data: {
            clinicId,
            code: department.code,
            name: department.name,
            description: department.description,
            displayOrder: department.displayOrder,
            isSystem: true,
            isActive: true,
          },
        });

    departmentIds.set(department.code, record.id);
  }

  for (const specialty of specialties) {
    const departmentId = departmentIds.get(specialty.departmentCode);

    if (!departmentId) {
      throw new Error(
        `Department '${specialty.departmentCode}' is missing from the master department catalogue.`,
      );
    }

    await tx.specialty.upsert({
      where: {
        departmentId_code: {
          departmentId,
          code: specialty.code,
        },
      },
      update: {
        name: specialty.name,
        description: specialty.description,
        displayOrder: specialty.displayOrder,
      },
      create: {
        departmentId,
        code: specialty.code,
        name: specialty.name,
        description: specialty.description,
        displayOrder: specialty.displayOrder,
        isSystem: true,
        isActive: true,
      },
    });
  }
}
