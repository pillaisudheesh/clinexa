export type DoctorTitle = "DR" | "PROF" | "MR" | "MS";

export type DoctorGender = "MALE" | "FEMALE" | "OTHER";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "VISITING"
  | "CONSULTANT"
  | "RESIDENT";

export interface DoctorReference {
  id: string;
  code?: string;
  name: string;
}

export interface Doctor {
  id: string;
  doctorNumber: string;

  title: DoctorTitle;

  firstName: string;
  middleName?: string;
  lastName: string;

  gender: DoctorGender;

  dateOfBirth?: string;
  email?: string;
  phone?: string;

  biography?: string;
  yearsOfExperience?: number;

  employmentType: EmploymentType;

  registrationNumber?: string;

  registrationCouncil?: DoctorReference;

  department: DoctorReference;

  primarySpecialty: DoctorReference;

  specialties: DoctorReference[];

  qualifications: DoctorReference[];

  languages: DoctorReference[];

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface DoctorQuery {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  specialtyId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedDoctors {
  data: Doctor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDoctorRequest {
  title: DoctorTitle;

  firstName: string;
  middleName?: string;
  lastName: string;

  gender: DoctorGender;
  dateOfBirth?: string;

  email?: string;
  phone?: string;

  departmentId: string;
  primarySpecialtyId: string;

  additionalSpecialtyIds?: string[];
  qualificationIds?: string[];
  languageIds?: string[];

  registrationCouncilId?: string;
  registrationNumber?: string;

  yearsOfExperience?: number;

  employmentType: EmploymentType;

  biography?: string;
}

export type UpdateDoctorRequest = Partial<CreateDoctorRequest>;

export interface UpdateDoctorStatusRequest {
  isActive: boolean;
}
