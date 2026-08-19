export type PatientGender = "MALE" | "FEMALE" | "OTHER";

export type BloodGroup =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE";

export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";

/**
 * Patient returned by the API.
 */
export interface Patient {
  id: string;
  patientNumber: string;

  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;

  age: number;

  gender: PatientGender;
  dateOfBirth: string;

  phone: string | null;
  email: string | null;

  bloodGroup: BloodGroup | null;
  maritalStatus: MaritalStatus | null;

  /* Address */
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;

  /* Emergency contact */
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;

  isActive: boolean;

  clinic: {
    id: string;
    code: string;
    name: string;
  };

  createdAt: string;
  updatedAt: string;
}

/**
 * Query parameters supported by
 * GET /patients
 */
export interface PatientQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Response from GET /patients
 */
export interface PaginatedPatients {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Request body for POST /patients
 */
export interface CreatePatientRequest {
  firstName: string;
  middleName?: string;
  lastName: string;

  gender: PatientGender;
  dateOfBirth: string;

  phone?: string;
  email?: string;

  bloodGroup?: BloodGroup;
  maritalStatus?: MaritalStatus;

  /* Address */
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  /* Emergency contact */
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

/**
 * Request body for PATCH /patients/:id
 *
 * UpdatePatientDto extends PartialType(CreatePatientDto),
 * therefore every field is optional.
 */
export type UpdatePatientRequest = Partial<CreatePatientRequest>;

/**
 * Request body for PUT /patients/:id/status
 */
export interface UpdatePatientStatusRequest {
  isActive: boolean;
}
