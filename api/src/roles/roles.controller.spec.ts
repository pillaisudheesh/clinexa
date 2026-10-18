import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let rolesService: { findAll: jest.Mock; assignPermissions: jest.Mock };

  beforeEach(async () => {
    rolesService = { findAll: jest.fn(), assignPermissions: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: {
            ...rolesService,
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateStatus: jest.fn(),
            assignPermissions: rolesService.assignPermissions,
            getPermissions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    rolesService = module.get(RolesService) as unknown as typeof rolesService;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('restricts Clinic Administrators to active roles in their own clinic and excludes Super Administrator', async () => {
    const user = {
      id: 'user-1',
      clinicId: 'clinic-a',
      roles: ['Clinic Administrator'],
      roleCodes: ['CLINIC_ADMIN'],
    } as any;
    const query = { clinicId: 'clinic-b', page: 1, limit: 100 } as any;

    await controller.findAll(user, query);

    expect(rolesService.findAll).toHaveBeenCalledWith('clinic-a', query, true);
  });


  it('passes clinic scope and non-platform status when a Clinic Admin edits system-role permissions', async () => {
    const user = {
      id: 'clinic-admin',
      clinicId: 'clinic-a',
      roles: ['Clinic Administrator'],
      roleCodes: ['CLINIC_ADMIN'],
      isPlatformAdmin: false,
    } as any;
    rolesService.assignPermissions.mockResolvedValue({ id: 'role-nurse' });

    await controller.assignPermissions(user, 'role-nurse', { permissionIds: ['permission-id'] } as any);

    expect(rolesService.assignPermissions).toHaveBeenCalledWith(
      'clinic-a',
      'role-nurse',
      ['permission-id'],
      false,
    );
  });

  it('allows the explicitly designated Platform Admin to edit a role across clinics', async () => {
    const user = {
      id: 'platform-admin',
      clinicId: 'platform-clinic',
      roles: [],
      roleCodes: [],
      isPlatformAdmin: true,
    } as any;
    rolesService.assignPermissions.mockResolvedValue({ id: 'role-in-other-clinic' });

    await controller.assignPermissions(user, 'role-in-other-clinic', { permissionIds: ['permission-id'] } as any);

    expect(rolesService.assignPermissions).toHaveBeenCalledWith(
      null,
      'role-in-other-clinic',
      ['permission-id'],
      true,
    );
  });

  it('allows Super Administrators to request roles for the selected clinic', async () => {
    const user = {
      id: 'user-2',
      clinicId: 'platform-clinic',
      roles: ['Super Administrator'],
      roleCodes: ['SUPER_ADMIN'],
      isPlatformAdmin: true,
    } as any;
    const query = { clinicId: 'clinic-b', page: 1, limit: 100 } as any;

    await controller.findAll(user, query);

    expect(rolesService.findAll).toHaveBeenCalledWith('clinic-b', query, false);
  });
});
