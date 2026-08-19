export interface SystemRoleSeed {
  code: string;
  name: string;
  description: string;
  displayOrder: number;
}

export const systemRoles: SystemRoleSeed[] = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Administrator',
    description: 'Full platform administrator',
    displayOrder: 1,
  },
  {
    code: 'CLINIC_ADMIN',
    name: 'Clinic Administrator',
    description: 'Clinic administrator',
    displayOrder: 2,
  },
  {
    code: 'DOCTOR',
    name: 'Doctor',
    description: 'Medical practitioner',
    displayOrder: 3,
  },
  {
    code: 'NURSE',
    name: 'Nurse',
    description: 'Clinic nurse',
    displayOrder: 4,
  },
  {
    code: 'RECEPTIONIST',
    name: 'Receptionist',
    description: 'Reception staff',
    displayOrder: 5,
  },
];
