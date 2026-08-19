export interface PermissionSeed {
  code: string;
  name: string;
}

export const permissions: Record<string, PermissionSeed[]> = {
  ADMINISTRATION: [
    { code: 'USER_READ', name: 'View Users' },
    { code: 'USER_CREATE', name: 'Create Users' },
    { code: 'USER_UPDATE', name: 'Update Users' },
    { code: 'USER_DELETE', name: 'Delete Users' },

    { code: 'ROLE_READ', name: 'View Roles' },
    { code: 'ROLE_CREATE', name: 'Create Roles' },
    { code: 'ROLE_UPDATE', name: 'Update Roles' },
    { code: 'ROLE_DELETE', name: 'Delete Roles' },

    { code: 'PERMISSION_READ', name: 'View Permissions' },
  ],

  CLINIC: [
    { code: 'CLINIC_READ', name: 'View Clinics' },
    { code: 'CLINIC_CREATE', name: 'Create Clinics' },
    { code: 'CLINIC_UPDATE', name: 'Update Clinics' },
    { code: 'CLINIC_DELETE', name: 'Delete Clinics' },
  ],

  PATIENT: [
    { code: 'PATIENT_READ', name: 'View Patients' },
    { code: 'PATIENT_CREATE', name: 'Create Patients' },
    { code: 'PATIENT_UPDATE', name: 'Update Patients' },
    { code: 'PATIENT_DELETE', name: 'Delete Patients' },
  ],

  DOCTOR: [
    { code: 'DOCTOR_READ', name: 'View Doctors' },
    { code: 'DOCTOR_CREATE', name: 'Create Doctors' },
    { code: 'DOCTOR_UPDATE', name: 'Update Doctors' },
    { code: 'DOCTOR_DELETE', name: 'Delete Doctors' },
  ],

  APPOINTMENT: [
    { code: 'APPOINTMENT_READ', name: 'View Appointments' },
    { code: 'APPOINTMENT_CREATE', name: 'Create Appointments' },
    { code: 'APPOINTMENT_UPDATE', name: 'Update Appointments' },
    { code: 'APPOINTMENT_CANCEL', name: 'Cancel Appointments' },
  ],

  MEDICAL_RECORD: [
    { code: 'MEDICAL_RECORD_READ', name: 'View Medical Records' },
    { code: 'MEDICAL_RECORD_CREATE', name: 'Create Medical Records' },
    { code: 'MEDICAL_RECORD_UPDATE', name: 'Update Medical Records' },
    { code: 'MEDICAL_RECORD_DELETE', name: 'Delete Medical Records' },
  ],

  DIAGNOSIS: [
    { code: 'DIAGNOSIS_READ', name: 'View Diagnoses' },
    { code: 'DIAGNOSIS_CREATE', name: 'Create Diagnoses' },
    { code: 'DIAGNOSIS_UPDATE', name: 'Update Diagnoses' },
    { code: 'DIAGNOSIS_DELETE', name: 'Delete Diagnoses' },
  ],

  LABORATORY: [
    { code: 'LAB_READ', name: 'View Laboratory' },
    { code: 'LAB_CREATE', name: 'Create Laboratory Tests' },
    { code: 'LAB_UPDATE', name: 'Update Laboratory Tests' },
    { code: 'LAB_DELETE', name: 'Delete Laboratory Tests' },
  ],

  PHARMACY: [
    { code: 'PHARMACY_READ', name: 'View Medicines' },
    { code: 'PHARMACY_CREATE', name: 'Create Medicines' },
    { code: 'PHARMACY_UPDATE', name: 'Update Medicines' },
    { code: 'PHARMACY_DELETE', name: 'Delete Medicines' },
  ],

  BILLING: [
    { code: 'BILLING_READ', name: 'View Billing' },
    { code: 'BILLING_CREATE', name: 'Create Invoices' },
    { code: 'BILLING_UPDATE', name: 'Update Invoices' },
    { code: 'BILLING_REFUND', name: 'Refund Invoices' },
  ],

  INVENTORY: [
    { code: 'INVENTORY_READ', name: 'View Inventory' },
    { code: 'INVENTORY_CREATE', name: 'Create Inventory' },
    { code: 'INVENTORY_UPDATE', name: 'Update Inventory' },
    { code: 'INVENTORY_DELETE', name: 'Delete Inventory' },
  ],

  REPORTS: [
    { code: 'REPORT_READ', name: 'View Reports' },
    { code: 'REPORT_EXPORT', name: 'Export Reports' },
  ],

  SETTINGS: [
    { code: 'SETTINGS_READ', name: 'View Settings' },
    { code: 'SETTINGS_UPDATE', name: 'Update Settings' },
  ],

  DEPARTMENT: [
    { code: 'DEPARTMENT_READ', name: 'View Departments' },
    { code: 'DEPARTMENT_CREATE', name: 'Create Departments' },
    { code: 'DEPARTMENT_UPDATE', name: 'Update Departments' },
    { code: 'DEPARTMENT_DELETE', name: 'Delete Departments' },
  ],

  SPECIALTY: [
    { code: 'SPECIALTY_READ', name: 'View Specialties' },
    { code: 'SPECIALTY_CREATE', name: 'Create Specialties' },
    { code: 'SPECIALTY_UPDATE', name: 'Update Specialties' },
    { code: 'SPECIALTY_DELETE', name: 'Delete Specialties' },
  ],

  QUALIFICATION: [
    { code: 'QUALIFICATION_READ', name: 'View Qualifications' },
    { code: 'QUALIFICATION_CREATE', name: 'Create Qualifications' },
    { code: 'QUALIFICATION_UPDATE', name: 'Update Qualifications' },
    { code: 'QUALIFICATION_DELETE', name: 'Delete Qualifications' },
  ],

  LANGUAGE: [
    { code: 'LANGUAGE_READ', name: 'View Languages' },
    { code: 'LANGUAGE_CREATE', name: 'Create Languages' },
    { code: 'LANGUAGE_UPDATE', name: 'Update Languages' },
    { code: 'LANGUAGE_DELETE', name: 'Delete Languages' },
  ],

  REGISTRATION_COUNCIL: [
    { code: 'REGISTRATION_COUNCIL_READ', name: 'View Registration Councils' },
    {
      code: 'REGISTRATION_COUNCIL_CREATE',
      name: 'Create Registration Councils',
    },
    {
      code: 'REGISTRATION_COUNCIL_UPDATE',
      name: 'Update Registration Councils',
    },
    {
      code: 'REGISTRATION_COUNCIL_DELETE',
      name: 'Delete Registration Councils',
    },
  ],
};
