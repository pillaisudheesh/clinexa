/**
 * SamaRoot starter laboratory-test master data.
 *
 * Reference ranges below are DEFAULT ADULT reference/decision values for
 * development and initial configuration. They are NOT universal clinical
 * limits and must be verified by each laboratory before appearing on a
 * patient report. WHO and NABL emphasize laboratory-specific, population-
 * appropriate and method-dependent reference intervals.
 */

export type LabTestSeed = {
  code: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  unit?: string;
  normalRange?: string;
};

export const labTests: LabTestSeed[] = [
  {
    code: 'CBC',
    name: 'Complete Blood Count',
    description:
      'Complete blood count including major hematological parameters.',
    category: 'Hematology',
    price: 350,
    normalRange: 'See component reference intervals',
  },
  {
    code: 'ESR',
    name: 'Erythrocyte Sedimentation Rate',
    category: 'Hematology',
    price: 150,
    unit: 'mm/hr',
    normalRange: 'Adult male: 0–15; adult female: 0–20',
  },
  {
    code: 'HB',
    name: 'Hemoglobin',
    category: 'Hematology',
    price: 100,
    unit: 'g/dL',
    normalRange: 'Adult male: 13–18; adult female: 12–16',
  },
  {
    code: 'PCV',
    name: 'Packed Cell Volume',
    category: 'Hematology',
    price: 100,
    unit: '%',
    normalRange: 'Adult male: 40–55; adult female: 36–48',
  },
  {
    code: 'PLT',
    name: 'Platelet Count',
    category: 'Hematology',
    price: 150,
    unit: '10^3/µL',
    normalRange: '150–400',
  },
  {
    code: 'RETIC',
    name: 'Reticulocyte Count',
    category: 'Hematology',
    price: 250,
    unit: '%',
    normalRange: 'Adults: approximately 0.5–2.5',
  },
  {
    code: 'FBS',
    name: 'Fasting Blood Sugar',
    description: 'Fasting plasma glucose measurement.',
    category: 'Biochemistry',
    price: 120,
    unit: 'mg/dL',
    normalRange:
      '70–99 (adult fasting reference; diagnostic thresholds are separate)',
  },
  {
    code: 'RBS',
    name: 'Random Blood Sugar',
    description:
      'Random blood glucose measurement; interpretation depends on timing and clinical context.',
    category: 'Biochemistry',
    price: 120,
    unit: 'mg/dL',
    normalRange:
      'No single universal reference interval; interpret with timing and clinical context',
  },
  {
    code: 'PPBS',
    name: 'Postprandial Blood Sugar',
    description:
      'Postprandial blood glucose measurement, commonly interpreted at 2 hours after a meal.',
    category: 'Biochemistry',
    price: 120,
    unit: 'mg/dL',
    normalRange:
      '<140 at 2 hours after a meal is commonly used as a normal/decision threshold; local protocol applies',
  },
  {
    code: 'HBA1C',
    name: 'HbA1c',
    description: 'Glycated hemoglobin.',
    category: 'Biochemistry',
    price: 450,
    unit: '%',
    normalRange:
      'Approximately 4.0–5.6% in non-diabetic adults; diagnostic thresholds are separate',
  },
  {
    code: 'LFT',
    name: 'Liver Function Test',
    description: 'Panel of commonly requested liver function parameters.',
    category: 'Biochemistry',
    price: 850,
    normalRange: 'See individual component reference intervals',
  },
  {
    code: 'RFT',
    name: 'Renal Function Test',
    description: 'Panel of commonly requested renal function parameters.',
    category: 'Biochemistry',
    price: 750,
    normalRange: 'See individual component reference intervals',
  },
  {
    code: 'UREA',
    name: 'Blood Urea',
    category: 'Biochemistry',
    price: 180,
    unit: 'mg/dL',
    normalRange: 'Approx. 15–45',
  },
  {
    code: 'CREAT',
    name: 'Serum Creatinine',
    category: 'Biochemistry',
    price: 180,
    unit: 'mg/dL',
    normalRange: 'Adult male: approx. 0.7–1.3; adult female: approx. 0.6–1.1',
  },
  {
    code: 'URIC',
    name: 'Uric Acid',
    category: 'Biochemistry',
    price: 200,
    unit: 'mg/dL',
    normalRange: 'Adult male: approx. 3.4–7.0; adult female: approx. 2.4–6.0',
  },
  {
    code: 'NA',
    name: 'Serum Sodium',
    category: 'Biochemistry',
    price: 200,
    unit: 'mmol/L',
    normalRange: '135–145',
  },
  {
    code: 'K',
    name: 'Serum Potassium',
    category: 'Biochemistry',
    price: 200,
    unit: 'mmol/L',
    normalRange: '3.5–5.0',
  },
  {
    code: 'CL',
    name: 'Serum Chloride',
    category: 'Biochemistry',
    price: 200,
    unit: 'mmol/L',
    normalRange: '98–106',
  },
  {
    code: 'CA',
    name: 'Serum Calcium',
    category: 'Biochemistry',
    price: 200,
    unit: 'mg/dL',
    normalRange: '8.5–10.5',
  },
  {
    code: 'PHOS',
    name: 'Serum Phosphorus',
    category: 'Biochemistry',
    price: 250,
    unit: 'mg/dL',
    normalRange: 'Adults: approximately 2.5–4.5',
  },
  {
    code: 'MG',
    name: 'Serum Magnesium',
    category: 'Biochemistry',
    price: 300,
    unit: 'mg/dL',
    normalRange: 'Approximately 1.7–2.2',
  },
  {
    code: 'LIPID',
    name: 'Lipid Profile',
    description: 'Routine lipid profile.',
    category: 'Biochemistry',
    price: 650,
    normalRange:
      'See individual component values; clinical targets depend on cardiovascular risk',
  },
  {
    code: 'TC',
    name: 'Total Cholesterol',
    category: 'Biochemistry',
    price: 180,
    unit: 'mg/dL',
    normalRange:
      'Desirable: <200; interpretation should use cardiovascular risk context',
  },
  {
    code: 'HDL',
    name: 'HDL Cholesterol',
    category: 'Biochemistry',
    price: 180,
    unit: 'mg/dL',
    normalRange:
      'Common adult reference: male >40; female >50; higher is generally associated with lower risk',
  },
  {
    code: 'LDL',
    name: 'LDL Cholesterol',
    category: 'Biochemistry',
    price: 180,
    unit: 'mg/dL',
    normalRange:
      'Target depends on cardiovascular risk; <100 is commonly used as a general reference target',
  },
  {
    code: 'TG',
    name: 'Triglycerides',
    category: 'Biochemistry',
    price: 180,
    unit: 'mg/dL',
    normalRange: '<150 fasting',
  },
  {
    code: 'TFT',
    name: 'Thyroid Function Test',
    description: 'Routine thyroid function panel.',
    category: 'Endocrinology',
    price: 650,
    normalRange: 'See individual component reference intervals',
  },
  {
    code: 'TSH',
    name: 'Thyroid Stimulating Hormone',
    category: 'Endocrinology',
    price: 350,
    unit: 'µIU/mL',
    normalRange: 'Approximately 0.4–4.0',
  },
  {
    code: 'FT3',
    name: 'Free T3',
    category: 'Endocrinology',
    price: 350,
    unit: 'pg/mL',
    normalRange: 'Approximately 2.3–4.2',
  },
  {
    code: 'FT4',
    name: 'Free T4',
    category: 'Endocrinology',
    price: 350,
    unit: 'ng/dL',
    normalRange: 'Approximately 0.8–1.8',
  },
  {
    code: 'VITD',
    name: 'Vitamin D',
    description: '25-hydroxy Vitamin D.',
    category: 'Immunology',
    price: 900,
    unit: 'ng/mL',
    normalRange:
      '25-hydroxy Vitamin D: ≥20 is generally considered adequate for most people; laboratory interpretation applies',
  },
  {
    code: 'VITB12',
    name: 'Vitamin B12',
    category: 'Immunology',
    price: 750,
    unit: 'pg/mL',
    normalRange: 'Approximately 200–900',
  },
  {
    code: 'FERRITIN',
    name: 'Ferritin',
    category: 'Immunology',
    price: 650,
    unit: 'ng/mL',
    normalRange:
      'Sex- and laboratory-dependent; commonly adult male ~24–336, female ~11–307',
  },
  {
    code: 'IRON',
    name: 'Serum Iron',
    category: 'Biochemistry',
    price: 300,
    unit: 'µg/dL',
    normalRange:
      'Adult male: approximately 65–175; adult female: approximately 50–170',
  },
  {
    code: 'CRP',
    name: 'C-Reactive Protein',
    category: 'Immunology',
    price: 350,
    unit: 'mg/L',
    normalRange: '<10',
  },
  {
    code: 'HSCRP',
    name: 'High Sensitivity C-Reactive Protein',
    category: 'Immunology',
    price: 650,
    unit: 'mg/L',
    normalRange:
      '<1 low cardiovascular risk; 1–3 average; >3 higher risk (after excluding acute inflammation)',
  },
  {
    code: 'URINE_RM',
    name: 'Urine Routine Microscopy',
    category: 'Urinalysis',
    price: 250,
    normalRange:
      'Typically negative for protein/glucose/ketones/blood; microscopy reference values are method-specific',
  },
  {
    code: 'URINE_CULTURE',
    name: 'Urine Culture',
    description:
      'Urine culture with antimicrobial susceptibility where indicated.',
    category: 'Microbiology',
    price: 600,
    normalRange:
      'No clinically significant growth / interpretation is organism- and colony-count-specific',
  },
  {
    code: 'STOOL_RM',
    name: 'Stool Routine Examination',
    category: 'Microbiology',
    price: 250,
    normalRange:
      'Typically negative for occult blood, ova, parasites and pathogenic organisms; method-specific',
  },
  {
    code: 'STOOL_CULTURE',
    name: 'Stool Culture',
    category: 'Microbiology',
    price: 650,
    normalRange: 'No pathogenic bacterial growth',
  },
  {
    code: 'BLOOD_CULTURE',
    name: 'Blood Culture',
    description:
      'Blood culture with organism identification and susceptibility where indicated.',
    category: 'Microbiology',
    price: 900,
    normalRange: 'No growth',
  },
  {
    code: 'HBSAG',
    name: 'HBsAg',
    description: 'Hepatitis B surface antigen screening assay.',
    category: 'Serology',
    price: 450,
    normalRange: 'Non-reactive / negative',
  },
  {
    code: 'HCV',
    name: 'Anti-HCV',
    description: 'Hepatitis C antibody screening assay.',
    category: 'Serology',
    price: 500,
    normalRange: 'Non-reactive / negative',
  },
  {
    code: 'HIV',
    name: 'HIV 1 & 2 Screening',
    description:
      'HIV screening assay; exact methodology depends on the laboratory.',
    category: 'Serology',
    price: 500,
    normalRange: 'Non-reactive / negative',
  },
  {
    code: 'DENGUE_NS1',
    name: 'Dengue NS1 Antigen',
    category: 'Serology',
    price: 500,
    normalRange: 'Negative / not detected',
  },
  {
    code: 'DENGUE_IGG_IGM',
    name: 'Dengue IgG/IgM',
    category: 'Serology',
    price: 650,
    normalRange: 'Negative / non-reactive; assay-specific interpretation',
  },
  {
    code: 'MALARIA',
    name: 'Malaria Parasite Test',
    description: "Malaria screening by the laboratory's validated method.",
    category: 'Microbiology',
    price: 300,
    normalRange: 'No malaria parasite detected',
  },
  {
    code: 'PT_INR',
    name: 'Prothrombin Time / INR',
    description:
      'Prothrombin time with INR; reference values are strongly method/reagent dependent.',
    category: 'Hematology',
    price: 400,
    normalRange:
      'PT: method/reagent/instrument dependent; INR in patients not receiving anticoagulation is commonly around 0.8–1.2',
  },
  {
    code: 'APTT',
    name: 'Activated Partial Thromboplastin Time',
    description:
      'Activated partial thromboplastin time; reference values are reagent/instrument dependent.',
    category: 'Hematology',
    price: 400,
    unit: 'seconds',
    normalRange: 'Approximately 25–35 seconds; reagent/instrument dependent',
  },
];
