import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const prisma = {
    user: { findUnique: jest.fn() },
    clinic: { findUnique: jest.fn() },
    role: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
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
});
