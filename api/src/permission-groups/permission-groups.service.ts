import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { PaginationUtil } from '../common/utils/pagination.util';

import { PermissionGroupMapper } from './permission-group.mapper';

import { PermissionGroupQueryDto } from './dto/permission-group-query.dto';
import { PermissionGroupResponseDto } from './dto/permission-group-response.dto';

@Injectable()
export class PermissionGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PermissionGroupQueryDto,
  ): Promise<PaginatedResponseDto<PermissionGroupResponseDto>> {
    const { page, limit, search, sortBy, sortOrder } = query;

    const where: Prisma.PermissionGroupWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          code: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [total, permissionGroups] = await this.prisma.$transaction([
      this.prisma.permissionGroup.count({
        where,
      }),
      this.prisma.permissionGroup.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy ?? 'displayOrder']: sortOrder,
        },
      }),
    ]);

    return PaginationUtil.createResponse(
      PermissionGroupMapper.toResponseDtos(permissionGroups),
      total,
      page,
      limit,
    );
  }

  async findById(id: string): Promise<PermissionGroupResponseDto> {
    const permissionGroup = await this.prisma.permissionGroup.findUnique({
      where: {
        id,
      },
    });

    if (!permissionGroup) {
      throw new NotFoundException('Permission Group not found');
    }

    return PermissionGroupMapper.toResponseDto(permissionGroup);
  }
}
