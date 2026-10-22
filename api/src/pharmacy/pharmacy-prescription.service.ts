import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PharmacyPrescriptionQueryDto } from './dto/pharmacy-prescription-query.dto';
import {
  PharmacyDispensingSummaryDto,
  PharmacyPrescriptionDoctorDto,
  PharmacyPrescriptionPatientDto,
  PharmacyPrescriptionResponseDto,
} from './dto/pharmacy-prescription-response.dto';

@Injectable()
export class PharmacyPrescriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    clinicId: string,
    query: PharmacyPrescriptionQueryDto,
  ): Promise<PaginatedResponseDto<PharmacyPrescriptionResponseDto>> {
    const { page = 1, limit = 10, search, status, patientId } = query;

    const skip = (page - 1) * limit;
    const trimmedSearch = search?.trim();

    const where: Prisma.PrescriptionWhereInput = {
      medicalRecord: {
        patient: {
          clinicId,
          ...(patientId ? { id: patientId } : {}),
        },
      },

      ...(status === 'PENDING' ? { dispensing: { is: null } } : {}),
      ...(status === 'PARTIALLY_DISPENSED'
        ? { dispensing: { is: { status: 'PARTIALLY_DISPENSED' } } }
        : {}),
      ...(status === 'DISPENSED'
        ? { dispensing: { is: { status: 'COMPLETED' } } }
        : {}),
      ...(status === 'CANCELLED'
        ? { dispensing: { is: { status: 'CANCELLED' } } }
        : {}),

      ...(trimmedSearch && {
        OR: [
          {
            medicationName: {
              contains: trimmedSearch,
              mode: 'insensitive',
            },
          },
          {
            dosage: {
              contains: trimmedSearch,
              mode: 'insensitive',
            },
          },
          {
            instructions: {
              contains: trimmedSearch,
              mode: 'insensitive',
            },
          },
          {
            medicine: {
              name: {
                contains: trimmedSearch,
                mode: 'insensitive',
              },
            },
          },
          {
            medicalRecord: {
              patient: {
                OR: [
                  {
                    firstName: { contains: trimmedSearch, mode: 'insensitive' },
                  },
                  {
                    lastName: { contains: trimmedSearch, mode: 'insensitive' },
                  },
                  {
                    patientNumber: {
                      contains: trimmedSearch,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          },
          {
            medicalRecord: {
              doctor: {
                OR: [
                  {
                    firstName: { contains: trimmedSearch, mode: 'insensitive' },
                  },
                  {
                    lastName: { contains: trimmedSearch, mode: 'insensitive' },
                  },
                  {
                    doctorNumber: {
                      contains: trimmedSearch,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          },
        ],
      }),
    };

    const [prescriptions, total] = await this.prisma.$transaction([
      this.prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          medicine: true,
          medicalRecord: {
            include: {
              patient: true,
              doctor: true,
            },
          },
          dispensing: {
            select: { id: true, status: true },
          },
        },
      }),
      this.prisma.prescription.count({ where }),
    ]);

    return {
      data: prescriptions.map((prescription) =>
        this.mapPrescription(prescription),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private mapPrescription(
    prescription: Prisma.PrescriptionGetPayload<{
      include: {
        medicine: true;
        medicalRecord: {
          include: {
            patient: true;
            doctor: true;
          };
        };
        dispensing: {
          select: {
            id: true;
            status: true;
          };
        };
      };
    }>,
  ): PharmacyPrescriptionResponseDto {
    const patient: PharmacyPrescriptionPatientDto = {
      id: prescription.medicalRecord.patient.id,
      patientNumber: prescription.medicalRecord.patient.patientNumber,
      firstName: prescription.medicalRecord.patient.firstName,
      lastName: prescription.medicalRecord.patient.lastName,
    };

    const doctor: PharmacyPrescriptionDoctorDto = {
      id: prescription.medicalRecord.doctor.id,
      doctorNumber: prescription.medicalRecord.doctor.doctorNumber,
      title: prescription.medicalRecord.doctor.title,
      firstName: prescription.medicalRecord.doctor.firstName,
      lastName: prescription.medicalRecord.doctor.lastName,
    };

    const dispensing: PharmacyDispensingSummaryDto | null =
      prescription.dispensing
        ? {
            id: prescription.dispensing.id,
            status: prescription.dispensing.status,
          }
        : null;

    return {
      id: prescription.id,
      prescriptionNumber: prescription.prescriptionNumber,
      medicalRecordId: prescription.medicalRecordId,
      medicineId: prescription.medicineId,
      medicationName: prescription.medicationName,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      route: prescription.route,
      duration: prescription.duration,
      quantity: prescription.quantity,
      instructions: prescription.instructions,
      createdAt: prescription.createdAt,
      patient,
      doctor,
      dispensing,
    };
  }
}
