export class ClinicResponseDto {
  id: string;

  code: string;

  name: string;

  email: string | null;

  phone: string | null;

  website: string | null;

  addressLine1: string | null;

  addressLine2: string | null;

  city: string | null;

  state: string | null;

  country: string | null;

  postalCode: string | null;

  timezone: string;

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;
}
