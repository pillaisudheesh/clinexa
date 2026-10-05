import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { RegistrationCouncilQueryDto } from './dto/registration-council-query.dto';

@Injectable()
export class RegistrationCouncilService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: RegistrationCouncilQueryDto) {
    const { page, limit, search } = query;

    const where: Prisma.RegistrationCouncilWhereInput = {
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

    const [councils, total] = await this.prisma.$transaction([
      this.prisma.registrationCouncil.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.registrationCouncil.count({
        where,
      }),
    ]);

    return {
      data: councils,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return this.prisma.registrationCouncil.findUnique({
      where: {
        id,
      },
    });
  }
}
