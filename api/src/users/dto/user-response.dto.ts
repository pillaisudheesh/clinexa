export class UserResponseDto {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  clinicId: string;
  status: string;
  roles: string[];
  createdAt: Date;
}
