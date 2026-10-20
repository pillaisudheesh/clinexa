import { NotFoundException } from '@nestjs/common';
import { NumberGeneratorService } from './number-generator.service';

describe('NumberGeneratorService', () => {
  const prisma = { clinic: { update: jest.fn() } };
  let service: NumberGeneratorService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NumberGeneratorService(prisma as never);
  });

  it('uses an atomic per-clinic increment and preserves the patient number format', async () => {
    prisma.clinic.update.mockResolvedValue({ code: 'CLN01', patientSequence: 42 });

    await expect(service.generatePatientNumber('clinic-1')).resolves.toBe(
      'CLN01-PAT-000042',
    );
    expect(prisma.clinic.update).toHaveBeenCalledWith({
      where: { id: 'clinic-1' },
      data: { patientSequence: { increment: 1 } },
      select: { code: true, patientSequence: true },
    });
  });

  it('maps a missing clinic to NotFoundException', async () => {
    prisma.clinic.update.mockRejectedValue({ code: 'P2025' });
    await expect(service.generatePatientNumber('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
