import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPermissions(userId: string): Promise<Set<string>> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: {
                      select: {
                        code: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return new Set();
    }

    const permissions = new Set<string>();

    for (const userRole of user.roles) {
      if (!userRole.role.isActive) {
        continue;
      }

      for (const rolePermission of userRole.role.permissions) {
        permissions.add(rolePermission.permission.code);
      }
    }

    return permissions;
  }
}
