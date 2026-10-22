import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InvoiceStatus,
  InvoiceType,
  LabOrderItemStatus,
  LabOrderStatus,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { CreateLabResultDto } from './dto/create-lab-result.dto';
import { LabOrderQueryDto } from './dto/lab-order-query.dto';
import { LabOrderResponseDto } from './dto/lab-order-response.dto';
import { UpdateLabOrderStatusDto } from './dto/update-lab-order-status.dto';

type LabOrderWithItems = Prisma.LabOrderGetPayload<{
  include: {
    appointment: {
      select: {
        id: true;
        appointmentNumber: true;
        appointmentDate: true;
        startTime: true;
        endTime: true;
        status: true;
        patient: {
          select: {
            id: true;
            patientNumber: true;
            firstName: true;
            lastName: true;
          };
        };
        doctor: {
          select: {
            id: true;
            doctorNumber: true;
            firstName: true;
            lastName: true;
          };
        };
      };
    };
    labOrderItems: {
      include: {
        labTest: true;
        result: true;
      };
    };
  };
}>;

const appointmentInclude = {
  appointment: {
    select: {
      id: true,
      appointmentNumber: true,
      appointmentDate: true,
      startTime: true,
      endTime: true,
      status: true,
      patient: {
        select: {
          id: true,
          patientNumber: true,
          firstName: true,
          lastName: true,
        },
      },
      doctor: {
        select: {
          id: true,
          doctorNumber: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  },
} satisfies Prisma.LabOrderInclude;

@Injectable()
export class LabOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  async create(
    clinicId: string,
    dto: CreateLabOrderDto,
  ): Promise<LabOrderResponseDto> {
    const labOrder = await this.prisma.$transaction(async (tx) => {
      // -------------------------------------------------------------------
      // Validate appointment
      // -------------------------------------------------------------------

      const appointment = await tx.appointment.findFirst({
        where: {
          id: dto.appointmentId,
          clinicId,
        },
        select: {
          id: true,
          clinicId: true,
          patientId: true,
          doctorId: true,
        },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      // // -------------------------------------------------------------------
      // // Prevent duplicate active lab orders
      // // -------------------------------------------------------------------

      // const existingOrder = await tx.labOrder.findFirst({
      //   where: {
      //     appointmentId: appointment.id,
      //     status: {
      //       not: LabOrderStatus.CANCELLED,
      //     },
      //   },
      //   select: {
      //     id: true,
      //   },
      // });

      // if (existingOrder) {
      //   throw new ConflictException(
      //     'A laboratory order already exists for this appointment',
      //   );
      // }

      // -------------------------------------------------------------------
      // Validate requested lab tests
      // -------------------------------------------------------------------

      const labTests = await tx.labTest.findMany({
        where: {
          id: {
            in: dto.labTestIds,
          },
          clinicId,
          isActive: true,
        },
        select: {
          id: true,
          code: true,
          name: true,
          price: true,
        },
      });

      if (labTests.length !== dto.labTestIds.length) {
        throw new BadRequestException(
          'One or more laboratory tests are invalid, inactive, or do not belong to this clinic',
        );
      }

      // -------------------------------------------------------------------
      // Prevent duplicate test IDs
      // -------------------------------------------------------------------

      const uniqueTestIds = new Set(dto.labTestIds);

      if (uniqueTestIds.size !== dto.labTestIds.length) {
        throw new BadRequestException(
          'Duplicate laboratory tests are not allowed',
        );
      }

      // -------------------------------------------------------------------
      // Create lab order
      // -------------------------------------------------------------------

      const labOrder = await tx.labOrder.create({
        data: {
          clinicId,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          appointmentId: appointment.id,
          status: LabOrderStatus.PENDING,
          notes: dto.notes,

          labOrderItems: {
            create: labTests.map((labTest) => ({
              labTestId: labTest.id,

              // Snapshot the price at
              // the time of ordering.
              price: labTest.price,

              status: LabOrderItemStatus.PENDING,
            })),
          },
        },

        include: {
          ...appointmentInclude,

          labOrderItems: {
            include: {
              labTest: true,
              result: true,
            },
          },
        },
      });
      // const existingLaboratoryInvoice = await tx.invoice.findFirst({
      //   where: {
      //     appointmentId: appointment.id,
      //     type: InvoiceType.LABORATORY,
      //   },
      //   select: {
      //     id: true,
      //   },
      // });

      // if (existingLaboratoryInvoice) {
      //   throw new ConflictException(
      //     'A laboratory invoice already exists for this appointment',
      //   );
      // }

      const subtotal = labTests.reduce(
        (sum, labTest) => sum.add(labTest.price),
        new Prisma.Decimal('0.00'),
      );

      const invoiceNumber = await this.generateInvoiceNumber(tx, clinicId);

      await tx.invoice.create({
        data: {
          invoiceNumber,
          clinicId: appointment.clinicId,
          patientId: appointment.patientId,
          appointmentId: appointment.id,

          type: InvoiceType.LABORATORY,
          status: InvoiceStatus.DRAFT,

          subtotal,
          discount: new Prisma.Decimal('0.00'),
          tax: new Prisma.Decimal('0.00'),
          total: subtotal,

          amountPaid: new Prisma.Decimal('0.00'),
          balanceDue: subtotal,

          items: {
            create: labTests.map((labTest) => ({
              description: labTest.name,
              quantity: new Prisma.Decimal('1.00'),
              unitPrice: labTest.price,
              amount: labTest.price,
            })),
          },
        },
      });

      return labOrder;
    });

    return this.mapLabOrder(labOrder);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  async findAll(
    clinicId: string,
    query: LabOrderQueryDto,
  ): Promise<PaginatedResponseDto<LabOrderResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search,
      patientId,
      doctorId,
      appointmentId,
      status,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.LabOrderWhereInput = {
      clinicId,

      ...(patientId && {
        patientId,
      }),

      ...(doctorId && {
        doctorId,
      }),

      ...(appointmentId && {
        appointmentId,
      }),

      ...(status && {
        status,
      }),

      ...(search && {
        OR: [
          {
            notes: {
              contains: search,
              mode: 'insensitive',
            },
          },

          {
            labOrderItems: {
              some: {
                labTest: {
                  OR: [
                    {
                      code: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    },
                    {
                      name: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      }),
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.labOrder.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          ...appointmentInclude,
          labOrderItems: {
            include: {
              labTest: true,
              result: true,
            },
          },
        },
      }),

      this.prisma.labOrder.count({
        where,
      }),
    ]);

    return {
      data: orders.map((order) => this.mapLabOrder(order)),

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  async findOne(clinicId: string, id: string): Promise<LabOrderResponseDto> {
    const order = await this.prisma.labOrder.findFirst({
      where: {
        id,
        clinicId,
      },

      include: {
        ...appointmentInclude,
        labOrderItems: {
          include: {
            labTest: true,
            result: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Laboratory order not found');
    }

    return this.mapLabOrder(order);
  }

  // ===========================================================================
  // UPDATE ORDER STATUS
  // ===========================================================================

  async updateStatus(
    clinicId: string,
    id: string,
    dto: UpdateLabOrderStatusDto,
  ): Promise<LabOrderResponseDto> {
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const order = await tx.labOrder.findFirst({
        where: { id, clinicId },
        include: { labOrderItems: true },
      });

      if (!order) {
        throw new NotFoundException('Laboratory order not found');
      }

      this.validateStatusTransition(order.status, dto.status);

      if (dto.status === LabOrderStatus.COMPLETED) {
        const incompleteItems = order.labOrderItems.some(
          (item) =>
            item.status !== LabOrderItemStatus.COMPLETED &&
            item.status !== LabOrderItemStatus.CANCELLED,
        );

        if (incompleteItems) {
          throw new BadRequestException(
            'All laboratory tests must be completed or cancelled before completing the order',
          );
        }
      }

      // Guard the write against a concurrent status change after the read.
      const result = await tx.labOrder.updateMany({
        where: { id, clinicId, status: order.status },
        data: { status: dto.status },
      });

      if (result.count !== 1) {
        throw new ConflictException(
          'The laboratory order changed while being updated. Refresh and try again.',
        );
      }

      const freshOrder = await tx.labOrder.findFirst({
        where: { id, clinicId },
        include: {
          ...appointmentInclude,
          labOrderItems: {
            include: { labTest: true, result: true },
          },
        },
      });

      if (!freshOrder) {
        throw new NotFoundException('Laboratory order not found');
      }

      return freshOrder;
    });

    return this.mapLabOrder(updatedOrder);
  }

  // ===========================================================================
  // CREATE / UPDATE RESULT
  // ===========================================================================

  async createResult(
    clinicId: string,
    itemId: string,
    dto: CreateLabResultDto,
  ): Promise<LabOrderResponseDto> {
    let labOrderId: string | undefined;

    await this.prisma.$transaction(async (tx) => {
      // ---------------------------------------------------------------------
      // Find order item and verify clinic
      // ---------------------------------------------------------------------

      const item = await tx.labOrderItem.findFirst({
        where: {
          id: itemId,

          labOrder: {
            clinicId,
          },
        },

        include: {
          labOrder: true,
        },
      });

      if (!item) {
        throw new NotFoundException('Laboratory order item not found');
      }

      labOrderId = item.labOrderId;

      // ---------------------------------------------------------------------
      // Validate order state
      // ---------------------------------------------------------------------

      if (item.labOrder.status === LabOrderStatus.CANCELLED) {
        throw new BadRequestException(
          'Cannot enter a result for a cancelled laboratory order',
        );
      }

      // ---------------------------------------------------------------------
      // Validate item state
      // ---------------------------------------------------------------------

      if (item.status === LabOrderItemStatus.CANCELLED) {
        throw new BadRequestException(
          'Cannot enter a result for a cancelled laboratory test',
        );
      }

      // ---------------------------------------------------------------------
      // Create or update result
      // ---------------------------------------------------------------------

      await tx.labResult.upsert({
        where: {
          labOrderItemId: item.id,
        },

        create: {
          labOrderItemId: item.id,

          result: dto.result,

          notes: dto.notes,

          performedAt: dto.performedAt ? new Date(dto.performedAt) : new Date(),
        },

        update: {
          result: dto.result,

          notes: dto.notes,

          performedAt: dto.performedAt ? new Date(dto.performedAt) : new Date(),
        },
      });

      // ---------------------------------------------------------------------
      // Mark item completed
      // ---------------------------------------------------------------------

      const itemUpdate = await tx.labOrderItem.updateMany({
        where: {
          id: item.id,
          labOrder: { clinicId },
        },
        data: {
          status: LabOrderItemStatus.COMPLETED,
        },
      });
      if (itemUpdate.count !== 1) {
        throw new NotFoundException('Laboratory order item not found');
      }

      // ---------------------------------------------------------------------
      // Determine whether the complete order is finished
      // ---------------------------------------------------------------------

      const remainingItems = await tx.labOrderItem.count({
        where: {
          labOrderId: item.labOrderId,

          status: {
            notIn: [LabOrderItemStatus.COMPLETED, LabOrderItemStatus.CANCELLED],
          },
        },
      });

      await tx.labOrder.update({
        where: {
          id: item.labOrderId,
          clinicId,
        },

        data: {
          status:
            remainingItems === 0
              ? LabOrderStatus.COMPLETED
              : LabOrderStatus.IN_PROGRESS,
        },
      });
    });

    if (!labOrderId) {
      throw new NotFoundException('Laboratory order not found');
    }

    return this.findOne(clinicId, labOrderId);
  }

  // ===========================================================================
  // UPDATE ITEM STATUS
  // ===========================================================================

  async updateItemStatus(
    clinicId: string,
    itemId: string,
    status: LabOrderItemStatus,
  ): Promise<LabOrderResponseDto> {
    const item = await this.prisma.labOrderItem.findFirst({
      where: {
        id: itemId,

        labOrder: {
          clinicId,
        },
      },

      include: {
        labOrder: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Laboratory order item not found');
    }

    // -------------------------------------------------------------------------
    // Cannot modify cancelled order
    // -------------------------------------------------------------------------

    if (
      item.labOrder.status === LabOrderStatus.CANCELLED ||
      item.labOrder.status === LabOrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Cannot modify items on a ${item.labOrder.status.toLowerCase()} laboratory order`,
      );
    }

    if (item.status === LabOrderItemStatus.COMPLETED) {
      throw new BadRequestException(
        'Completed laboratory tests cannot change status',
      );
    }

    // -------------------------------------------------------------------------
    // Completed items are completed through result entry
    // -------------------------------------------------------------------------

    if (status === LabOrderItemStatus.COMPLETED) {
      throw new BadRequestException(
        'Use the result endpoint to complete a laboratory test',
      );
    }

    // -------------------------------------------------------------------------
    // Update item and order state together
    // -------------------------------------------------------------------------

    await this.prisma.$transaction(async (tx) => {
      const itemUpdate = await tx.labOrderItem.updateMany({
        where: {
          id: itemId,
          labOrder: { clinicId },
        },
        data: { status },
      });
      if (itemUpdate.count !== 1) {
        throw new NotFoundException('Laboratory order item not found');
      }

      // ---------------------------------------------------------------------
      // If processing starts, move the order to IN_PROGRESS
      // ---------------------------------------------------------------------

      if (status === LabOrderItemStatus.IN_PROGRESS) {
        await tx.labOrder.update({
          where: {
            id: item.labOrderId,
            clinicId,
          },

          data: {
            status: LabOrderStatus.IN_PROGRESS,
          },
        });

        return;
      }

      // ---------------------------------------------------------------------
      // If item is cancelled, determine whether all items are finished
      // ---------------------------------------------------------------------

      if (status === LabOrderItemStatus.CANCELLED) {
        const remaining = await tx.labOrderItem.count({
          where: {
            labOrderId: item.labOrderId,

            status: {
              notIn: [
                LabOrderItemStatus.COMPLETED,
                LabOrderItemStatus.CANCELLED,
              ],
            },
          },
        });

        if (remaining === 0) {
          await tx.labOrder.update({
            where: {
              id: item.labOrderId,
            },

            data: {
              status: LabOrderStatus.COMPLETED,
            },
          });
        }
      }
    });

    return this.findOne(clinicId, item.labOrderId);
  }

  // ===========================================================================
  // STATUS TRANSITION VALIDATION
  // ===========================================================================

  private validateStatusTransition(
    current: LabOrderStatus,
    next: LabOrderStatus,
  ): void {
    if (current === next) {
      throw new BadRequestException(`Laboratory order is already ${current}`);
    }

    const transitions: Record<LabOrderStatus, LabOrderStatus[]> = {
      [LabOrderStatus.PENDING]: [
        LabOrderStatus.IN_PROGRESS,
        LabOrderStatus.CANCELLED,
      ],

      [LabOrderStatus.IN_PROGRESS]: [
        LabOrderStatus.COMPLETED,
        LabOrderStatus.CANCELLED,
      ],

      [LabOrderStatus.COMPLETED]: [],

      [LabOrderStatus.CANCELLED]: [],
    };

    if (!transitions[current].includes(next)) {
      throw new BadRequestException(
        `Invalid laboratory order status transition from ${current} to ${next}`,
      );
    }
  }

  // ===========================================================================
  // RESPONSE MAPPER
  // ===========================================================================

  private mapLabOrder(order: LabOrderWithItems): LabOrderResponseDto {
    return {
      id: order.id,

      clinicId: order.clinicId,

      patientId: order.patientId,

      doctorId: order.doctorId,

      appointmentId: order.appointmentId,

      appointment: order.appointment
        ? {
            id: order.appointment.id,
            appointmentNumber: order.appointment.appointmentNumber,
            appointmentDate: order.appointment.appointmentDate,
            startTime: order.appointment.startTime,
            endTime: order.appointment.endTime,
            status: order.appointment.status,
            patient: order.appointment.patient,
            doctor: order.appointment.doctor,
          }
        : null,

      status: order.status,

      notes: order.notes,

      items: order.labOrderItems.map((item) => ({
        id: item.id,

        labOrderId: item.labOrderId,

        labTestId: item.labTestId,

        labTestCode: item.labTest.code,

        labTestName: item.labTest.name,

        price: Number(item.price),

        status: item.status,

        result: item.result
          ? {
              id: item.result.id,

              labOrderItemId: item.result.labOrderItemId,

              result: item.result.result,

              notes: item.result.notes,

              performedAt: item.result.performedAt,

              createdAt: item.result.createdAt,

              updatedAt: item.result.updatedAt,
            }
          : null,

        createdAt: item.createdAt,

        updatedAt: item.updatedAt,
      })),

      createdAt: order.createdAt,

      updatedAt: order.updatedAt,
    };
  }

  // ===========================================================================
  // INVOICE NUMBER
  // ===========================================================================

  private async generateInvoiceNumber(
    tx: Prisma.TransactionClient,
    clinicId: string,
  ): Promise<string> {
    // Count-based numbering races under concurrent lab orders. Use the same
    // persisted per-clinic sequence as Billing and Appointments, while also
    // skipping legacy invoice numbers already present in the database.
    const year = new Date().getFullYear();

    for (let attempt = 0; attempt < 1000; attempt += 1) {
      const clinic = await tx.clinic
        .update({
          where: { id: clinicId },
          data: { invoiceSequence: { increment: 1 } },
          select: { code: true, invoiceSequence: true },
        })
        .catch((error: unknown) => {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
          ) {
            throw new NotFoundException('Clinic not found');
          }
          throw error;
        });

      const candidate = `INV-${clinic.code}-${year}-${String(clinic.invoiceSequence).padStart(6, '0')}`;
      const existing = await tx.invoice.findFirst({
        where: { clinicId, invoiceNumber: candidate },
        select: { id: true },
      });

      if (!existing) return candidate;
    }

    throw new ConflictException(
      'Unable to allocate a unique invoice number. Please retry the operation.',
    );
  }
}
