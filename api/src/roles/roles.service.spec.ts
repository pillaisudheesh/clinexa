import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;
  let prisma: {
    role: { findFirst: jest.Mock; findUnique: jest.Mock };
    permission: { findMany: jest.Mock };
    $transaction: jest.Mock;
  };
  let tx: { rolePermission: { deleteMany: jest.Mock; createMany: jest.Mock } };

  const systemRole = {
    id: 'role-system',
    clinicId: 'clinic-a',
    code: 'NURSE',
    name: 'Nurse',
    description: null,
    displayOrder: 20,
    isSystem: true,
    isActive: true,
  };

  beforeEach(async () => {
    tx = {
      rolePermission: { deleteMany: jest.fn(), createMany: jest.fn() },
    };
    prisma = {
      role: { findFirst: jest.fn(), findUnique: jest.fn() },
      permission: { findMany: jest.fn() },
      $transaction: jest.fn(async (arg: any) =>
        typeof arg === 'function' ? arg(tx) : Promise.all(arg),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('scopes role lookup to the authenticated clinic', async () => {
    prisma.role.findFirst.mockResolvedValue(null);

    await expect(service.findById('clinic-a', 'role-id')).rejects.toThrow(
      'Role not found',
    );
    expect(prisma.role.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'role-id', clinicId: 'clinic-a' },
      }),
    );
  });

  it('allows a Clinic Admin to update permissions on a system role in their own clinic', async () => {
    prisma.role.findFirst.mockResolvedValue(systemRole);
    prisma.permission.findMany.mockResolvedValue([{ id: 'permission-patient-read', code: 'PATIENT_READ' }]);
    prisma.role.findUnique.mockResolvedValue({
      ...systemRole,
      clinic: { id: 'clinic-a', code: 'CLINIC_A', name: 'Clinic A' },
      _count: { permissions: 1, users: 2 },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    const result = await service.assignPermissions(
      'clinic-a',
      'role-system',
      ['permission-patient-read'],
      false,
    );

    expect(result.id).toBe('role-system');
    expect(prisma.role.findFirst).toHaveBeenCalledWith({
      where: { id: 'role-system', clinicId: 'clinic-a' },
    });
    expect(tx.rolePermission.deleteMany).toHaveBeenCalledWith({ where: { roleId: 'role-system' } });
    expect(tx.rolePermission.createMany).toHaveBeenCalledWith({
      data: [{ roleId: 'role-system', permissionId: 'permission-patient-read' }],
    });
  });

  it.each(['CLINIC_READ', 'CLINIC_CREATE', 'CLINIC_UPDATE', 'CLINIC_DELETE'])(
    'does not allow a Clinic Admin to grant platform-level %s to a clinic role', async (code) => {
      prisma.role.findFirst.mockResolvedValue(systemRole);
      prisma.permission.findMany.mockResolvedValue([{ id: `permission-${code.toLowerCase()}`, code }]);

      await expect(
        service.assignPermissions('clinic-a', 'role-system', [`permission-${code.toLowerCase()}`], false),
      ).rejects.toThrow('Clinic roles cannot be assigned platform-level clinic permissions');
      expect(tx.rolePermission.deleteMany).not.toHaveBeenCalled();
    },
  );

  it('rejects role IDs that belong to another clinic', async () => {
    prisma.role.findFirst.mockResolvedValue(null);

    await expect(
      service.assignPermissions('clinic-a', 'role-from-clinic-b', ['permission-patient-read'], false),
    ).rejects.toThrow('Role not found');
    expect(prisma.permission.findMany).not.toHaveBeenCalled();
  });
});
