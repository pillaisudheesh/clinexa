import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { QualificationQueryDto } from './dto/qualification-query.dto';

@Injectable()
export class QualificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QualificationQueryDto) {
    const { page, limit, search } = query;

    const where: Prisma.QualificationWhereInput = {
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

    const [qualifications, total] = await this.prisma.$transaction([
      this.prisma.qualification.findMany({
        where,
        orderBy: {
          displayOrder: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.qualification.count({
        where,
      }),
    ]);

    return {
      data: qualifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return this.prisma.qualification.findUnique({
      where: {
        id,
      },
    });
  }
}
