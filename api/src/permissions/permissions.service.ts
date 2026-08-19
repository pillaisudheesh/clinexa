import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationUtil } from '../common/utils/pagination.util';

import { PermissionMapper } from './permission.mapper';
import { PermissionQueryDto } from './dto/permission-query.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { PermissionSortField } from './enums/permission-sort-field.enum';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PermissionQueryDto,
  ): Promise<PaginatedResponseDto<PermissionResponseDto>> {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      permissionGroupId,
      permissionGroupCode,
    } = query;

    const where: Prisma.PermissionWhereInput = {};

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

    if (permissionGroupId) {
      where.permissionGroupId = permissionGroupId;
    }

    if (permissionGroupCode) {
      where.permissionGroup = {
        code: permissionGroupCode,
      };
    }

    const [total, permissions] = await this.prisma.$transaction([
      this.prisma.permission.count({
        where,
      }),

      this.prisma.permission.findMany({
        where,

        include: {
          permissionGroup: true,
        },

        skip: (page - 1) * limit,

        take: limit,

        orderBy: {
          [sortBy ?? PermissionSortField.NAME]: sortOrder,
        },
      }),
    ]);

    return PaginationUtil.createResponse(
      PermissionMapper.toResponseDtos(permissions),
      total,
      page,
      limit,
    );
  }

  async findById(id: string): Promise<PermissionResponseDto> {
    const permission = await this.prisma.permission.findUnique({
      where: {
        id,
      },

      include: {
        permissionGroup: true,
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return PermissionMapper.toResponseDto(permission);
  }
}
