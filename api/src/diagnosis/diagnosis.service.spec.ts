import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiagnosisService } from './diagnosis.service';

describe('DiagnosisService tenant isolation', () => {
  let service: DiagnosisService;
  let prisma: {
    medicalRecord: { findFirst: jest.Mock };
    diagnosis: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      medicalRecord: { findFirst: jest.fn() },
      diagnosis: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(async (arg: any) =>
        typeof arg === 'function' ? arg(prisma) : Promise.all(arg),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiagnosisService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<DiagnosisService>(DiagnosisService);
  });

  it('scopes diagnosis lookup through the medical record to the clinic', async () => {
    prisma.diagnosis.findFirst.mockResolvedValue(null);

    await expect(service.findOne('clinic-a', 'diagnosis-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.diagnosis.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'diagnosis-id',
          medicalRecord: {
            patient: { clinicId: 'clinic-a' },
            doctor: { clinicId: 'clinic-a' },
            appointment: { clinicId: 'clinic-a' },
          },
        },
      }),
    );
  });

  it('does not create a diagnosis when the medical record is outside the clinic', async () => {
    prisma.medicalRecord.findFirst.mockResolvedValue(null);

    await expect(
      service.create('clinic-a', {
        medicalRecordId: 'record-from-clinic-b',
        name: 'Example diagnosis',
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.diagnosis.create).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rechecks clinic ownership before updating a diagnosis', async () => {
    prisma.diagnosis.findFirst
      .mockResolvedValueOnce({ id: 'diagnosis-id', medicalRecordId: 'record-id' })
      .mockResolvedValueOnce(null);

    await expect(
      service.update('clinic-a', 'diagnosis-id', { name: 'Changed' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.diagnosis.update).not.toHaveBeenCalled();
  });
});
