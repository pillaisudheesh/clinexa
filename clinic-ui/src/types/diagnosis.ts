export interface Diagnosis {
  id: string;
  medicalRecordId: string;
  code?: string | null;
  name: string;
  isPrimary: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface CreateDiagnosisRequest {
  medicalRecordId: string;
  code?: string;
  name: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface UpdateDiagnosisRequest {
  code?: string;
  name?: string;
  isPrimary?: boolean;
  notes?: string;
}
