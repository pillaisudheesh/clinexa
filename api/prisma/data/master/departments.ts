export interface DepartmentSeed {
  code: string;
  name: string;
  description?: string;
  displayOrder: number;
}

export const departments: DepartmentSeed[] = [
  {
    code: 'GENERAL_MEDICINE',
    name: 'General Medicine',
    displayOrder: 1,
  },
  {
    code: 'CARDIOLOGY',
    name: 'Cardiology',
    displayOrder: 2,
  },
  {
    code: 'NEUROLOGY',
    name: 'Neurology',
    displayOrder: 3,
  },
  {
    code: 'ORTHOPEDICS',
    name: 'Orthopedics',
    displayOrder: 4,
  },
  {
    code: 'PEDIATRICS',
    name: 'Pediatrics',
    displayOrder: 5,
  },
  {
    code: 'OBSTETRICS_GYNECOLOGY',
    name: 'Obstetrics & Gynecology',
    displayOrder: 6,
  },
  {
    code: 'DERMATOLOGY',
    name: 'Dermatology',
    displayOrder: 7,
  },
  {
    code: 'OPHTHALMOLOGY',
    name: 'Ophthalmology',
    displayOrder: 8,
  },
  {
    code: 'ENT',
    name: 'ENT',
    displayOrder: 9,
  },
  {
    code: 'PSYCHIATRY',
    name: 'Psychiatry',
    displayOrder: 10,
  },
  {
    code: 'PULMONOLOGY',
    name: 'Pulmonology',
    displayOrder: 11,
  },
  {
    code: 'GASTROENTEROLOGY',
    name: 'Gastroenterology',
    displayOrder: 12,
  },
  {
    code: 'NEPHROLOGY',
    name: 'Nephrology',
    displayOrder: 13,
  },
  {
    code: 'UROLOGY',
    name: 'Urology',
    displayOrder: 14,
  },
  {
    code: 'ONCOLOGY',
    name: 'Oncology',
    displayOrder: 15,
  },
  {
    code: 'ENDOCRINOLOGY',
    name: 'Endocrinology',
    displayOrder: 16,
  },
  {
    code: 'EMERGENCY_MEDICINE',
    name: 'Emergency Medicine',
    displayOrder: 17,
  },
  {
    code: 'ICU',
    name: 'Intensive Care Unit',
    displayOrder: 18,
  },
  {
    code: 'RADIOLOGY',
    name: 'Radiology',
    displayOrder: 19,
  },
  {
    code: 'LABORATORY_MEDICINE',
    name: 'Laboratory Medicine',
    displayOrder: 20,
  },
  {
    code: 'ANESTHESIOLOGY',
    name: 'Anesthesiology',
    displayOrder: 21,
  },
  {
    code: 'DENTISTRY',
    name: 'Dentistry',
    displayOrder: 22,
  },
  {
    code: 'PHYSIOTHERAPY',
    name: 'Physiotherapy & Rehabilitation',
    displayOrder: 23,
  },
  {
    code: 'TRADITIONAL_MEDICINE',
    name: 'Traditional Medicine',
    displayOrder: 24,
  },
  {
    code: 'INTEGRATIVE_MEDICINE',
    name: 'Integrative Medicine',
    displayOrder: 25,
  },
  {
    code: 'VETERINARY_MEDICINE',
    name: 'Veterinary Medicine',
    displayOrder: 26,
  },
];
