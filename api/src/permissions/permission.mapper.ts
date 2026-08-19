import { Permission, PermissionGroup } from '@prisma/client';

import { PermissionResponseDto } from './dto/permission-response.dto';

type PermissionWithGroup = Permission & {
  permissionGroup: PermissionGroup;
};

export class PermissionMapper {
  static toResponseDto(permission: PermissionWithGroup): PermissionResponseDto {
    return {
      id: permission.id,

      code: permission.code,

      name: permission.name,

      description: permission.description,

      isSystem: permission.isSystem,

      permissionGroup: {
        id: permission.permissionGroup.id,
        code: permission.permissionGroup.code,
        name: permission.permissionGroup.name,
      },

      createdAt: permission.createdAt,

      updatedAt: permission.updatedAt,
    };
  }

  static toResponseDtos(
    permissions: PermissionWithGroup[],
  ): PermissionResponseDto[] {
    return permissions.map((permission) => this.toResponseDto(permission));
  }
}
