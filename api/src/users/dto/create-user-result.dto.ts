import { UserResponseDto } from './user-response.dto';

export class CreateUserResultDto {
  user!: UserResponseDto;
  emailSent!: boolean;
  message?: string;
}
