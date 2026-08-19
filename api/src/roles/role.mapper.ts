import { Clinic, Role } from '@prisma/client';

import { RoleResponseDto } from './dto/role-response.dto';

type RoleWithRelations = Role & {
  clinic: Clinic;

  _count: {
    permissions: number;
    users: number;
  };
};

export class RoleMapper {
  static toResponseDto(role: RoleWithRelations): RoleResponseDto {
    return {
      id: role.id,

      code: role.code,

      name: role.name,

      description: role.description,

      displayOrder: role.displayOrder,

      isSystem: role.isSystem,

      isActive: role.isActive,

      clinic: {
        id: role.clinic.id,
        code: role.clinic.code,
        name: role.clinic.name,
      },

      permissionCount: role._count.permissions,

      userCount: role._count.users,

      createdAt: role.createdAt,

      updatedAt: role.updatedAt,
    };
  }

  static toResponseDtos(roles: RoleWithRelations[]): RoleResponseDto[] {
    return roles.map((role) => this.toResponseDto(role));
  }
}
