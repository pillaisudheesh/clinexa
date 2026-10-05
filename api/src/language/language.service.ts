import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { LanguageQueryDto } from './dto/language-query.dto';

@Injectable()
export class LanguageService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: LanguageQueryDto) {
    const { page, limit, search } = query;

    const where: Prisma.LanguageWhereInput = {
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

    const [languages, total] = await this.prisma.$transaction([
      this.prisma.language.findMany({
        where,
        orderBy: {
          displayOrder: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.language.count({
        where,
      }),
    ]);

    return {
      data: languages,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return this.prisma.language.findUnique({
      where: {
        id,
      },
    });
  }
}
