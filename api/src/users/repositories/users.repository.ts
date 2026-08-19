import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany();
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  create(data: {
    firstName: string;
    lastName?: string;
    email: string;
    passwordHash: string;
    clinicId: string;
  }) {
    return this.prisma.user.create({
      data,
    });
  }
}
