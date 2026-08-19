import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

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
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    clinicId: string,
    query: RoleQueryDto,
  ): Promise<PaginatedResponseDto<RoleResponseDto>> {
    const { page, limit, search, sortBy, sortOrder } = query;

    const where: Prisma.RoleWhereInput = {
      clinicId,
    };

    if (search) {
      where.OR = [
        {
          code: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [total, roles] = await this.prisma.$transaction([
      this.prisma.role.count({
        where,
      }),

      this.prisma.role.findMany({
        where,

        include: {
          clinic: true,

          _count: {
            select: {
              permissions: true,
              users: true,
            },
          },
        },

        skip: (page - 1) * limit,

        take: limit,

        orderBy: {
          [sortBy ?? RoleSortField.DISPLAY_ORDER]: sortOrder,
        },
      }),
    ]);

    return PaginationUtil.createResponse(
      RoleMapper.toResponseDtos(roles),
      total,
      page,
      limit,
    );
  }

  async findById(id: string): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: {
        id,
      },

      include: {
        clinic: true,

        _count: {
          select: {
            permissions: true,
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return RoleMapper.toResponseDto(role);
  }

  async create(clinicId: string, dto: CreateRoleDto): Promise<RoleResponseDto> {
    const existing = await this.prisma.role.findFirst({
      where: {
        clinicId,

        OR: [
          {
            code: dto.code,
          },
          {
            name: dto.name,
          },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Role already exists');
    }

    const role = await this.prisma.role.create({
      data: {
        clinicId,

        code: dto.code,

        name: dto.name,

        description: dto.description,

        displayOrder: dto.displayOrder,
      },

      include: {
        clinic: true,

        _count: {
          select: {
            permissions: true,
            users: true,
          },
        },
      },
    });

    return RoleMapper.toResponseDto(role);
  }

  async update(
    clinicId: string,
    id: string,
    dto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new ConflictException('System roles cannot be modified.');
    }

    if (dto.name && dto.name !== role.name) {
      const existing = await this.prisma.role.findFirst({
        where: {
          clinicId,
          name: dto.name,
          id: {
            not: id,
          },
        },
      });

      if (existing) {
        throw new ConflictException('A role with this name already exists.');
      }
    }

    const updated = await this.prisma.role.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        description: dto.description,
        displayOrder: dto.displayOrder,
      },
      include: {
        clinic: true,
        _count: {
          select: {
            permissions: true,
            users: true,
          },
        },
      },
    });

    return RoleMapper.toResponseDto(updated);
  }

  async updateStatus(
    clinicId: string,
    id: string,
    isActive: boolean,
  ): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.code === 'SUPER_ADMIN' && !isActive) {
      throw new ConflictException('Super Administrator cannot be deactivated.');
    }

    if (role.code === 'CLINIC_ADMIN' && !isActive) {
      const adminCount = await this.prisma.role.count({
        where: {
          clinicId,
          code: 'CLINIC_ADMIN',
          isActive: true,
        },
      });

      if (adminCount <= 1) {
        throw new ConflictException(
          'Cannot deactivate the last Clinic Administrator.',
        );
      }
    }

    const updated = await this.prisma.role.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
      include: {
        clinic: true,
        _count: {
          select: {
            permissions: true,
            users: true,
          },
        },
      },
    });

    return RoleMapper.toResponseDto(updated);
  }

  async assignPermissions(
    clinicId: string,
    roleId: string,
    permissionIds: string[],
  ): Promise<RoleResponseDto> {
    const role = await this.getRoleOrThrow(clinicId, roleId);

    if (!role.isActive) {
      throw new ConflictException(
        'Cannot assign permissions to an inactive role.',
      );
    }

    const permissions = await this.prisma.permission.findMany({
      where: {
        id: {
          in: permissionIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions were not found.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: {
          roleId,
        },
      });

      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }
    });

    const updatedRole = await this.prisma.role.findUnique({
      where: {
        id: roleId,
      },
      include: {
        clinic: true,
        _count: {
          select: {
            permissions: true,
            users: true,
          },
        },
      },
    });

    if (!updatedRole) {
      throw new NotFoundException('Role not found');
    }

    return RoleMapper.toResponseDto(updatedRole);
  }

  async getPermissions(clinicId: string, roleId: string) {
    await this.getRoleOrThrow(clinicId, roleId);

    return this.prisma.permission.findMany({
      where: {
        rolePermissions: {
          some: {
            roleId,
          },
        },
      },
      include: {
        permissionGroup: true,
      },
      orderBy: [
        {
          permissionGroup: {
            displayOrder: 'asc',
          },
        },
        {
          code: 'asc',
        },
      ],
    });
  }

  private async getRoleOrThrow(clinicId: string, roleId: string) {
    const role = await this.prisma.role.findFirst({
      where: {
        id: roleId,
        clinicId,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }
}
