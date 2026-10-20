import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let queryRaw: jest.Mock;

  beforeEach(async () => {
    queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: { $queryRaw: queryRaw } }],
    }).compile();
    controller = module.get<HealthController>(HealthController);
  });

  it('reports the API and database as up when the database responds', async () => {
    await expect(controller.check()).resolves.toMatchObject({ status: 'UP', database: 'UP' });
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it('reports service unavailable when the database query fails', async () => {
    queryRaw.mockRejectedValueOnce(new Error('database unavailable'));
    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
