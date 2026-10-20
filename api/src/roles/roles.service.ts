import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { RoleMapper } from './role.mapper';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleQueryDto } from './dto/role-query.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { RoleSortField } from './enums/role-sort-field.enum';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(
    clinicId: string,
    query: RoleQueryDto,
    excludeSuperAdmin = false,
  ): Promise<PaginatedResponseDto<RoleResponseDto>> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const where: Prisma.RoleWhereInput = {
      clinicId,
      ...(excludeSuperAdmin
        ? {
            code: { notIn: ['SUPER_ADMIN', 'SUPER_ADMINISTRATOR'] },
            isActive: true,
          }
        : {}),
    };

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, roles] = await this.prisma.$transaction([
      this.prisma.role.count({ where }),
      this.prisma.role.findMany({
        where,
        include: {
          clinic: true,
          _count: { select: { permissions: true, users: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy ?? RoleSortField.DISPLAY_ORDER]: sortOrder },
      }),
    ]);

    return PaginationUtil.createResponse(
      RoleMapper.toResponseDtos(roles),
      total,
      page,
      limit,
    );
  }

  async findById(clinicId: string, id: string): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findFirst({
      where: { id, clinicId },
      include: {
        clinic: true,
        _count: { select: { permissions: true, users: true } },
      },
    });

    if (!role) throw new NotFoundException('Role not found');
    return RoleMapper.toResponseDto(role);
  }

  async create(
    clinicId: string,
    dto: CreateRoleDto,
    actorId: string,
  ): Promise<RoleResponseDto> {
    const normalizedCode = dto.code
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    const reservedCodes = new Set([
      'SUPER_ADMIN',
      'SUPER_ADMINISTRATOR',
      'CLINIC_ADMIN',
      'CLINIC_ADMINISTRATOR',
      'DOCTOR',
      'NURSE',
      'RECEPTIONIST',
    ]);

    if (reservedCodes.has(normalizedCode)) {
      throw new ConflictException(
        'This role code is reserved for a system role. Choose a custom role code.',
      );
    }

    const existing = await this.prisma.role.findFirst({
      where: {
        clinicId,
        OR: [{ code: dto.code }, { name: dto.name }],
      },
    });
    if (existing) throw new ConflictException('Role already exists');

    const role = await this.prisma.$transaction(async (tx) => {
      const created = await tx.role.create({
        data: {
          clinicId,
          code: dto.code,
          name: dto.name,
          description: dto.description,
          displayOrder: dto.displayOrder,
        },
      });

      await this.auditService.createInTransaction(tx, {
        clinicId: created.clinicId,
        actorId,
        action: 'CREATE',
        entityType: 'ROLE',
        entityId: created.id,
        description: `Created role "${created.name}" (${created.code}).`,
        metadata: {
          name: created.name,
          code: created.code,
          description: created.description,
          displayOrder: created.displayOrder,
          isSystem: created.isSystem,
        },
      });

      return tx.role.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          clinic: true,
          _count: { select: { permissions: true, users: true } },
        },
      });
    });

    return RoleMapper.toResponseDto(role);
  }

  async update(
    clinicId: string,
    id: string,
    dto: UpdateRoleDto,
    actorId: string,
  ): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findFirst({ where: { id, clinicId } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) {
      throw new ConflictException('System roles cannot be modified.');
    }

    if (dto.name && dto.name !== role.name) {
      const existing = await this.prisma.role.findFirst({
        where: { clinicId, name: dto.name, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('A role with this name already exists.');
      }
    }

    const changedFields: Record<string, { before: unknown; after: unknown }> =
      {};
    for (const field of ['name', 'description', 'displayOrder'] as const) {
      if (dto[field] !== undefined && dto[field] !== role[field]) {
        changedFields[field] = { before: role[field], after: dto[field] };
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.role.update({
        where: { id, clinicId },
        data: {
          name: dto.name,
          description: dto.description,
          displayOrder: dto.displayOrder,
        },
      });

      if (Object.keys(changedFields).length > 0) {
        await this.auditService.createInTransaction(tx, {
          clinicId: result.clinicId,
          actorId,
          action: 'UPDATE',
          entityType: 'ROLE',
          entityId: result.id,
          description: `Updated role "${result.name}".`,
          metadata: {
            changedFields: changedFields as Prisma.InputJsonValue,
          },
        });
      }

      return tx.role.findUniqueOrThrow({
        where: { id },
        include: {
          clinic: true,
          _count: { select: { permissions: true, users: true } },
        },
      });
    });

    return RoleMapper.toResponseDto(updated);
  }

  async updateStatus(
    clinicId: string,
    id: string,
    isActive: boolean,
    actorId: string,
  ): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findFirst({ where: { id, clinicId } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) {
      throw new ConflictException(
        'System roles cannot be activated or deactivated.',
      );
    }

    if (role.code === 'CLINIC_ADMIN' && !isActive && role.isActive) {
      const adminCount = await this.prisma.role.count({
        where: { clinicId, code: 'CLINIC_ADMIN', isActive: true },
      });
      if (adminCount <= 1) {
        throw new ConflictException(
          'Cannot deactivate the last Clinic Administrator.',
        );
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.role.update({
        where: { id, clinicId },
        data: { isActive },
      });

      if (role.isActive !== isActive) {
        await this.auditService.createInTransaction(tx, {
          clinicId: result.clinicId,
          actorId,
          action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
          entityType: 'ROLE',
          entityId: result.id,
          description: `${isActive ? 'Activated' : 'Deactivated'} role "${result.name}".`,
          metadata: { previousIsActive: role.isActive, newIsActive: isActive },
        });
      }

      return tx.role.findUniqueOrThrow({
        where: { id },
        include: {
          clinic: true,
          _count: { select: { permissions: true, users: true } },
        },
      });
    });

    return RoleMapper.toResponseDto(updated);
  }

  async assignPermissions(
    clinicId: string | null,
    roleId: string,
    permissionIds: string[],
    actorId: string,
    // _isPlatformAdmin = false,
  ): Promise<RoleResponseDto> {
    const role = await this.getRoleOrThrow(clinicId, roleId);

    if (!role.isActive) {
      throw new ConflictException(
        'Cannot assign permissions to an inactive role.',
      );
    }

    const protectedCodes = new Set([
      'CLINIC_READ',
      'CLINIC_CREATE',
      'CLINIC_UPDATE',
      'CLINIC_DELETE',
    ]);

    const uniquePermissionIds = [...new Set(permissionIds)];
    if (uniquePermissionIds.length !== permissionIds.length) {
      throw new ConflictException('Duplicate permission IDs are not allowed.');
    }

    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: uniquePermissionIds } },
      select: { id: true, code: true },
    });

    if (permissions.length !== uniquePermissionIds.length) {
      throw new NotFoundException('One or more permissions were not found.');
    }

    // Preserve the existing protection: platform-level clinic lifecycle
    // permissions cannot be granted to clinic roles, including by a clinic
    // administrator. isPlatformAdmin does not itself make a clinic role a
    // platform role.
    const forbiddenPermissions = permissions.filter((permission) =>
      protectedCodes.has(permission.code),
    );
    if (forbiddenPermissions.length > 0) {
      throw new ConflictException(
        `Clinic roles cannot be assigned platform-level clinic permissions: ${forbiddenPermissions
          .map((permission) => permission.code)
          .join(', ')}.`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const currentMappings = await tx.rolePermission.findMany({
        where: { roleId },
        include: { permission: { select: { id: true, code: true } } },
      });
      const currentIds = new Set(
        currentMappings.map((mapping) => mapping.permissionId),
      );
      const requestedIds = new Set(uniquePermissionIds);
      const added = permissions.filter(
        (permission) => !currentIds.has(permission.id),
      );
      const removed = currentMappings
        .map((mapping) => mapping.permission)
        .filter((permission) => !requestedIds.has(permission.id));

      await tx.rolePermission.deleteMany({ where: { roleId } });
      if (uniquePermissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: uniquePermissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }

      if (added.length > 0) {
        await this.auditService.createInTransaction(tx, {
          clinicId: role.clinicId,
          actorId,
          action: 'PERMISSION_ASSIGN',
          entityType: 'ROLE',
          entityId: roleId,
          description: `Assigned ${added.length} permission(s) to role "${role.name}".`,
          metadata: {
            roleName: role.name,
            permissionIds: added.map((permission) => permission.id),
            permissionCodes: added.map((permission) => permission.code),
          },
        });
      }

      if (removed.length > 0) {
        await this.auditService.createInTransaction(tx, {
          clinicId: role.clinicId,
          actorId,
          action: 'PERMISSION_REMOVE',
          entityType: 'ROLE',
          entityId: roleId,
          description: `Removed ${removed.length} permission(s) from role "${role.name}".`,
          metadata: {
            roleName: role.name,
            permissionIds: removed.map((permission) => permission.id),
            permissionCodes: removed.map((permission) => permission.code),
          },
        });
      }
    });

    const updatedRole = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        clinic: true,
        _count: { select: { permissions: true, users: true } },
      },
    });

    if (!updatedRole) throw new NotFoundException('Role not found');
    return RoleMapper.toResponseDto(updatedRole);
  }

  async getPermissions(clinicId: string | null, roleId: string) {
    await this.getRoleOrThrow(clinicId, roleId);
    return this.prisma.permission.findMany({
      where: { rolePermissions: { some: { roleId } } },
      include: { permissionGroup: true },
      orderBy: [{ permissionGroup: { displayOrder: 'asc' } }, { code: 'asc' }],
    });
  }

  private async getRoleOrThrow(clinicId: string | null, roleId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, ...(clinicId ? { clinicId } : {}) },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }
}
