import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const prisma = {
    user: { findUnique: jest.fn(), findUniqueOrThrow: jest.fn(), updateMany: jest.fn() },
    clinic: { findUnique: jest.fn() },
    role: { findMany: jest.fn() },
    $transaction: jest.fn(async (callback: any) => callback(prisma)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: AuditService,
          useValue: {
            createInTransaction: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('prevents Clinic Administrators from assigning the Super Administrator role', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.clinic.findUnique.mockResolvedValue({ id: 'clinic-a' });
    prisma.role.findMany.mockResolvedValue([
      { id: 'role-super', code: 'SUPER_ADMIN', clinicId: 'clinic-a' },
    ]);

    await expect(
      service.create(
        {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'ValidPassword123!',
          clinicId: 'clinic-a',
          roleIds: ['role-super'],
        } as any,
        {
          id: 'admin-1',
          clinicId: 'clinic-a',
          roles: ['Clinic Administrator'],
          roleCodes: ['CLINIC_ADMIN'],
        } as any,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not grant cross-clinic access from a Super Administrator role label alone', async () => {
    await expect(
      service.create(
        {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'ValidPassword123!',
          clinicId: 'clinic-b',
          roleIds: [],
        } as any,
        {
          id: 'clinic-admin-1',
          clinicId: 'clinic-a',
          roles: ['Super Administrator'],
          roleCodes: ['SUPER_ADMIN'],
          isPlatformAdmin: false,
        } as any,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.clinic.findUnique).not.toHaveBeenCalled();
  });


  it('rechecks clinic ownership inside the transaction before updating a user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      clinicId: 'clinic-a',
      firstName: 'Existing',
      lastName: 'User',
      email: 'user@example.com',
      status: 'ACTIVE',
      roles: [],
    });
    prisma.user.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.update(
        'user-1',
        { firstName: 'Changed' } as any,
        { id: 'clinic-admin-1', clinicId: 'clinic-a', isPlatformAdmin: false } as any,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'user-1', clinicId: 'clinic-a' },
      data: {
        firstName: 'Changed',
        lastName: undefined,
        email: undefined,
        clinicId: undefined,
      },
    });
    expect(prisma.user.findUniqueOrThrow).not.toHaveBeenCalled();
  });

  it('allows cross-clinic authority only when isPlatformAdmin is true', async () => {
    // The request passes the authority check and proceeds to the clinic lookup.
    prisma.clinic.findUnique.mockResolvedValue(null);
    await expect(
      service.create(
        {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'ValidPassword123!',
          clinicId: 'clinic-b',
          roleIds: [],
        } as any,
        {
          id: 'platform-admin-1',
          clinicId: 'clinic-a',
          roles: [],
          roleCodes: [],
          isPlatformAdmin: true,
        } as any,
      ),
    ).rejects.toThrow('Clinic not found.');
    expect(prisma.clinic.findUnique).toHaveBeenCalledWith({
      where: { id: 'clinic-b' },
    });
  });
});
