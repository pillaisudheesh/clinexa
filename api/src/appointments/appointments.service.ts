import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  AppointmentPriority,
  AppointmentStatus,
  AppointmentType,
  InvoiceStatus,
  Prisma,
  MedicalRecord,
  LabOrderItemStatus,
  LabOrderStatus,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { AppointmentAvailabilityQueryDto } from './dto/appointment-availability-query.dto';
import { SortOrder } from '../common/dto/pagination-query.dto';
import { MedicalRecordResponseDto } from '../medical-records/dto/medical-record-response.dto';
import { ConsultationSummaryResponseDto } from './dto/consultation-summary-response.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { DiagnosisResponseDto } from '../diagnosis/dto/diagnosis-response.dto';
import { PrescriptionResponseDto } from '../prescriptions/dto/prescription-response.dto';
import { LabOrderResponseDto } from '../lab-orders/dto/lab-order-response.dto';
import { LabResultResponseDto } from '../lab-orders/dto/lab-order-response.dto';
import { InvoiceResponseDto } from '../invoices/dto/invoice-response.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new appointment.
   */
  async create(clinicId: string, dto: CreateAppointmentDto) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id: dto.patientId,
        clinicId,
        isActive: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Active patient not found');
    }

    const doctor = await this.prisma.doctor.findFirst({
      where: {
        id: dto.doctorId,
        clinicId,
        isActive: true,
      },
      include: {
        consultationFee: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Active doctor not found');
    }

    this.validateAppointmentTime(dto.startTime, dto.endTime);

    const appointmentDate = this.parseDate(dto.appointmentDate);

    this.validateNotInPast(appointmentDate, dto.startTime);

    const schedule = await this.prisma.doctorSchedule.findUnique({
      where: {
        doctorId: doctor.id,
      },
      include: {
        slots: true,
      },
    });

    if (!schedule) {
      throw new BadRequestException(
        'Doctor does not have a schedule configured',
      );
    }

    const dayOfWeek = appointmentDate.getDay();

    const scheduleSlot = schedule.slots.find(
      (slot) =>
        slot.dayOfWeek === dayOfWeek &&
        slot.isAvailable &&
        this.isTimeWithinSchedule(
          dto.startTime,
          dto.endTime,
          slot.startTime,
          slot.endTime,
        ),
    );

    if (!scheduleSlot) {
      throw new BadRequestException(
        'Selected time is outside the doctor schedule',
      );
    }

    this.validateSlotDuration(
      dto.startTime,
      dto.endTime,
      schedule.slotDuration,
    );

    const conflictingAppointment = await this.findConflictingAppointment(
      doctor.id,
      appointmentDate,
      dto.startTime,
      dto.endTime,
    );

    if (conflictingAppointment) {
      throw new ConflictException(
        'Doctor is already booked for the selected time',
      );
    }

    const appointmentNumber = await this.generateAppointmentNumber(clinicId);

    const consultationFee = this.getConsultationFee(
      doctor.consultationFee,
      dto.type,
    );

    const appointment = await this.prisma.appointment.create({
      data: {
        clinicId,
        appointmentNumber,

        patientId: patient.id,
        doctorId: doctor.id,

        appointmentDate,

        startTime: dto.startTime,
        endTime: dto.endTime,

        type: dto.type ?? AppointmentType.NEW_CONSULTATION,

        status: AppointmentStatus.SCHEDULED,

        priority: dto.priority ?? AppointmentPriority.ROUTINE,

        reason: dto.reason,
        notes: dto.notes,

        consultationFee,
      },

      include: this.appointmentInclude(),
    });

    return this.toResponse(appointment);
  }

  /**
   * Get paginated appointments.
   */
  async findAll(clinicId: string, query: AppointmentQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder = SortOrder.ASC,
      patientId,
      doctorId,
      status,
      type,
      appointmentDate,
      fromDate,
      toDate,
    } = query;

    const where: Prisma.AppointmentWhereInput = {
      clinicId,

      ...(patientId && {
        patientId,
      }),

      ...(doctorId && {
        doctorId,
      }),

      ...(status && {
        status,
      }),

      ...(type && {
        type,
      }),
    };

    if (appointmentDate) {
      const date = this.parseDate(appointmentDate);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      where.appointmentDate = {
        gte: date,
        lt: nextDate,
      };
    } else if (fromDate || toDate) {
      const dateFilter: Prisma.DateTimeFilter = {};

      if (fromDate) {
        dateFilter.gte = this.parseDate(fromDate);
      }

      if (toDate) {
        const endDate = this.parseDate(toDate);
        endDate.setDate(endDate.getDate() + 1);
        dateFilter.lt = endDate;
      }

      where.appointmentDate = dateFilter;
    }

    if (search?.trim()) {
      const searchValue = search.trim();

      where.OR = [
        {
          appointmentNumber: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
        {
          patient: {
            OR: [
              {
                firstName: {
                  contains: searchValue,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: searchValue,
                  mode: 'insensitive',
                },
              },
              {
                patientNumber: {
                  contains: searchValue,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
        {
          doctor: {
            OR: [
              {
                firstName: {
                  contains: searchValue,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: searchValue,
                  mode: 'insensitive',
                },
              },
              {
                doctorNumber: {
                  contains: searchValue,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      ];
    }

    const allowedSortFields = new Set([
      'appointmentDate',
      'appointmentNumber',
      'startTime',
      'status',
      'type',
      'createdAt',
    ]);

    const safeSortBy =
      sortBy && allowedSortFields.has(sortBy) ? sortBy : 'appointmentDate';

    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          [safeSortBy]: sortOrder === SortOrder.DESC ? 'desc' : 'asc',
        },

        include: this.appointmentInclude(),
      }),

      this.prisma.appointment.count({
        where,
      }),
    ]);

    return {
      items: items.map((item) => this.toResponse(item)),

      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single appointment.
   */
  async findOne(clinicId: string, id: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id,
        clinicId,
      },

      include: this.appointmentInclude(),
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.toResponse(appointment);
  }

  /**
   * Update an appointment.
   */
  async update(clinicId: string, id: string, dto: UpdateAppointmentDto) {
    const existing = await this.prisma.appointment.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    this.validateStatusForUpdate(existing.status);

    const appointmentDate = dto.appointmentDate
      ? this.parseDate(dto.appointmentDate)
      : existing.appointmentDate;

    const startTime = dto.startTime ?? existing.startTime;

    const endTime = dto.endTime ?? existing.endTime;

    this.validateAppointmentTime(startTime, endTime);

    if (dto.appointmentDate || dto.startTime || dto.endTime) {
      this.validateNotInPast(appointmentDate, startTime);

      const doctor = await this.prisma.doctor.findFirst({
        where: {
          id: existing.doctorId,
          clinicId,
          isActive: true,
        },
      });

      if (!doctor) {
        throw new NotFoundException('Active doctor not found');
      }

      const schedule = await this.prisma.doctorSchedule.findUnique({
        where: {
          doctorId: doctor.id,
        },
        include: {
          slots: true,
        },
      });

      if (!schedule) {
        throw new BadRequestException(
          'Doctor does not have a schedule configured',
        );
      }

      const dayOfWeek = appointmentDate.getDay();

      const scheduleSlot = schedule.slots.find(
        (slot) =>
          slot.dayOfWeek === dayOfWeek &&
          slot.isAvailable &&
          this.isTimeWithinSchedule(
            startTime,
            endTime,
            slot.startTime,
            slot.endTime,
          ),
      );

      if (!scheduleSlot) {
        throw new BadRequestException(
          'Selected time is outside the doctor schedule',
        );
      }

      this.validateSlotDuration(startTime, endTime, schedule.slotDuration);

      const conflict = await this.findConflictingAppointment(
        existing.doctorId,
        appointmentDate,
        startTime,
        endTime,
        existing.id,
      );

      if (conflict) {
        throw new ConflictException(
          'Doctor is already booked for the selected time',
        );
      }
    }

    let cancellationReason = existing.cancellationReason;

    if (
      dto.status === AppointmentStatus.CANCELLED &&
      existing.status !== AppointmentStatus.CANCELLED
    ) {
      cancellationReason = dto.notes ?? existing.cancellationReason;
    }

    const updated = await this.prisma.appointment.update({
      where: {
        id: existing.id,
      },

      data: {
        appointmentDate,
        startTime,
        endTime,

        ...(dto.type !== undefined && {
          type: dto.type,
        }),

        ...(dto.priority !== undefined && {
          priority: dto.priority,
        }),

        ...(dto.status !== undefined && {
          status: dto.status,
        }),

        ...(dto.reason !== undefined && {
          reason: dto.reason,
        }),

        ...(dto.notes !== undefined && {
          notes: dto.notes,
        }),

        cancellationReason,
      },

      include: this.appointmentInclude(),
    });

    return this.toResponse(updated);
  }

  /**
   * Cancel appointment.
   */
  async cancel(clinicId: string, id: string, reason?: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.NO_SHOW
    ) {
      throw new BadRequestException(
        `Appointment cannot be cancelled when status is ${appointment.status}`,
      );
    }

    const updated = await this.prisma.appointment.update({
      where: {
        id: appointment.id,
      },

      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: reason,
      },

      include: this.appointmentInclude(),
    });

    return this.toResponse(updated);
  }

  /**
   * Return available slots for a doctor on a date.
   */
  async getAvailability(
    clinicId: string,
    query: AppointmentAvailabilityQueryDto,
  ) {
    const doctor = await this.prisma.doctor.findFirst({
      where: {
        id: query.doctorId,
        clinicId,
        isActive: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Active doctor not found');
    }

    const date = this.parseDate(query.date);

    const schedule = await this.prisma.doctorSchedule.findUnique({
      where: {
        doctorId: doctor.id,
      },
      include: {
        slots: {
          where: {
            isAvailable: true,
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    if (!schedule) {
      throw new BadRequestException(
        'Doctor does not have a schedule configured',
      );
    }

    const dayOfWeek = date.getDay();

    const workingSlots = schedule.slots.filter(
      (slot) => slot.dayOfWeek === dayOfWeek,
    );

    if (workingSlots.length === 0) {
      return {
        doctorId: doctor.id,
        date: query.date,
        slotDuration: schedule.slotDuration,
        bufferTime: schedule.bufferTime,
        slots: [],
      };
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        clinicId,
        doctorId: doctor.id,

        appointmentDate: {
          gte: date,
          lt: this.nextDate(date),
        },

        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
      },

      select: {
        startTime: true,
        endTime: true,
      },
    });

    const slots: {
      startTime: string;
      endTime: string;
      available: boolean;
    }[] = [];

    for (const workingSlot of workingSlots) {
      const generated = this.generateTimeSlots(
        workingSlot.startTime,
        workingSlot.endTime,
        schedule.slotDuration,
        schedule.bufferTime,
      );

      for (const slot of generated) {
        const isBooked = appointments.some((appointment) =>
          this.timesOverlap(
            slot.startTime,
            slot.endTime,
            appointment.startTime,
            appointment.endTime,
          ),
        );

        slots.push({
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: !isBooked,
        });
      }
    }

    return {
      doctorId: doctor.id,
      date: query.date,
      slotDuration: schedule.slotDuration,
      bufferTime: schedule.bufferTime,
      slots,
    };
  }

  /**
   * Confirm appointment.
   */
  async confirm(clinicId: string, id: string) {
    return this.changeStatus(clinicId, id, AppointmentStatus.CONFIRMED);
  }

  /**
   * Check patient in.
   */
  async checkIn(clinicId: string, id: string) {
    return this.changeStatus(clinicId, id, AppointmentStatus.CHECKED_IN);
  }

  /**
   * Start consultation.
   */
  async startConsultation(clinicId: string, id: string) {
    return this.changeStatus(clinicId, id, AppointmentStatus.IN_CONSULTATION);
  }

  /**
   * Complete appointment.
   */
  /**
   * Complete consultation.
   *
   * A medical record must exist before an appointment
   * can be marked as completed.
   */
  async complete(clinicId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findFirst({
        where: {
          id,
          clinicId,
        },
        select: {
          id: true,
          clinicId: true,
          patientId: true,
          doctorId: true,
          status: true,
          consultationFee: true,
        },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      // Validate appointment lifecycle
      this.validateStatusTransition(
        appointment.status,
        AppointmentStatus.COMPLETED,
      );

      // A consultation must have a medical record
      // before it can be completed.
      const medicalRecord = await tx.medicalRecord.findUnique({
        where: {
          appointmentId: appointment.id,
        },
        select: {
          id: true,
        },
      });

      if (!medicalRecord) {
        throw new BadRequestException(
          'Medical record is required before completing the appointment',
        );
      }

      // Prevent duplicate invoices.
      const existingInvoice = await tx.invoice.findUnique({
        where: {
          appointmentId: appointment.id,
        },
        select: {
          id: true,
        },
      });

      if (existingInvoice) {
        throw new ConflictException(
          'An invoice already exists for this appointment',
        );
      }

      if (!appointment.consultationFee) {
        throw new BadRequestException(
          'Consultation fee is not configured for this appointment',
        );
      }

      const consultationFee = appointment.consultationFee;

      const invoiceNumber = await this.generateInvoiceNumber(tx, clinicId);

      // Create draft invoice
      await tx.invoice.create({
        data: {
          invoiceNumber,
          clinicId: appointment.clinicId,
          patientId: appointment.patientId,
          appointmentId: appointment.id,

          status: InvoiceStatus.DRAFT,

          subtotal: consultationFee,
          discount: new Prisma.Decimal('0.00'),
          tax: new Prisma.Decimal('0.00'),
          total: consultationFee,

          amountPaid: new Prisma.Decimal('0.00'),
          balanceDue: consultationFee,

          items: {
            create: {
              description: 'Consultation',
              quantity: new Prisma.Decimal('1.00'),
              unitPrice: consultationFee,
              amount: consultationFee,
            },
          },
        },
      });

      // Complete appointment
      const updatedAppointment = await tx.appointment.update({
        where: {
          id: appointment.id,
        },
        data: {
          status: AppointmentStatus.COMPLETED,
        },
        include: this.appointmentInclude(),
      });

      return this.toResponse(updatedAppointment);
    });
  }

  /**
   * Mark appointment as no-show.
   */
  async markNoShow(clinicId: string, id: string) {
    return this.changeStatus(clinicId, id, AppointmentStatus.NO_SHOW);
  }

  async getConsultation(
    clinicId: string,
    appointmentId: string,
  ): Promise<ConsultationSummaryResponseDto> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        clinicId,
      },

      include: {
        patient: true,

        doctor: true,

        medicalRecord: {
          include: {
            diagnoses: true,

            prescriptions: {
              include: {
                medicine: true,
              },
            },
          },
        },

        labOrders: {
          include: {
            labOrderItems: {
              include: {
                labTest: true,
                result: true,
              },
            },
          },
        },

        invoice: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return {
      appointment: this.mapAppointment(appointment),

      medicalRecord: appointment.medicalRecord
        ? this.mapMedicalRecord(appointment.medicalRecord)
        : null,

      diagnoses:
        appointment.medicalRecord?.diagnoses.map((diagnosis) =>
          this.mapDiagnosis(diagnosis),
        ) ?? [],

      prescriptions:
        appointment.medicalRecord?.prescriptions.map((prescription) =>
          this.mapPrescription(prescription),
        ) ?? [],

      labOrders: appointment.labOrders.map((labOrder) =>
        this.mapLabOrder(labOrder),
      ),

      invoice: appointment.invoice
        ? this.mapInvoice(appointment.invoice)
        : null,
    };
  }

  private mapInvoice(invoice: {
    id: string;
    invoiceNumber: string;
    clinicId: string;
    patientId: string;
    appointmentId: string;
    status: InvoiceStatus;

    subtotal: Prisma.Decimal;
    discount: Prisma.Decimal;
    tax: Prisma.Decimal;
    total: Prisma.Decimal;
    amountPaid: Prisma.Decimal;
    balanceDue: Prisma.Decimal;

    notes: string | null;
    issuedAt: Date | null;
    dueAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

    items: {
      id: string;
      invoiceId: string;
      description: string;
      quantity: Prisma.Decimal;
      unitPrice: Prisma.Decimal;
      amount: Prisma.Decimal;
      createdAt: Date;
    }[];
  }): InvoiceResponseDto {
    return {
      id: invoice.id,

      invoiceNumber: invoice.invoiceNumber,

      clinicId: invoice.clinicId,

      patientId: invoice.patientId,

      appointmentId: invoice.appointmentId,

      status: invoice.status,

      subtotal: Number(invoice.subtotal),

      discount: Number(invoice.discount),

      tax: Number(invoice.tax),

      total: Number(invoice.total),

      amountPaid: Number(invoice.amountPaid),

      balanceDue: Number(invoice.balanceDue),

      notes: invoice.notes,

      issuedAt: invoice.issuedAt,

      dueAt: invoice.dueAt,

      createdAt: invoice.createdAt,

      updatedAt: invoice.updatedAt,

      items: invoice.items.map((item) => ({
        id: item.id,

        invoiceId: item.invoiceId,

        description: item.description,

        quantity: Number(item.quantity),

        unitPrice: Number(item.unitPrice),

        amount: Number(item.amount),

        createdAt: item.createdAt,
      })),
    };
  }

  private mapLabResult(result: {
    id: string;
    labOrderItemId: string;
    result: string;
    notes: string | null;
    performedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): LabResultResponseDto {
    return {
      id: result.id,
      labOrderItemId: result.labOrderItemId,
      result: result.result,
      notes: result.notes,
      performedAt: result.performedAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  private mapLabOrder(labOrder: {
    id: string;
    clinicId: string;
    patientId: string;
    doctorId: string;
    appointmentId: string;
    status: LabOrderStatus;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;

    labOrderItems: {
      id: string;
      labOrderId: string;
      labTestId: string;
      price: Prisma.Decimal;
      status: LabOrderItemStatus;
      createdAt: Date;
      updatedAt: Date;

      labTest: {
        code: string;
        name: string;
      };

      result: {
        id: string;
        labOrderItemId: string;
        result: string;
        notes: string | null;
        performedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
      } | null;
    }[];
  }): LabOrderResponseDto {
    return {
      id: labOrder.id,

      clinicId: labOrder.clinicId,

      patientId: labOrder.patientId,

      doctorId: labOrder.doctorId,

      appointmentId: labOrder.appointmentId,

      status: labOrder.status,

      notes: labOrder.notes,

      items: labOrder.labOrderItems.map((item) => ({
        id: item.id,

        labOrderId: item.labOrderId,

        labTestId: item.labTestId,

        labTestCode: item.labTest.code,

        labTestName: item.labTest.name,

        price: Number(item.price),

        status: item.status,

        result: item.result ? this.mapLabResult(item.result) : null,

        createdAt: item.createdAt,

        updatedAt: item.updatedAt,
      })),

      createdAt: labOrder.createdAt,

      updatedAt: labOrder.updatedAt,
    };
  }

  private mapPrescription(prescription: {
    id: string;
    medicalRecordId: string;
    medicineId: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    route: string | null;
    duration: string | null;
    quantity: string | null;
    instructions: string | null;
    createdAt: Date;
  }): PrescriptionResponseDto {
    return {
      id: prescription.id,

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
    };
  }

  private mapDiagnosis(diagnosis: {
    id: string;
    medicalRecordId: string;
    code: string | null;
    name: string;
    isPrimary: boolean;
    notes: string | null;
    createdAt: Date;
  }): DiagnosisResponseDto {
    return {
      id: diagnosis.id,

      medicalRecordId: diagnosis.medicalRecordId,

      code: diagnosis.code,

      name: diagnosis.name,

      isPrimary: diagnosis.isPrimary,

      notes: diagnosis.notes,

      createdAt: diagnosis.createdAt,
    };
  }
  private mapAppointment(appointment: {
    id: string;
    clinicId: string;
    appointmentNumber: string;
    patientId: string;
    doctorId: string;
    appointmentDate: Date;
    startTime: string;
    endTime: string;
    type: AppointmentType;
    status: AppointmentStatus;
    priority: AppointmentPriority;
    reason: string | null;
    notes: string | null;
    cancellationReason: string | null;
    consultationFee: Prisma.Decimal | null;
    createdAt: Date;
    updatedAt: Date;

    patient?: {
      id: string;
      patientNumber: string;
      firstName: string;
      middleName: string | null;
      lastName: string;
    };

    doctor?: {
      id: string;
      doctorNumber: string;
      title: string;
      firstName: string;
      middleName: string | null;
      lastName: string;
    };
  }): AppointmentResponseDto {
    return {
      id: appointment.id,

      clinicId: appointment.clinicId,
      appointmentNumber: appointment.appointmentNumber,

      patientId: appointment.patientId,
      doctorId: appointment.doctorId,

      appointmentDate: appointment.appointmentDate,

      startTime: appointment.startTime,
      endTime: appointment.endTime,

      type: appointment.type,
      status: appointment.status,
      priority: appointment.priority,

      reason: appointment.reason ?? undefined,
      notes: appointment.notes ?? undefined,

      cancellationReason: appointment.cancellationReason ?? undefined,

      consultationFee:
        appointment.consultationFee !== null
          ? appointment.consultationFee.toString()
          : undefined,

      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,

      ...(appointment.patient && {
        patient: {
          id: appointment.patient.id,
          patientNumber: appointment.patient.patientNumber,
          firstName: appointment.patient.firstName,
          middleName: appointment.patient.middleName ?? undefined,
          lastName: appointment.patient.lastName,
        },
      }),

      ...(appointment.doctor && {
        doctor: {
          id: appointment.doctor.id,
          doctorNumber: appointment.doctor.doctorNumber,
          title: appointment.doctor.title,
          firstName: appointment.doctor.firstName,
          middleName: appointment.doctor.middleName ?? undefined,
          lastName: appointment.doctor.lastName,
        },
      }),
    };
  }

  private mapMedicalRecord(record: MedicalRecord): MedicalRecordResponseDto {
    return {
      id: record.id,
      patientId: record.patientId,
      doctorId: record.doctorId,
      appointmentId: record.appointmentId,
      chiefComplaint: record.chiefComplaint,
      historyOfPresentIllness: record.historyOfPresentIllness,
      examinationNotes: record.examinationNotes,
      assessment: record.assessment,
      treatmentPlan: record.treatmentPlan,
      followUpInstructions: record.followUpInstructions,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private async changeStatus(
    clinicId: string,
    id: string,
    status: AppointmentStatus,
  ) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    this.validateStatusTransition(appointment.status, status);

    const updated = await this.prisma.appointment.update({
      where: {
        id: appointment.id,
      },

      data: {
        status,
      },

      include: this.appointmentInclude(),
    });

    return this.toResponse(updated);
  }

  private validateStatusTransition(
    current: AppointmentStatus,
    next: AppointmentStatus,
  ) {
    const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      SCHEDULED: [
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW,
      ],

      CONFIRMED: [
        AppointmentStatus.CHECKED_IN,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW,
      ],

      CHECKED_IN: [
        AppointmentStatus.IN_CONSULTATION,
        AppointmentStatus.CANCELLED,
      ],

      IN_CONSULTATION: [AppointmentStatus.COMPLETED],

      COMPLETED: [],

      CANCELLED: [],

      NO_SHOW: [],
    };

    if (!transitions[current].includes(next)) {
      throw new BadRequestException(
        `Invalid appointment status transition: ${current} → ${next}`,
      );
    }
  }

  private validateStatusForUpdate(status: AppointmentStatus) {
    if (
      status === AppointmentStatus.COMPLETED ||
      status === AppointmentStatus.CANCELLED ||
      status === AppointmentStatus.NO_SHOW
    ) {
      throw new BadRequestException(
        `Appointment with status ${status} cannot be directly updated`,
      );
    }
  }

  private validateAppointmentTime(startTime: string, endTime: string) {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }
  }

  private validateSlotDuration(
    startTime: string,
    endTime: string,
    slotDuration: number,
  ) {
    const duration =
      this.timeToMinutes(endTime) - this.timeToMinutes(startTime);

    if (duration !== slotDuration) {
      throw new BadRequestException(
        `Appointment duration must be ${slotDuration} minutes`,
      );
    }
  }

  private validateNotInPast(date: Date, startTime: string) {
    const now = new Date();

    const appointmentDateTime = new Date(date);

    const [hours, minutes] = startTime.split(':').map(Number);

    appointmentDateTime.setHours(hours, minutes, 0, 0);

    if (appointmentDateTime <= now) {
      throw new BadRequestException(
        'Appointment must be scheduled in the future',
      );
    }
  }

  private isTimeWithinSchedule(
    startTime: string,
    endTime: string,
    scheduleStart: string,
    scheduleEnd: string,
  ) {
    return (
      this.timeToMinutes(startTime) >= this.timeToMinutes(scheduleStart) &&
      this.timeToMinutes(endTime) <= this.timeToMinutes(scheduleEnd)
    );
  }

  private timesOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string,
  ) {
    const start1 = this.timeToMinutes(startA);

    const end1 = this.timeToMinutes(endA);

    const start2 = this.timeToMinutes(startB);

    const end2 = this.timeToMinutes(endB);

    return start1 < end2 && end1 > start2;
  }

  private async findConflictingAppointment(
    doctorId: string,
    appointmentDate: Date,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string,
  ) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,

        appointmentDate: {
          gte: appointmentDate,
          lt: this.nextDate(appointmentDate),
        },

        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },

        ...(excludeAppointmentId && {
          id: {
            not: excludeAppointmentId,
          },
        }),
      },

      select: {
        id: true,
        startTime: true,
        endTime: true,
      },
    });

    return (
      appointments.find((appointment) =>
        this.timesOverlap(
          startTime,
          endTime,
          appointment.startTime,
          appointment.endTime,
        ),
      ) ?? null
    );
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    slotDuration: number,
    bufferTime: number,
  ) {
    const slots: {
      startTime: string;
      endTime: string;
    }[] = [];

    let current = this.timeToMinutes(startTime);

    const end = this.timeToMinutes(endTime);

    while (current + slotDuration <= end) {
      const slotEnd = current + slotDuration;

      slots.push({
        startTime: this.minutesToTime(current),
        endTime: this.minutesToTime(slotEnd),
      });

      current = slotEnd + bufferTime;
    }

    return slots;
  }

  private getConsultationFee(
    fee: {
      consultationFee: Prisma.Decimal;
      followUpFee: Prisma.Decimal | null;
      emergencyFee: Prisma.Decimal | null;
      teleConsultationFee: Prisma.Decimal | null;
    } | null,
    type?: AppointmentType,
  ): Prisma.Decimal | undefined {
    if (!fee) {
      return undefined;
    }

    switch (type) {
      case AppointmentType.FOLLOW_UP:
        return fee.followUpFee ?? fee.consultationFee;

      case AppointmentType.EMERGENCY:
        return fee.emergencyFee ?? fee.consultationFee;

      case AppointmentType.TELECONSULTATION:
        return fee.teleConsultationFee ?? fee.consultationFee;

      default:
        return fee.consultationFee;
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);

    const mins = minutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  private parseDate(value: string): Date {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date: ${value}`);
    }

    return date;
  }

  private nextDate(date: Date): Date {
    const next = new Date(date);

    next.setDate(next.getDate() + 1);

    return next;
  }

  private async generateAppointmentNumber(clinicId: string): Promise<string> {
    const year = new Date().getFullYear();

    const lastAppointment = await this.prisma.appointment.findFirst({
      where: {
        clinicId,
        appointmentNumber: {
          startsWith: `APT-${year}-`,
        },
      },
      orderBy: {
        appointmentNumber: 'desc',
      },
      select: {
        appointmentNumber: true,
      },
    });

    let nextNumber = 1;

    if (lastAppointment?.appointmentNumber) {
      const match =
        lastAppointment.appointmentNumber.match(/^APT-\d{4}-(\d+)$/);

      if (match) {
        nextNumber = Number(match[1]) + 1;
      }
    }

    return `APT-${year}-${String(nextNumber).padStart(5, '0')}`;
  }

  private appointmentInclude() {
    return {
      patient: {
        select: {
          id: true,
          patientNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
        },
      },

      doctor: {
        select: {
          id: true,
          doctorNumber: true,
          title: true,
          firstName: true,
          middleName: true,
          lastName: true,
        },
      },
    } satisfies Prisma.AppointmentInclude;
  }

  private toResponse(appointment: AppointmentWithRelations) {
    return {
      id: appointment.id,

      clinicId: appointment.clinicId,
      appointmentNumber: appointment.appointmentNumber,

      patientId: appointment.patientId,
      doctorId: appointment.doctorId,

      appointmentDate: appointment.appointmentDate,

      startTime: appointment.startTime,
      endTime: appointment.endTime,

      type: appointment.type,
      status: appointment.status,
      priority: appointment.priority,

      reason: appointment.reason ?? undefined,

      notes: appointment.notes ?? undefined,

      cancellationReason: appointment.cancellationReason ?? undefined,

      consultationFee: appointment.consultationFee?.toString(),

      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,

      patient: {
        id: appointment.patient.id,
        patientNumber: appointment.patient.patientNumber,
        firstName: appointment.patient.firstName,
        middleName: appointment.patient.middleName ?? undefined,
        lastName: appointment.patient.lastName,
      },

      doctor: {
        id: appointment.doctor.id,
        doctorNumber: appointment.doctor.doctorNumber,
        title: appointment.doctor.title,
        firstName: appointment.doctor.firstName,
        middleName: appointment.doctor.middleName ?? undefined,
        lastName: appointment.doctor.lastName,
      },
    };
  }

  private async generateInvoiceNumber(
    tx: Prisma.TransactionClient,
    clinicId: string,
  ): Promise<string> {
    const clinic = await tx.clinic.findUnique({
      where: {
        id: clinicId,
      },
      select: {
        code: true,
      },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    const year = new Date().getFullYear();

    const count = await tx.invoice.count({
      where: {
        clinicId,

        createdAt: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),

          lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
    });

    return `INV-${clinic.code}-${year}-${String(count + 1).padStart(6, '0')}`;
  }
}

type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: {
    patient: {
      select: {
        id: true;
        patientNumber: true;
        firstName: true;
        middleName: true;
        lastName: true;
      };
    };

    doctor: {
      select: {
        id: true;
        doctorNumber: true;
        title: true;
        firstName: true;
        middleName: true;
        lastName: true;
      };
    };
  };
}>;
