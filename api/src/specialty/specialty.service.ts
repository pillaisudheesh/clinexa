import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { SpecialtyQueryDto } from './dto/specialty-query.dto';

@Injectable()
export class SpecialtyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clinicId: string, query: SpecialtyQueryDto) {
    const { page, limit, search, departmentId } = query;

    const where: Prisma.SpecialtyWhereInput = {
      department: {
        clinicId,
      },

      ...(departmentId && {
        departmentId,
      }),

      ...(search && {
        OR: [
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
        ],
      }),
    };

    const [specialties, total] = await this.prisma.$transaction([
      this.prisma.specialty.findMany({
        where,
        orderBy: {
          displayOrder: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.specialty.count({
        where,
      }),
    ]);

    return {
      data: specialties,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(clinicId: string, id: string) {
    return this.prisma.specialty.findFirst({
      where: {
        id,
        department: {
          clinicId,
        },
      },
    });
  }
}
