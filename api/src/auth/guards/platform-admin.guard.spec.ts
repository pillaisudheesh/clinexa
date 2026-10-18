import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PlatformAdminGuard } from './platform-admin.guard';

describe('PlatformAdminGuard', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
  };
  let guard: PlatformAdminGuard;

  const contextFor = (user?: { id?: string }): ExecutionContext => ({
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new PlatformAdminGuard(prisma as never);
  });

  it('rejects requests without an authenticated user', async () => {
    await expect(guard.canActivate(contextFor())).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a clinic administrator even if their clinic role is named Super Admin', async () => {
    prisma.user.findUnique.mockResolvedValue({ isPlatformAdmin: false, status: 'ACTIVE' });
    await expect(guard.canActivate(contextFor({ id: 'clinic-admin-id' }))).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'clinic-admin-id' },
      select: { isPlatformAdmin: true, status: true },
    });
  });

  it('rejects inactive platform administrator accounts', async () => {
    prisma.user.findUnique.mockResolvedValue({ isPlatformAdmin: true, status: 'INACTIVE' });
    await expect(guard.canActivate(contextFor({ id: 'platform-admin-id' }))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows an active platform administrator', async () => {
    prisma.user.findUnique.mockResolvedValue({ isPlatformAdmin: true, status: 'ACTIVE' });
    await expect(guard.canActivate(contextFor({ id: 'platform-admin-id' }))).resolves.toBe(true);
  });
});
