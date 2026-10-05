import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationCouncilService } from './registration-council.service';

describe('RegistrationCouncilService', () => {
  let service: RegistrationCouncilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrationCouncilService],
    }).compile();

    service = module.get<RegistrationCouncilService>(RegistrationCouncilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
