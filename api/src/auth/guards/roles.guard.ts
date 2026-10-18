import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() decorator → allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Platform-wide authorization is independent of clinic role names.
    // A database-verified platform administrator may access platform-level
    // endpoints even if they do not also hold a clinic SUPER_ADMIN role.
    if (request.user.isPlatformAdmin === true) {
      return true;
    }

    const assignedRoles = request.user.roles ?? [];
    const assignedRoleCodes = request.user.roleCodes ?? [];

    // Role names are user-facing labels (for example, "Super Administrator"),
    // while route decorators use stable role codes (for example, "SUPER_ADMIN").
    // Normalize both forms and explicitly support legacy display names so that
    // role-protected endpoints work with existing users and newly seeded roles.
    const normalizeRole = (value: string) =>
      value.trim().toUpperCase().replace(/[\s-]+/g, '_');

    const roleAliases: Record<string, string[]> = {
      SUPER_ADMIN: ['SUPER_ADMINISTRATOR'],
      CLINIC_ADMIN: ['CLINIC_ADMINISTRATOR'],
    };

    const assignedRoleValues = [...assignedRoles, ...assignedRoleCodes].map(
      normalizeRole,
    );

    const hasRole = requiredRoles.some((requiredRole) => {
      const normalizedRequiredRole = normalizeRole(requiredRole);
      const acceptedValues = [
        normalizedRequiredRole,
        ...(roleAliases[normalizedRequiredRole] ?? []),
      ];

      return acceptedValues.some((role) => assignedRoleValues.includes(role));
    });

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }
}
