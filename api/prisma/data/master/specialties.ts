export interface SpecialtySeed {
  departmentCode: string;
  code: string;
  name: string;
  description?: string;
  displayOrder: number;
}

export const specialties: SpecialtySeed[] = [
  // GENERAL_MEDICINE
  {
    departmentCode: 'GENERAL_MEDICINE',
    code: 'INTERNAL_MEDICINE',
    name: 'Internal Medicine',
    displayOrder: 1,
  },
  {
    departmentCode: 'GENERAL_MEDICINE',
    code: 'FAMILY_MEDICINE',
    name: 'Family Medicine',
    displayOrder: 2,
  },
  {
    departmentCode: 'GENERAL_MEDICINE',
    code: 'GERIATRIC_MEDICINE',
    name: 'Geriatric Medicine',
    displayOrder: 3,
  },
  {
    departmentCode: 'GENERAL_MEDICINE',
    code: 'PREVENTIVE_MEDICINE',
    name: 'Preventive Medicine',
    displayOrder: 4,
  },

  // CARDIOLOGY
  {
    departmentCode: 'CARDIOLOGY',
    code: 'INTERVENTIONAL_CARDIOLOGY',
    name: 'Interventional Cardiology',
    displayOrder: 1,
  },
  {
    departmentCode: 'CARDIOLOGY',
    code: 'NON_INVASIVE_CARDIOLOGY',
    name: 'Non-invasive Cardiology',
    displayOrder: 2,
  },
  {
    departmentCode: 'CARDIOLOGY',
    code: 'ELECTROPHYSIOLOGY',
    name: 'Electrophysiology',
    displayOrder: 3,
  },
  {
    departmentCode: 'CARDIOLOGY',
    code: 'CARDIAC_IMAGING',
    name: 'Cardiac Imaging',
    displayOrder: 4,
  },
  {
    departmentCode: 'CARDIOLOGY',
    code: 'HEART_FAILURE',
    name: 'Heart Failure',
    displayOrder: 5,
  },

  // NEUROLOGY
  {
    departmentCode: 'NEUROLOGY',
    code: 'CLINICAL_NEUROLOGY',
    name: 'Clinical Neurology',
    displayOrder: 1,
  },
  {
    departmentCode: 'NEUROLOGY',
    code: 'STROKE_MEDICINE',
    name: 'Stroke Medicine',
    displayOrder: 2,
  },
  {
    departmentCode: 'NEUROLOGY',
    code: 'EPILEPSY',
    name: 'Epilepsy',
    displayOrder: 3,
  },
  {
    departmentCode: 'NEUROLOGY',
    code: 'NEUROMUSCULAR_MEDICINE',
    name: 'Neuromuscular Medicine',
    displayOrder: 4,
  },
  {
    departmentCode: 'NEUROLOGY',
    code: 'MOVEMENT_DISORDERS',
    name: 'Movement Disorders',
    displayOrder: 5,
  },

  // ORTHOPEDICS
  {
    departmentCode: 'ORTHOPEDICS',
    code: 'JOINT_REPLACEMENT',
    name: 'Joint Replacement',
    displayOrder: 1,
  },
  {
    departmentCode: 'ORTHOPEDICS',
    code: 'SPINE_SURGERY',
    name: 'Spine Surgery',
    displayOrder: 2,
  },
  {
    departmentCode: 'ORTHOPEDICS',
    code: 'SPORTS_MEDICINE',
    name: 'Sports Medicine',
    displayOrder: 3,
  },
  {
    departmentCode: 'ORTHOPEDICS',
    code: 'TRAUMA_SURGERY',
    name: 'Trauma Surgery',
    displayOrder: 4,
  },
  {
    departmentCode: 'ORTHOPEDICS',
    code: 'PEDIATRIC_ORTHOPEDICS',
    name: 'Pediatric Orthopedics',
    displayOrder: 5,
  },
  {
    departmentCode: 'ORTHOPEDICS',
    code: 'HAND_SURGERY',
    name: 'Hand Surgery',
    displayOrder: 6,
  },
  {
    departmentCode: 'ORTHOPEDICS',
    code: 'FOOT_AND_ANKLE_SURGERY',
    name: 'Foot & Ankle Surgery',
    displayOrder: 7,
  },
  {
    departmentCode: 'ORTHOPEDICS',
    code: 'ORTHOPEDIC_ONCOLOGY',
    name: 'Orthopedic Oncology',
    displayOrder: 8,
  },

  // PEDIATRICS
  {
    departmentCode: 'PEDIATRICS',
    code: 'GENERAL_PEDIATRICS',
    name: 'General Pediatrics',
    displayOrder: 1,
  },
  {
    departmentCode: 'PEDIATRICS',
    code: 'NEONATOLOGY',
    name: 'Neonatology',
    displayOrder: 2,
  },
  {
    departmentCode: 'PEDIATRICS',
    code: 'PEDIATRIC_CARDIOLOGY',
    name: 'Pediatric Cardiology',
    displayOrder: 3,
  },
  {
    departmentCode: 'PEDIATRICS',
    code: 'PEDIATRIC_NEUROLOGY',
    name: 'Pediatric Neurology',
    displayOrder: 4,
  },
  {
    departmentCode: 'PEDIATRICS',
    code: 'PEDIATRIC_ENDOCRINOLOGY',
    name: 'Pediatric Endocrinology',
    displayOrder: 5,
  },
  {
    departmentCode: 'PEDIATRICS',
    code: 'PEDIATRIC_GASTROENTEROLOGY',
    name: 'Pediatric Gastroenterology',
    displayOrder: 6,
  },
  {
    departmentCode: 'PEDIATRICS',
    code: 'PEDIATRIC_PULMONOLOGY',
    name: 'Pediatric Pulmonology',
    displayOrder: 7,
  },
  {
    departmentCode: 'PEDIATRICS',
    code: 'PEDIATRIC_INTENSIVE_CARE',
    name: 'Pediatric Intensive Care',
    displayOrder: 8,
  },

  // OBSTETRICS_GYNECOLOGY
  {
    departmentCode: 'OBSTETRICS_GYNECOLOGY',
    code: 'OBSTETRICS',
    name: 'Obstetrics',
    displayOrder: 1,
  },
  {
    departmentCode: 'OBSTETRICS_GYNECOLOGY',
    code: 'GYNECOLOGY',
    name: 'Gynecology',
    displayOrder: 2,
  },
  {
    departmentCode: 'OBSTETRICS_GYNECOLOGY',
    code: 'MATERNAL_AND_FETAL_MEDICINE',
    name: 'Maternal & Fetal Medicine',
    displayOrder: 3,
  },
  {
    departmentCode: 'OBSTETRICS_GYNECOLOGY',
    code: 'REPRODUCTIVE_MEDICINE',
    name: 'Reproductive Medicine',
    displayOrder: 4,
  },
  {
    departmentCode: 'OBSTETRICS_GYNECOLOGY',
    code: 'GYNECOLOGIC_ONCOLOGY',
    name: 'Gynecologic Oncology',
    displayOrder: 5,
  },
  {
    departmentCode: 'OBSTETRICS_GYNECOLOGY',
    code: 'UROGYNECOLOGY',
    name: 'Urogynecology',
    displayOrder: 6,
  },
  {
    departmentCode: 'OBSTETRICS_GYNECOLOGY',
    code: 'INFERTILITY',
    name: 'Infertility',
    displayOrder: 7,
  },
  {
    departmentCode: 'OBSTETRICS_GYNECOLOGY',
    code: 'HIGH_RISK_PREGNANCY',
    name: 'High-risk Pregnancy',
    displayOrder: 8,
  },

  // DERMATOLOGY
  {
    departmentCode: 'DERMATOLOGY',
    code: 'CLINICAL_DERMATOLOGY',
    name: 'Clinical Dermatology',
    displayOrder: 1,
  },
  {
    departmentCode: 'DERMATOLOGY',
    code: 'COSMETIC_DERMATOLOGY',
    name: 'Cosmetic Dermatology',
    displayOrder: 2,
  },
  {
    departmentCode: 'DERMATOLOGY',
    code: 'DERMATOSURGERY',
    name: 'Dermatosurgery',
    displayOrder: 3,
  },
  {
    departmentCode: 'DERMATOLOGY',
    code: 'PEDIATRIC_DERMATOLOGY',
    name: 'Pediatric Dermatology',
    displayOrder: 4,
  },
  {
    departmentCode: 'DERMATOLOGY',
    code: 'TRICHOLOGY',
    name: 'Trichology',
    displayOrder: 5,
  },

  // OPHTHALMOLOGY
  {
    departmentCode: 'OPHTHALMOLOGY',
    code: 'CATARACT_SURGERY',
    name: 'Cataract Surgery',
    displayOrder: 1,
  },
  {
    departmentCode: 'OPHTHALMOLOGY',
    code: 'RETINA',
    name: 'Retina',
    displayOrder: 2,
  },
  {
    departmentCode: 'OPHTHALMOLOGY',
    code: 'CORNEA',
    name: 'Cornea',
    displayOrder: 3,
  },
  {
    departmentCode: 'OPHTHALMOLOGY',
    code: 'GLAUCOMA',
    name: 'Glaucoma',
    displayOrder: 4,
  },
  {
    departmentCode: 'OPHTHALMOLOGY',
    code: 'PEDIATRIC_OPHTHALMOLOGY',
    name: 'Pediatric Ophthalmology',
    displayOrder: 5,
  },
  {
    departmentCode: 'OPHTHALMOLOGY',
    code: 'OCULOPLASTY',
    name: 'Oculoplasty',
    displayOrder: 6,
  },

  // ENT
  { departmentCode: 'ENT', code: 'OTOLOGY', name: 'Otology', displayOrder: 1 },
  {
    departmentCode: 'ENT',
    code: 'RHINOLOGY',
    name: 'Rhinology',
    displayOrder: 2,
  },
  {
    departmentCode: 'ENT',
    code: 'LARYNGOLOGY',
    name: 'Laryngology',
    displayOrder: 3,
  },
  {
    departmentCode: 'ENT',
    code: 'HEAD_AND_NECK_SURGERY',
    name: 'Head & Neck Surgery',
    displayOrder: 4,
  },
  {
    departmentCode: 'ENT',
    code: 'AUDIOLOGY',
    name: 'Audiology',
    displayOrder: 5,
  },

  // PSYCHIATRY
  {
    departmentCode: 'PSYCHIATRY',
    code: 'ADULT_PSYCHIATRY',
    name: 'Adult Psychiatry',
    displayOrder: 1,
  },
  {
    departmentCode: 'PSYCHIATRY',
    code: 'CHILD_PSYCHIATRY',
    name: 'Child Psychiatry',
    displayOrder: 2,
  },
  {
    departmentCode: 'PSYCHIATRY',
    code: 'ADDICTION_MEDICINE',
    name: 'Addiction Medicine',
    displayOrder: 3,
  },
  {
    departmentCode: 'PSYCHIATRY',
    code: 'GERIATRIC_PSYCHIATRY',
    name: 'Geriatric Psychiatry',
    displayOrder: 4,
  },
  {
    departmentCode: 'PSYCHIATRY',
    code: 'CONSULTATION_LIAISON_PSYCHIATRY',
    name: 'Consultation Liaison Psychiatry',
    displayOrder: 5,
  },

  // PULMONOLOGY
  {
    departmentCode: 'PULMONOLOGY',
    code: 'SLEEP_MEDICINE',
    name: 'Sleep Medicine',
    displayOrder: 1,
  },
  {
    departmentCode: 'PULMONOLOGY',
    code: 'CRITICAL_CARE_PULMONOLOGY',
    name: 'Critical Care Pulmonology',
    displayOrder: 2,
  },
  {
    departmentCode: 'PULMONOLOGY',
    code: 'INTERVENTIONAL_PULMONOLOGY',
    name: 'Interventional Pulmonology',
    displayOrder: 3,
  },
  {
    departmentCode: 'PULMONOLOGY',
    code: 'ASTHMA',
    name: 'Asthma',
    displayOrder: 4,
  },
  {
    departmentCode: 'PULMONOLOGY',
    code: 'COPD',
    name: 'COPD',
    displayOrder: 5,
  },

  // GASTROENTEROLOGY
  {
    departmentCode: 'GASTROENTEROLOGY',
    code: 'HEPATOLOGY',
    name: 'Hepatology',
    displayOrder: 1,
  },
  {
    departmentCode: 'GASTROENTEROLOGY',
    code: 'THERAPEUTIC_ENDOSCOPY',
    name: 'Therapeutic Endoscopy',
    displayOrder: 2,
  },
  {
    departmentCode: 'GASTROENTEROLOGY',
    code: 'INFLAMMATORY_BOWEL_DISEASE',
    name: 'Inflammatory Bowel Disease',
    displayOrder: 3,
  },
  {
    departmentCode: 'GASTROENTEROLOGY',
    code: 'PANCREATOLOGY',
    name: 'Pancreatology',
    displayOrder: 4,
  },
  {
    departmentCode: 'GASTROENTEROLOGY',
    code: 'GI_MOTILITY',
    name: 'GI Motility',
    displayOrder: 5,
  },

  // NEPHROLOGY
  {
    departmentCode: 'NEPHROLOGY',
    code: 'DIALYSIS',
    name: 'Dialysis',
    displayOrder: 1,
  },
  {
    departmentCode: 'NEPHROLOGY',
    code: 'RENAL_TRANSPLANT',
    name: 'Renal Transplant',
    displayOrder: 2,
  },
  {
    departmentCode: 'NEPHROLOGY',
    code: 'CRITICAL_CARE_NEPHROLOGY',
    name: 'Critical Care Nephrology',
    displayOrder: 3,
  },
  {
    departmentCode: 'NEPHROLOGY',
    code: 'PEDIATRIC_NEPHROLOGY',
    name: 'Pediatric Nephrology',
    displayOrder: 4,
  },

  // UROLOGY
  {
    departmentCode: 'UROLOGY',
    code: 'ENDOUROLOGY',
    name: 'Endourology',
    displayOrder: 1,
  },
  {
    departmentCode: 'UROLOGY',
    code: 'UROLOGIC_ONCOLOGY',
    name: 'Urologic Oncology',
    displayOrder: 2,
  },
  {
    departmentCode: 'UROLOGY',
    code: 'ANDROLOGY',
    name: 'Andrology',
    displayOrder: 3,
  },
  {
    departmentCode: 'UROLOGY',
    code: 'FEMALE_UROLOGY',
    name: 'Female Urology',
    displayOrder: 4,
  },
  {
    departmentCode: 'UROLOGY',
    code: 'PEDIATRIC_UROLOGY',
    name: 'Pediatric Urology',
    displayOrder: 5,
  },

  // ONCOLOGY
  {
    departmentCode: 'ONCOLOGY',
    code: 'MEDICAL_ONCOLOGY',
    name: 'Medical Oncology',
    displayOrder: 1,
  },
  {
    departmentCode: 'ONCOLOGY',
    code: 'SURGICAL_ONCOLOGY',
    name: 'Surgical Oncology',
    displayOrder: 2,
  },
  {
    departmentCode: 'ONCOLOGY',
    code: 'RADIATION_ONCOLOGY',
    name: 'Radiation Oncology',
    displayOrder: 3,
  },
  {
    departmentCode: 'ONCOLOGY',
    code: 'HEMATOLOGIC_ONCOLOGY',
    name: 'Hematologic Oncology',
    displayOrder: 4,
  },
  {
    departmentCode: 'ONCOLOGY',
    code: 'PALLIATIVE_ONCOLOGY',
    name: 'Palliative Oncology',
    displayOrder: 5,
  },

  // ENDOCRINOLOGY
  {
    departmentCode: 'ENDOCRINOLOGY',
    code: 'DIABETES',
    name: 'Diabetes',
    displayOrder: 1,
  },
  {
    departmentCode: 'ENDOCRINOLOGY',
    code: 'THYROID_DISORDERS',
    name: 'Thyroid Disorders',
    displayOrder: 2,
  },
  {
    departmentCode: 'ENDOCRINOLOGY',
    code: 'PITUITARY_DISORDERS',
    name: 'Pituitary Disorders',
    displayOrder: 3,
  },
  {
    departmentCode: 'ENDOCRINOLOGY',
    code: 'METABOLIC_DISORDERS',
    name: 'Metabolic Disorders',
    displayOrder: 4,
  },
  {
    departmentCode: 'ENDOCRINOLOGY',
    code: 'OSTEOPOROSIS',
    name: 'Osteoporosis',
    displayOrder: 5,
  },

  // EMERGENCY_MEDICINE
  {
    departmentCode: 'EMERGENCY_MEDICINE',
    code: 'TRAUMA_CARE',
    name: 'Trauma Care',
    displayOrder: 1,
  },
  {
    departmentCode: 'EMERGENCY_MEDICINE',
    code: 'TOXICOLOGY',
    name: 'Toxicology',
    displayOrder: 2,
  },
  {
    departmentCode: 'EMERGENCY_MEDICINE',
    code: 'DISASTER_MEDICINE',
    name: 'Disaster Medicine',
    displayOrder: 3,
  },
  {
    departmentCode: 'EMERGENCY_MEDICINE',
    code: 'EMERGENCY_ULTRASOUND',
    name: 'Emergency Ultrasound',
    displayOrder: 4,
  },

  // ICU
  {
    departmentCode: 'ICU',
    code: 'ADULT_ICU',
    name: 'Adult ICU',
    displayOrder: 1,
  },
  {
    departmentCode: 'ICU',
    code: 'CARDIAC_ICU',
    name: 'Cardiac ICU',
    displayOrder: 2,
  },
  {
    departmentCode: 'ICU',
    code: 'NEURO_ICU',
    name: 'Neuro ICU',
    displayOrder: 3,
  },
  {
    departmentCode: 'ICU',
    code: 'PEDIATRIC_ICU',
    name: 'Pediatric ICU',
    displayOrder: 4,
  },
  {
    departmentCode: 'ICU',
    code: 'NEONATAL_ICU',
    name: 'Neonatal ICU',
    displayOrder: 5,
  },

  // RADIOLOGY
  {
    departmentCode: 'RADIOLOGY',
    code: 'DIAGNOSTIC_RADIOLOGY',
    name: 'Diagnostic Radiology',
    displayOrder: 1,
  },
  {
    departmentCode: 'RADIOLOGY',
    code: 'INTERVENTIONAL_RADIOLOGY',
    name: 'Interventional Radiology',
    displayOrder: 2,
  },
  {
    departmentCode: 'RADIOLOGY',
    code: 'NEURORADIOLOGY',
    name: 'Neuroradiology',
    displayOrder: 3,
  },
  {
    departmentCode: 'RADIOLOGY',
    code: 'MUSCULOSKELETAL_IMAGING',
    name: 'Musculoskeletal Imaging',
    displayOrder: 4,
  },
  {
    departmentCode: 'RADIOLOGY',
    code: 'BREAST_IMAGING',
    name: 'Breast Imaging',
    displayOrder: 5,
  },
  {
    departmentCode: 'RADIOLOGY',
    code: 'NUCLEAR_MEDICINE',
    name: 'Nuclear Medicine',
    displayOrder: 6,
  },

  // LABORATORY_MEDICINE
  {
    departmentCode: 'LABORATORY_MEDICINE',
    code: 'CLINICAL_PATHOLOGY',
    name: 'Clinical Pathology',
    displayOrder: 1,
  },
  {
    departmentCode: 'LABORATORY_MEDICINE',
    code: 'HISTOPATHOLOGY',
    name: 'Histopathology',
    displayOrder: 2,
  },
  {
    departmentCode: 'LABORATORY_MEDICINE',
    code: 'MICROBIOLOGY',
    name: 'Microbiology',
    displayOrder: 3,
  },
  {
    departmentCode: 'LABORATORY_MEDICINE',
    code: 'HEMATOLOGY',
    name: 'Hematology',
    displayOrder: 4,
  },
  {
    departmentCode: 'LABORATORY_MEDICINE',
    code: 'BIOCHEMISTRY',
    name: 'Biochemistry',
    displayOrder: 5,
  },
  {
    departmentCode: 'LABORATORY_MEDICINE',
    code: 'MOLECULAR_DIAGNOSTICS',
    name: 'Molecular Diagnostics',
    displayOrder: 6,
  },
  {
    departmentCode: 'LABORATORY_MEDICINE',
    code: 'CYTOLOGY',
    name: 'Cytology',
    displayOrder: 7,
  },

  // ANESTHESIOLOGY
  {
    departmentCode: 'ANESTHESIOLOGY',
    code: 'CARDIAC_ANESTHESIA',
    name: 'Cardiac Anesthesia',
    displayOrder: 1,
  },
  {
    departmentCode: 'ANESTHESIOLOGY',
    code: 'NEURO_ANESTHESIA',
    name: 'Neuro Anesthesia',
    displayOrder: 2,
  },
  {
    departmentCode: 'ANESTHESIOLOGY',
    code: 'PEDIATRIC_ANESTHESIA',
    name: 'Pediatric Anesthesia',
    displayOrder: 3,
  },
  {
    departmentCode: 'ANESTHESIOLOGY',
    code: 'PAIN_MEDICINE',
    name: 'Pain Medicine',
    displayOrder: 4,
  },
  {
    departmentCode: 'ANESTHESIOLOGY',
    code: 'CRITICAL_CARE_ANESTHESIA',
    name: 'Critical Care Anesthesia',
    displayOrder: 5,
  },

  // DENTISTRY
  {
    departmentCode: 'DENTISTRY',
    code: 'ORTHODONTICS',
    name: 'Orthodontics',
    displayOrder: 1,
  },
  {
    departmentCode: 'DENTISTRY',
    code: 'PROSTHODONTICS',
    name: 'Prosthodontics',
    displayOrder: 2,
  },
  {
    departmentCode: 'DENTISTRY',
    code: 'PERIODONTICS',
    name: 'Periodontics',
    displayOrder: 3,
  },
  {
    departmentCode: 'DENTISTRY',
    code: 'ENDODONTICS',
    name: 'Endodontics',
    displayOrder: 4,
  },
  {
    departmentCode: 'DENTISTRY',
    code: 'ORAL_SURGERY',
    name: 'Oral Surgery',
    displayOrder: 5,
  },
  {
    departmentCode: 'DENTISTRY',
    code: 'PEDIATRIC_DENTISTRY',
    name: 'Pediatric Dentistry',
    displayOrder: 6,
  },

  // PHYSIOTHERAPY
  {
    departmentCode: 'PHYSIOTHERAPY',
    code: 'MUSCULOSKELETAL_PHYSIOTHERAPY',
    name: 'Musculoskeletal Physiotherapy',
    displayOrder: 1,
  },
  {
    departmentCode: 'PHYSIOTHERAPY',
    code: 'NEUROLOGICAL_REHABILITATION',
    name: 'Neurological Rehabilitation',
    displayOrder: 2,
  },
  {
    departmentCode: 'PHYSIOTHERAPY',
    code: 'SPORTS_REHABILITATION',
    name: 'Sports Rehabilitation',
    displayOrder: 3,
  },
  {
    departmentCode: 'PHYSIOTHERAPY',
    code: 'GERIATRIC_PHYSIOTHERAPY',
    name: 'Geriatric Physiotherapy',
    displayOrder: 4,
  },
  {
    departmentCode: 'PHYSIOTHERAPY',
    code: 'PEDIATRIC_PHYSIOTHERAPY',
    name: 'Pediatric Physiotherapy',
    displayOrder: 5,
  },

  // TRADITIONAL_MEDICINE
  {
    departmentCode: 'TRADITIONAL_MEDICINE',
    code: 'AYURVEDA',
    name: 'Ayurveda',
    displayOrder: 1,
  },
  {
    departmentCode: 'TRADITIONAL_MEDICINE',
    code: 'HOMEOPATHY',
    name: 'Homeopathy',
    displayOrder: 2,
  },
  {
    departmentCode: 'TRADITIONAL_MEDICINE',
    code: 'SIDDHA',
    name: 'Siddha',
    displayOrder: 3,
  },
  {
    departmentCode: 'TRADITIONAL_MEDICINE',
    code: 'UNANI',
    name: 'Unani',
    displayOrder: 4,
  },
  {
    departmentCode: 'TRADITIONAL_MEDICINE',
    code: 'YOGA_AND_NATUROPATHY',
    name: 'Yoga & Naturopathy',
    displayOrder: 5,
  },
  {
    departmentCode: 'TRADITIONAL_MEDICINE',
    code: 'PANCHAKARMA',
    name: 'Panchakarma',
    displayOrder: 6,
  },
  {
    departmentCode: 'TRADITIONAL_MEDICINE',
    code: 'AYURVEDIC_SURGERY',
    name: 'Ayurvedic Surgery',
    displayOrder: 7,
  },
  {
    departmentCode: 'TRADITIONAL_MEDICINE',
    code: 'AYURVEDIC_NUTRITION',
    name: 'Ayurvedic Nutrition',
    displayOrder: 8,
  },

  // INTEGRATIVE_MEDICINE
  {
    departmentCode: 'INTEGRATIVE_MEDICINE',
    code: 'ACUPUNCTURE',
    name: 'Acupuncture',
    displayOrder: 1,
  },
  {
    departmentCode: 'INTEGRATIVE_MEDICINE',
    code: 'ACUPRESSURE',
    name: 'Acupressure',
    displayOrder: 2,
  },
  {
    departmentCode: 'INTEGRATIVE_MEDICINE',
    code: 'CUPPING_THERAPY',
    name: 'Cupping Therapy',
    displayOrder: 3,
  },
  {
    departmentCode: 'INTEGRATIVE_MEDICINE',
    code: 'LIFESTYLE_MEDICINE',
    name: 'Lifestyle Medicine',
    displayOrder: 4,
  },
  {
    departmentCode: 'INTEGRATIVE_MEDICINE',
    code: 'PAIN_MANAGEMENT',
    name: 'Pain Management',
    displayOrder: 5,
  },
  {
    departmentCode: 'INTEGRATIVE_MEDICINE',
    code: 'MIND_BODY_MEDICINE',
    name: 'Mind Body Medicine',
    displayOrder: 6,
  },
  {
    departmentCode: 'INTEGRATIVE_MEDICINE',
    code: 'MEDITATION_THERAPY',
    name: 'Meditation Therapy',
    displayOrder: 7,
  },
  {
    departmentCode: 'INTEGRATIVE_MEDICINE',
    code: 'FUNCTIONAL_MEDICINE',
    name: 'Functional Medicine',
    displayOrder: 8,
  },
  {
    departmentCode: 'INTEGRATIVE_MEDICINE',
    code: 'CLINICAL_NUTRITION',
    name: 'Clinical Nutrition',
    displayOrder: 9,
  },

  // VETERINARY_MEDICINE
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'SMALL_ANIMAL_MEDICINE',
    name: 'Small Animal Medicine',
    displayOrder: 1,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'LARGE_ANIMAL_MEDICINE',
    name: 'Large Animal Medicine',
    displayOrder: 2,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'COMPANION_ANIMAL_MEDICINE',
    name: 'Companion Animal Medicine',
    displayOrder: 3,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'CANINE_MEDICINE',
    name: 'Canine Medicine',
    displayOrder: 4,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'FELINE_MEDICINE',
    name: 'Feline Medicine',
    displayOrder: 5,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'AVIAN_MEDICINE',
    name: 'Avian Medicine',
    displayOrder: 6,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'EQUINE_MEDICINE',
    name: 'Equine Medicine',
    displayOrder: 7,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'BOVINE_MEDICINE',
    name: 'Bovine Medicine',
    displayOrder: 8,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'WILDLIFE_MEDICINE',
    name: 'Wildlife Medicine',
    displayOrder: 9,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'ZOO_MEDICINE',
    name: 'Zoo Medicine',
    displayOrder: 10,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'VETERINARY_SURGERY',
    name: 'Veterinary Surgery',
    displayOrder: 11,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'VETERINARY_ORTHOPEDICS',
    name: 'Veterinary Orthopedics',
    displayOrder: 12,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'VETERINARY_DERMATOLOGY',
    name: 'Veterinary Dermatology',
    displayOrder: 13,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'VETERINARY_CARDIOLOGY',
    name: 'Veterinary Cardiology',
    displayOrder: 14,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'VETERINARY_DENTISTRY',
    name: 'Veterinary Dentistry',
    displayOrder: 15,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'VETERINARY_ONCOLOGY',
    name: 'Veterinary Oncology',
    displayOrder: 16,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'VETERINARY_NEUROLOGY',
    name: 'Veterinary Neurology',
    displayOrder: 17,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'VETERINARY_EMERGENCY_AND_CRITICAL_CARE',
    name: 'Veterinary Emergency & Critical Care',
    displayOrder: 18,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'VETERINARY_RADIOLOGY',
    name: 'Veterinary Radiology',
    displayOrder: 19,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'VETERINARY_PATHOLOGY',
    name: 'Veterinary Pathology',
    displayOrder: 20,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'ANIMAL_REHABILITATION',
    name: 'Animal Rehabilitation',
    displayOrder: 21,
  },
  {
    departmentCode: 'VETERINARY_MEDICINE',
    code: 'PREVENTIVE_VETERINARY_MEDICINE',
    name: 'Preventive Veterinary Medicine',
    displayOrder: 22,
  },
];
