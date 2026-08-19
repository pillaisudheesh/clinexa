import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { LabOrderItemStatus, LabOrderStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { CreateLabResultDto } from './dto/create-lab-result.dto';
import { LabOrderQueryDto } from './dto/lab-order-query.dto';
import { LabOrderResponseDto } from './dto/lab-order-response.dto';
import { UpdateLabOrderStatusDto } from './dto/update-lab-order-status.dto';

type LabOrderWithItems = Prisma.LabOrderGetPayload<{
  include: {
    labOrderItems: {
      include: {
        labTest: true;
        result: true;
      };
    };
  };
}>;

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

      // -------------------------------------------------------------------
      // Prevent duplicate active lab orders
      // -------------------------------------------------------------------

      const existingOrder = await tx.labOrder.findFirst({
        where: {
          appointmentId: appointment.id,

          status: {
            not: LabOrderStatus.CANCELLED,
          },
        },

        select: {
          id: true,
        },
      });

      if (existingOrder) {
        throw new ConflictException(
          'A laboratory order already exists for this appointment',
        );
      }

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

      return tx.labOrder.create({
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
          labOrderItems: {
            include: {
              labTest: true,
              result: true,
            },
          },
        },
      });
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
    const order = await this.prisma.labOrder.findFirst({
      where: {
        id,
        clinicId,
      },

      include: {
        labOrderItems: {
          include: {
            result: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Laboratory order not found');
    }

    this.validateStatusTransition(order.status, dto.status);

    // -------------------------------------------------------------------------
    // An order can only be completed when all items
    // are completed or cancelled.
    // -------------------------------------------------------------------------

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

    const updatedOrder = await this.prisma.labOrder.update({
      where: {
        id,
      },

      data: {
        status: dto.status,
      },

      include: {
        labOrderItems: {
          include: {
            labTest: true,
            result: true,
          },
        },
      },
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

      await tx.labOrderItem.update({
        where: {
          id: item.id,
        },

        data: {
          status: LabOrderItemStatus.COMPLETED,
        },
      });

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

    if (item.labOrder.status === LabOrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot modify a cancelled laboratory order',
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
      await tx.labOrderItem.update({
        where: {
          id: itemId,
        },

        data: {
          status,
        },
      });

      // ---------------------------------------------------------------------
      // If processing starts, move the order to IN_PROGRESS
      // ---------------------------------------------------------------------

      if (status === LabOrderItemStatus.IN_PROGRESS) {
        await tx.labOrder.update({
          where: {
            id: item.labOrderId,
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
}
