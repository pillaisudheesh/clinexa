import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordQueryDto } from './dto/medical-record-query.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  async create(dto: CreateMedicalRecordDto) {
    const patient = await this.prisma.patient.findUnique({
      where: {
        id: dto.patientId,
      },
    });

    if (!patient || !patient.isActive) {
      throw new NotFoundException('Active patient not found');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: {
        id: dto.doctorId,
      },
    });

    if (!doctor || !doctor.isActive) {
      throw new NotFoundException('Active doctor not found');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: {
        id: dto.appointmentId,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.patientId !== dto.patientId) {
      throw new ConflictException(
        'Appointment does not belong to the specified patient',
      );
    }

    if (appointment.doctorId !== dto.doctorId) {
      throw new ConflictException(
        'Appointment does not belong to the specified doctor',
      );
    }

    const existing = await this.prisma.medicalRecord.findUnique({
      where: {
        appointmentId: dto.appointmentId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Medical record already exists for this appointment',
      );
    }

    return this.prisma.medicalRecord.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        appointmentId: dto.appointmentId,

        chiefComplaint: dto.chiefComplaint,
        historyOfPresentIllness: dto.historyOfPresentIllness,
        examinationNotes: dto.examinationNotes,
        assessment: dto.assessment,
        treatmentPlan: dto.treatmentPlan,
        followUpInstructions: dto.followUpInstructions,
      },
    });
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  async findAll(query: MedicalRecordQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      patientId,
      doctorId,
      appointmentId,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
      ...(patientId && {
        patientId,
      }),

      ...(doctorId && {
        doctorId,
      }),

      ...(appointmentId && {
        appointmentId,
      }),

      ...(search && {
        OR: [
          {
            chiefComplaint: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            assessment: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          //   {
          //     diagnosis: {
          //       some: {
          //         description: {
          //           contains: search,
          //           mode: 'insensitive' as const,
          //         },
          //       },
          //     },
          //   },
        ],
      }),
    };

    const [records, total] = await this.prisma.$transaction([
      this.prisma.medicalRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.medicalRecord.count({
        where,
      }),
    ]);

    return {
      data: records,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  async findOne(id: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: {
        id,
      },
      include: {
        diagnoses: true,
        prescriptions: true,
      },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    return record;
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  async update(id: string, dto: UpdateMedicalRecordDto) {
    const existing = await this.prisma.medicalRecord.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Medical record not found');
    }

    return this.prisma.medicalRecord.update({
      where: {
        id,
      },
      data: {
        ...(dto.chiefComplaint !== undefined && {
          chiefComplaint: dto.chiefComplaint,
        }),

        ...(dto.historyOfPresentIllness !== undefined && {
          historyOfPresentIllness: dto.historyOfPresentIllness,
        }),

        ...(dto.examinationNotes !== undefined && {
          examinationNotes: dto.examinationNotes,
        }),

        ...(dto.assessment !== undefined && {
          assessment: dto.assessment,
        }),

        ...(dto.treatmentPlan !== undefined && {
          treatmentPlan: dto.treatmentPlan,
        }),

        ...(dto.followUpInstructions !== undefined && {
          followUpInstructions: dto.followUpInstructions,
        }),
      },
    });
  }
}
