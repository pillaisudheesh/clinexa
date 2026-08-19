import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

import type { PermissionCode } from '../constants/permission-codes';

interface AuthenticatedUser {
  id: string;
  clinicId: string;
}

interface AuthenticatedRequest {
  user?: AuthenticatedUser;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionCode[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    /*
     * No permission requirement on
     * this endpoint.
     */
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    if (!user.id) {
      throw new UnauthorizedException('Invalid authenticated user.');
    }

    if (!user.clinicId) {
      throw new ForbiddenException('User is not associated with a clinic.');
    }

    /*
     * Get all active permissions assigned
     * through the user's active roles.
     */
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId: user.id,

        role: {
          clinicId: user.clinicId,
          isActive: true,
        },
      },

      select: {
        role: {
          select: {
            permissions: {
              select: {
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
    });

    const userPermissionCodes = new Set<PermissionCode>();

    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.permissions) {
        userPermissionCodes.add(
          rolePermission.permission.code as PermissionCode,
        );
      }
    }

    /*
     * A request is allowed when the user has
     * at least one of the required permissions.
     */
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissionCodes.has(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }

    return true;
  }
}
