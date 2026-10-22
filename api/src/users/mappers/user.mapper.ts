import { Prisma } from '@prisma/client';
import { UserResponseDto } from '../dto/user-response.dto';

type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        role: true;
      };
    };
    doctorProfile: true;
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
      doctorProfile: user.doctorProfile
        ? {
            id: user.doctorProfile.id,
            doctorNumber: user.doctorProfile.doctorNumber,
            title: user.doctorProfile.title,
            firstName: user.doctorProfile.firstName,
            lastName: user.doctorProfile.lastName,
          }
        : null,
    };
  }
}
