export class UserResponseDto {
  id!: string;
  firstName!: string;
  lastName!: string | null;
  email!: string;
  clinicId!: string;
  status!: string;
  roles!: string[];
  createdAt!: Date;

  doctorProfile!: {
    id: string;
    doctorNumber: string;
    title: string;
    firstName: string;
    lastName: string;
  } | null;
}
