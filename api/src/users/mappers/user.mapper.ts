import { Prisma } from '@prisma/client';
import { UserResponseDto } from '../dto/user-response.dto';

type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        role: true;
      };
    };
  };
}>;

export class UserMapper {
  static toResponseDto(user: UserWithRoles): UserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      clinicId: user.clinicId,
      status: user.status,
      createdAt: user.createdAt,
      roles: user.roles.map((r) => r.role.name),
    };
  }
}
