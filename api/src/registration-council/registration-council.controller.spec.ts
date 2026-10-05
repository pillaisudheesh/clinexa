import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationCouncilController } from './registration-council.controller';
import { RegistrationCouncilService } from './registration-council.service';

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
});
