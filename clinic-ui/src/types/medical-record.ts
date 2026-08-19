export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;

  chiefComplaint?: string | null;
  historyOfPresentIllness?: string | null;
  examinationNotes?: string | null;
  assessment?: string | null;
  treatmentPlan?: string | null;
  followUpInstructions?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordRequest {
  patientId: string;
  doctorId: string;
  appointmentId: string;

  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  examinationNotes?: string;
  assessment?: string;
  treatmentPlan?: string;
  followUpInstructions?: string;
}

export interface UpdateMedicalRecordRequest {
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  examinationNotes?: string;
  assessment?: string;
  treatmentPlan?: string;
  followUpInstructions?: string;
}
