export interface QualificationSeed {
  code: string;
  name: string;
  displayOrder: number;
}

export const qualifications: QualificationSeed[] = [
  // Medical
  {
    code: 'MBBS',
    name: 'Bachelor of Medicine and Bachelor of Surgery',
    displayOrder: 1,
  },
  {
    code: 'MD_MEDICINE',
    name: 'Doctor of Medicine - Internal Medicine',
    displayOrder: 2,
  },
  {
    code: 'MD_PEDIATRICS',
    name: 'Doctor of Medicine - Pediatrics',
    displayOrder: 3,
  },
  {
    code: 'MD_DERMATOLOGY',
    name: 'Doctor of Medicine - Dermatology',
    displayOrder: 4,
  },
  {
    code: 'MD_PSYCHIATRY',
    name: 'Doctor of Medicine - Psychiatry',
    displayOrder: 5,
  },
  {
    code: 'MD_RADIOLOGY',
    name: 'Doctor of Medicine - Radiology',
    displayOrder: 6,
  },
  {
    code: 'MD_PATHOLOGY',
    name: 'Doctor of Medicine - Pathology',
    displayOrder: 7,
  },
  {
    code: 'MD_ANAESTHESIOLOGY',
    name: 'Doctor of Medicine - Anaesthesiology',
    displayOrder: 8,
  },
  {
    code: 'MD_EMERGENCY_MEDICINE',
    name: 'Doctor of Medicine - Emergency Medicine',
    displayOrder: 9,
  },
  {
    code: 'MD_FAMILY_MEDICINE',
    name: 'Doctor of Medicine - Family Medicine',
    displayOrder: 10,
  },

  // Surgery
  {
    code: 'MS_GENERAL_SURGERY',
    name: 'Master of Surgery - General Surgery',
    displayOrder: 20,
  },
  {
    code: 'MS_ORTHOPAEDICS',
    name: 'Master of Surgery - Orthopaedics',
    displayOrder: 21,
  },
  {
    code: 'MS_ENT',
    name: 'Master of Surgery - ENT',
    displayOrder: 22,
  },
  {
    code: 'MS_OPHTHALMOLOGY',
    name: 'Master of Surgery - Ophthalmology',
    displayOrder: 23,
  },
  {
    code: 'MS_OBSTETRICS_GYNECOLOGY',
    name: 'Master of Surgery - Obstetrics and Gynecology',
    displayOrder: 24,
  },

  // Super Specialties
  {
    code: 'DM_CARDIOLOGY',
    name: 'Doctorate of Medicine - Cardiology',
    displayOrder: 30,
  },
  {
    code: 'DM_NEUROLOGY',
    name: 'Doctorate of Medicine - Neurology',
    displayOrder: 31,
  },
  {
    code: 'DM_NEONATOLOGY',
    name: 'Doctorate of Medicine - Neonatology',
    displayOrder: 32,
  },
  {
    code: 'DM_GASTROENTEROLOGY',
    name: 'Doctorate of Medicine - Gastroenterology',
    displayOrder: 33,
  },
  {
    code: 'DM_NEPHROLOGY',
    name: 'Doctorate of Medicine - Nephrology',
    displayOrder: 34,
  },
  {
    code: 'DM_ENDOCRINOLOGY',
    name: 'Doctorate of Medicine - Endocrinology',
    displayOrder: 35,
  },
  {
    code: 'DM_ONCOLOGY',
    name: 'Doctorate of Medicine - Medical Oncology',
    displayOrder: 36,
  },
  {
    code: 'DM_RHEUMATOLOGY',
    name: 'Doctorate of Medicine - Rheumatology',
    displayOrder: 37,
  },
  {
    code: 'MCH_UROLOGY',
    name: 'Master of Chirurgiae - Urology',
    displayOrder: 38,
  },

  // Dentistry
  {
    code: 'BDS',
    name: 'Bachelor of Dental Surgery',
    displayOrder: 50,
  },
  {
    code: 'MDS',
    name: 'Master of Dental Surgery',
    displayOrder: 51,
  },

  // Ayurveda
  {
    code: 'BAMS',
    name: 'Bachelor of Ayurvedic Medicine and Surgery',
    displayOrder: 60,
  },
  {
    code: 'MD_AYURVEDA',
    name: 'Doctor of Medicine - Ayurveda',
    displayOrder: 61,
  },

  // Homeopathy
  {
    code: 'BHMS',
    name: 'Bachelor of Homeopathic Medicine and Surgery',
    displayOrder: 70,
  },
  {
    code: 'MD_HOMEOPATHY',
    name: 'Doctor of Medicine - Homeopathy',
    displayOrder: 71,
  },

  // Siddha
  {
    code: 'BSMS',
    name: 'Bachelor of Siddha Medicine and Surgery',
    displayOrder: 80,
  },
  {
    code: 'MD_SIDDHA',
    name: 'Doctor of Medicine - Siddha',
    displayOrder: 81,
  },

  // Unani
  {
    code: 'BUMS',
    name: 'Bachelor of Unani Medicine and Surgery',
    displayOrder: 90,
  },
  {
    code: 'MD_UNANI',
    name: 'Doctor of Medicine - Unani',
    displayOrder: 91,
  },

  // Yoga / Naturopathy
  {
    code: 'BNYS',
    name: 'Bachelor of Naturopathy and Yogic Sciences',
    displayOrder: 100,
  },

  // Physiotherapy
  {
    code: 'BPT',
    name: 'Bachelor of Physiotherapy',
    displayOrder: 110,
  },
  {
    code: 'MPT',
    name: 'Master of Physiotherapy',
    displayOrder: 111,
  },

  // Veterinary
  {
    code: 'BVSC',
    name: 'Bachelor of Veterinary Science',
    displayOrder: 120,
  },
  {
    code: 'MVSC',
    name: 'Master of Veterinary Science',
    displayOrder: 121,
  },

  // Pain Medicine
  {
    code: 'FIPM',
    name: 'Fellowship in Pain Medicine',
    displayOrder: 130,
  },
];
