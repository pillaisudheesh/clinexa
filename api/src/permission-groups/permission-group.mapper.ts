import { PermissionGroup } from '@prisma/client';

import { PermissionGroupResponseDto } from './dto/permission-group-response.dto';

export class PermissionGroupMapper {
  static toResponseDto(
    permissionGroup: PermissionGroup,
  ): PermissionGroupResponseDto {
    return {
      id: permissionGroup.id,
      code: permissionGroup.code,
      name: permissionGroup.name,
      description: permissionGroup.description,
      displayOrder: permissionGroup.displayOrder,
      isSystem: permissionGroup.isSystem,
      createdAt: permissionGroup.createdAt,
      updatedAt: permissionGroup.updatedAt,
    };
  }

  static toResponseDtos(
    permissionGroups: PermissionGroup[],
  ): PermissionGroupResponseDto[] {
    return permissionGroups.map((permissionGroup) =>
      this.toResponseDto(permissionGroup),
    );
  }
}
