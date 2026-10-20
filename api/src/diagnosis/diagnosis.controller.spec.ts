import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from './diagnosis.service';

describe('DiagnosisController', () => {
  let controller: DiagnosisController;

  beforeEach(async () => {
    const diagnosisService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiagnosisController],
      providers: [{ provide: DiagnosisService, useValue: diagnosisService }],
    }).compile();
    controller = module.get<DiagnosisController>(DiagnosisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
