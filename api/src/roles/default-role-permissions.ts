import { Prisma } from '@prisma/client';

/**
 * Least-privilege defaults for clinic-scoped system roles.
 * Keep these codes in sync with prisma/data/permissions.ts.
 */
export const DEFAULT_ROLE_PERMISSION_CODES: Record<string, string[] | '*'> = {
  // Full access is scoped by the authorization layer to this clinic. A true
  // platform-wide administrator should be managed separately from clinic roles.
  SUPER_ADMIN: '*',

  CLINIC_ADMIN: [
    'USER_READ',
    'USER_CREATE',
    'USER_UPDATE',
    'ROLE_READ',
    'ROLE_CREATE',
    'ROLE_UPDATE',
    'PERMISSION_READ',
    'PATIENT_READ',
    'PATIENT_CREATE',
    'PATIENT_UPDATE',
    'DOCTOR_READ',
    'DOCTOR_CREATE',
    'DOCTOR_UPDATE',
    'APPOINTMENT_READ',
    'APPOINTMENT_CREATE',
    'APPOINTMENT_UPDATE',
    'APPOINTMENT_CANCEL',
    'MEDICAL_RECORD_READ',
    'DIAGNOSIS_READ',
    'PRESCRIPTION_READ',
    'LAB_READ',
    'PHARMACY_READ',
    'INVENTORY_READ',
    'BILLING_READ',
    'BILLING_CREATE',
    'BILLING_UPDATE',
    'REPORT_READ',
    'REPORT_EXPORT',
    'SETTINGS_READ',
    'SETTINGS_UPDATE',
    'DEPARTMENT_READ',
    'DEPARTMENT_CREATE',
    'DEPARTMENT_UPDATE',
    'DEPARTMENT_DELETE',
    'SPECIALTY_READ',
    'SPECIALTY_CREATE',
    'SPECIALTY_UPDATE',
    'SPECIALTY_DELETE',
    'QUALIFICATION_READ',
    'QUALIFICATION_CREATE',
    'QUALIFICATION_UPDATE',
    'QUALIFICATION_DELETE',
    'LANGUAGE_READ',
    'LANGUAGE_CREATE',
    'LANGUAGE_UPDATE',
    'LANGUAGE_DELETE',
    'REGISTRATION_COUNCIL_READ',
    'REGISTRATION_COUNCIL_CREATE',
    'REGISTRATION_COUNCIL_UPDATE',
    'REGISTRATION_COUNCIL_DELETE',
  ],

  DOCTOR: [
    'PATIENT_READ',
    'PATIENT_CREATE',
    'PATIENT_UPDATE',
    'DOCTOR_READ',
    'APPOINTMENT_READ',
    'APPOINTMENT_UPDATE',
    'MEDICAL_RECORD_READ',
    'MEDICAL_RECORD_CREATE',
    'MEDICAL_RECORD_UPDATE',
    'DIAGNOSIS_READ',
    'DIAGNOSIS_CREATE',
    'DIAGNOSIS_UPDATE',
    'PRESCRIPTION_READ',
    'PRESCRIPTION_CREATE',
    'PRESCRIPTION_UPDATE',
    'LAB_READ',
    'LAB_CREATE',
    'LAB_UPDATE',
    'DEPARTMENT_READ',
    'SPECIALTY_READ',
    'QUALIFICATION_READ',
    'LANGUAGE_READ',
    'REGISTRATION_COUNCIL_READ',
  ],

  NURSE: [
    'PATIENT_READ',
    'PATIENT_CREATE',
    'PATIENT_UPDATE',
    'DOCTOR_READ',
    'APPOINTMENT_READ',
    'APPOINTMENT_UPDATE',
    'MEDICAL_RECORD_READ',
    'MEDICAL_RECORD_CREATE',
    'MEDICAL_RECORD_UPDATE',
    'DIAGNOSIS_READ',
    'PRESCRIPTION_READ',
    'LAB_READ',
    'DEPARTMENT_READ',
  ],

  RECEPTIONIST: [
    'PATIENT_READ',
    'PATIENT_CREATE',
    'PATIENT_UPDATE',
    'DOCTOR_READ',
    'APPOINTMENT_READ',
    'APPOINTMENT_CREATE',
    'APPOINTMENT_UPDATE',
    'APPOINTMENT_CANCEL',
    'BILLING_READ',
    'BILLING_CREATE',
    'DEPARTMENT_READ',
  ],
};

/** Assigns missing default mappings without deleting any existing mappings. */
export async function assignDefaultRolePermissions(
  tx: Prisma.TransactionClient,
  clinicId: string,
): Promise<void> {
  const roles = await tx.role.findMany({
    where: {
      clinicId,
      code: { in: Object.keys(DEFAULT_ROLE_PERMISSION_CODES) },
    },
    select: { id: true, code: true },
  });
  const allPermissions = await tx.permission.findMany({
    select: { id: true, code: true },
  });
  const permissionIdByCode = new Map(
    allPermissions.map((permission) => [permission.code, permission.id]),
  );

  const missingCodes = new Set<string>();

  for (const configuredCodes of Object.values(DEFAULT_ROLE_PERMISSION_CODES)) {
    if (configuredCodes === '*') {
      continue;
    }

    for (const code of configuredCodes) {
      if (!permissionIdByCode.has(code)) {
        missingCodes.add(code);
      }
    }
  }

  if (missingCodes.size > 0) {
    throw new Error(
      `Cannot assign default clinic role permissions. Seed these permission codes first: ${[...missingCodes].sort().join(', ')}`,
    );
  }

  const allPermissionIds = allPermissions.map((permission) => permission.id);
  for (const role of roles) {
    const configuredCodes = DEFAULT_ROLE_PERMISSION_CODES[role.code];
    const permissionIds =
      configuredCodes === '*'
        ? allPermissionIds
        : configuredCodes
            .map((code) => permissionIdByCode.get(code)!)
            .filter(Boolean);

    if (permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }
  }
}
