import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationCouncilController } from './registration-council.controller';
import { RegistrationCouncilService } from './registration-council.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

describe('RegistrationCouncilController', () => {
  let controller: RegistrationCouncilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationCouncilController],
      providers: [RegistrationCouncilService],
    }).compile();

    controller = module.get<RegistrationCouncilController>(RegistrationCouncilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should apply the permission guard at controller level', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      RegistrationCouncilController,
    ) as unknown[];
    expect(guards).toContain(PermissionsGuard);
  });
});
