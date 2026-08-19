import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NumberGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePatientNumber(clinicId: string): Promise<string> {
    const clinic = await this.prisma.clinic.findUnique({
      where: {
        id: clinicId,
      },
      select: {
        code: true,
      },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found.');
    }

    const count = await this.prisma.patient.count({
      where: {
        clinicId,
      },
    });

    const sequence = String(count + 1).padStart(6, '0');

    return `${clinic.code}-PAT-${sequence}`;
  }
}
