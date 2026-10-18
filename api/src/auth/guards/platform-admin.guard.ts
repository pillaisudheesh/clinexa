import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

interface AuthenticatedRequest {
  user?: { id?: string };
}

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isPlatformAdmin: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE' || !user.isPlatformAdmin) {
      throw new ForbiddenException(
        'Platform Administrator access is required.',
      );
    }

    return true;
  }
}
