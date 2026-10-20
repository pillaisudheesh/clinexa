import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NumberGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePatientNumber(clinicId: string): Promise<string> {
    // The increment is atomic at the database level. Unlike count()+1, it
    // remains unique when multiple registrations happen concurrently.
    const clinic = await this.prisma.clinic
      .update({
        where: { id: clinicId },
        data: { patientSequence: { increment: 1 } },
        select: { code: true, patientSequence: true },
      })
      .catch((error: unknown) => {
        // Preserve the service's existing not-found contract without masking
        // unexpected database failures.
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as { code?: string }).code === 'P2025'
        ) {
          throw new NotFoundException('Clinic not found.');
        }
        throw error;
      });

    const sequence = String(clinic.patientSequence).padStart(6, '0');
    return `${clinic.code}-PAT-${sequence}`;
  }
}
