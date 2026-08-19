import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InvoiceStatus, LabOrderStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice.dto';

type InvoiceWithItems = Prisma.InvoiceGetPayload<{
  include: {
    items: true;
  };
}>;

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  async create(
    clinicId: string,
    dto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('At least one invoice item is required');
    }

    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: dto.appointmentId,
        clinicId,
      },
      select: {
        id: true,
        patientId: true,
        doctorId: true,
        status: true,
        consultationFee: true,
        invoice: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.invoice) {
      throw new ConflictException(
        'An invoice already exists for this appointment',
      );
    }

    const subtotal = this.calculateSubtotal(dto.items);

    const discount = this.roundMoney(dto.discount ?? 0);

    const tax = this.roundMoney(dto.tax ?? 0);

    if (discount > subtotal) {
      throw new BadRequestException('Discount cannot exceed subtotal');
    }

    const total = this.roundMoney(subtotal - discount + tax);

    const invoiceNumber = await this.generateInvoiceNumber(clinicId);

    const invoice = await this.prisma.$transaction(async (tx) => {
      return tx.invoice.create({
        data: {
          invoiceNumber,

          clinicId,

          patientId: appointment.patientId,

          appointmentId: appointment.id,

          status: InvoiceStatus.DRAFT,

          subtotal: new Prisma.Decimal(subtotal.toFixed(2)),

          discount: new Prisma.Decimal(discount.toFixed(2)),

          tax: new Prisma.Decimal(tax.toFixed(2)),

          total: new Prisma.Decimal(total.toFixed(2)),

          amountPaid: new Prisma.Decimal('0.00'),

          balanceDue: new Prisma.Decimal(total.toFixed(2)),

          notes: dto.notes,

          items: {
            create: dto.items.map((item) => {
              const quantity = this.roundQuantity(item.quantity);

              const unitPrice = this.roundMoney(item.unitPrice);

              const amount = this.roundMoney(quantity * unitPrice);

              return {
                description: item.description,

                quantity: new Prisma.Decimal(quantity.toFixed(2)),

                unitPrice: new Prisma.Decimal(unitPrice.toFixed(2)),

                amount: new Prisma.Decimal(amount.toFixed(2)),
              };
            }),
          },
        },

        include: {
          items: true,
        },
      });
    });

    return this.mapInvoice(invoice);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  async findAll(
    clinicId: string,
    query: InvoiceQueryDto,
  ): Promise<PaginatedResponseDto<InvoiceResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search,
      patientId,
      appointmentId,
      status,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      clinicId,

      ...(patientId && {
        patientId,
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
            invoiceNumber: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [invoices, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          items: true,
        },
      }),

      this.prisma.invoice.count({
        where,
      }),
    ]);

    return {
      data: invoices.map((invoice) => this.mapInvoice(invoice)),

      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  async findOne(clinicId: string, id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        clinicId,
      },

      include: {
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.mapInvoice(invoice);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  async update(
    clinicId: string,
    id: string,
    dto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        clinicId,
      },

      include: {
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be updated');
    }

    const items =
      dto.items ??
      invoice.items.map((item) => ({
        description: item.description,

        quantity: Number(item.quantity),

        unitPrice: Number(item.unitPrice),
      }));

    if (items.length === 0) {
      throw new BadRequestException('At least one invoice item is required');
    }

    const subtotal = this.calculateSubtotal(items);

    const discount =
      dto.discount !== undefined
        ? this.roundMoney(dto.discount)
        : Number(invoice.discount);

    const tax =
      dto.tax !== undefined ? this.roundMoney(dto.tax) : Number(invoice.tax);

    if (discount > subtotal) {
      throw new BadRequestException('Discount cannot exceed subtotal');
    }

    const total = this.roundMoney(subtotal - discount + tax);

    const amountPaid = Number(invoice.amountPaid);

    const balanceDue = this.roundMoney(Math.max(total - amountPaid, 0));

    const updatedInvoice = await this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.invoiceItem.deleteMany({
          where: {
            invoiceId: id,
          },
        });
      }

      return tx.invoice.update({
        where: {
          id,
        },

        data: {
          subtotal: new Prisma.Decimal(subtotal.toFixed(2)),

          discount: new Prisma.Decimal(discount.toFixed(2)),

          tax: new Prisma.Decimal(tax.toFixed(2)),

          total: new Prisma.Decimal(total.toFixed(2)),

          balanceDue: new Prisma.Decimal(balanceDue.toFixed(2)),

          ...(dto.notes !== undefined && {
            notes: dto.notes,
          }),

          ...(dto.items && {
            items: {
              create: items.map((item) => {
                const quantity = this.roundQuantity(item.quantity);

                const unitPrice = this.roundMoney(item.unitPrice);

                const amount = this.roundMoney(quantity * unitPrice);

                return {
                  description: item.description,

                  quantity: new Prisma.Decimal(quantity.toFixed(2)),

                  unitPrice: new Prisma.Decimal(unitPrice.toFixed(2)),

                  amount: new Prisma.Decimal(amount.toFixed(2)),
                };
              }),
            },
          }),
        },

        include: {
          items: true,
        },
      });
    });

    return this.mapInvoice(updatedInvoice);
  }

  // ===========================================================================
  // ISSUE
  // ===========================================================================

  async issue(clinicId: string, id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be issued');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: {
        id,
      },

      data: {
        status: InvoiceStatus.ISSUED,

        issuedAt: new Date(),
      },

      include: {
        items: true,
      },
    });

    return this.mapInvoice(updatedInvoice);
  }

  // ===========================================================================
  // CANCEL
  // ===========================================================================

  async cancel(clinicId: string, id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (
      invoice.status === InvoiceStatus.PAID ||
      invoice.status === InvoiceStatus.REFUNDED
    ) {
      throw new BadRequestException(
        'Paid or refunded invoices cannot be cancelled',
      );
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Invoice is already cancelled');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: {
        id,
      },

      data: {
        status: InvoiceStatus.CANCELLED,
      },

      include: {
        items: true,
      },
    });

    return this.mapInvoice(updatedInvoice);
  }

  // ===========================================================================
  // GENERATE INVOICE NUMBER
  // ===========================================================================

  private async generateInvoiceNumber(clinicId: string): Promise<string> {
    const year = new Date().getFullYear();

    const count = await this.prisma.invoice.count({
      where: {
        clinicId,

        createdAt: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),

          lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
    });

    return `INV-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  // ===========================================================================
  // MONEY HELPERS
  // ===========================================================================

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private roundQuantity(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private calculateSubtotal(
    items: Array<{
      quantity: number;
      unitPrice: number;
    }>,
  ): number {
    return this.roundMoney(
      items.reduce(
        (total, item) =>
          total +
          this.roundQuantity(item.quantity) * this.roundMoney(item.unitPrice),
        0,
      ),
    );
  }

  // ===========================================================================
  // ADD ITEM
  // ===========================================================================

  async addItem(
    clinicId: string,
    invoiceId: string,
    dto: CreateInvoiceItemDto,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        clinicId,
      },
      include: {
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be modified');
    }

    const quantity = this.roundQuantity(dto.quantity);
    const unitPrice = this.roundMoney(dto.unitPrice);
    const amount = this.roundMoney(quantity * unitPrice);

    const currentSubtotal = Number(invoice.subtotal);

    const subtotal = this.roundMoney(currentSubtotal + amount);

    const discount = this.roundMoney(Number(invoice.discount));

    const tax = this.roundMoney(Number(invoice.tax));

    if (discount > subtotal) {
      throw new BadRequestException('Discount cannot exceed subtotal');
    }

    const total = this.roundMoney(subtotal - discount + tax);

    const amountPaid = this.roundMoney(Number(invoice.amountPaid));

    const balanceDue = this.roundMoney(Math.max(total - amountPaid, 0));

    const updatedInvoice = await this.prisma.$transaction(async (tx) => {
      await tx.invoiceItem.create({
        data: {
          invoiceId,
          description: dto.description,
          quantity: new Prisma.Decimal(quantity.toFixed(2)),
          unitPrice: new Prisma.Decimal(unitPrice.toFixed(2)),
          amount: new Prisma.Decimal(amount.toFixed(2)),
        },
      });

      return tx.invoice.update({
        where: {
          id: invoiceId,
        },

        data: {
          subtotal: new Prisma.Decimal(subtotal.toFixed(2)),

          total: new Prisma.Decimal(total.toFixed(2)),

          balanceDue: new Prisma.Decimal(balanceDue.toFixed(2)),
        },

        include: {
          items: true,
        },
      });
    });

    return this.mapInvoice(updatedInvoice);
  }

  // ===========================================================================
  // REMOVE ITEM
  // ===========================================================================

  async removeItem(
    clinicId: string,
    invoiceId: string,
    itemId: string,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        clinicId,
      },
      include: {
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be modified');
    }

    const item = invoice.items.find((currentItem) => currentItem.id === itemId);

    if (!item) {
      throw new NotFoundException('Invoice item not found');
    }

    if (invoice.items.length <= 1) {
      throw new BadRequestException(
        'An invoice must contain at least one item',
      );
    }

    const itemAmount = Number(item.amount);

    const subtotal = this.roundMoney(Number(invoice.subtotal) - itemAmount);

    const discount = this.roundMoney(Number(invoice.discount));

    const tax = this.roundMoney(Number(invoice.tax));

    if (discount > subtotal) {
      throw new BadRequestException('Discount cannot exceed subtotal');
    }

    const total = this.roundMoney(subtotal - discount + tax);

    const amountPaid = this.roundMoney(Number(invoice.amountPaid));

    const balanceDue = this.roundMoney(Math.max(total - amountPaid, 0));

    const updatedInvoice = await this.prisma.$transaction(async (tx) => {
      await tx.invoiceItem.delete({
        where: {
          id: itemId,
        },
      });

      return tx.invoice.update({
        where: {
          id: invoiceId,
        },

        data: {
          subtotal: new Prisma.Decimal(subtotal.toFixed(2)),

          total: new Prisma.Decimal(total.toFixed(2)),

          balanceDue: new Prisma.Decimal(balanceDue.toFixed(2)),
        },

        include: {
          items: true,
        },
      });
    });

    return this.mapInvoice(updatedInvoice);
  }

  async addLabOrderItems(
    clinicId: string,
    invoiceId: string,
    labOrderId: string,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        clinicId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Lab charges can only be added to a draft invoice',
      );
    }

    const labOrder = await this.prisma.labOrder.findFirst({
      where: {
        id: labOrderId,
        clinicId,
      },
      include: {
        labOrderItems: {
          include: {
            labTest: true,
            invoiceItem: true,
          },
        },
      },
    });

    if (!labOrder) {
      throw new NotFoundException('Laboratory order not found');
    }

    if (labOrder.status === LabOrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot add a cancelled laboratory order to an invoice',
      );
    }

    const unbilledItems = labOrder.labOrderItems.filter(
      (item) => !item.invoiceItem,
    );

    if (unbilledItems.length === 0) {
      throw new ConflictException(
        'All laboratory tests in this order are already billed',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of unbilledItems) {
        const quantity = new Prisma.Decimal(1);

        const unitPrice = item.price;

        const amount = quantity.mul(unitPrice);

        await tx.invoiceItem.create({
          data: {
            invoiceId,

            labOrderItemId: item.id,

            description: `Lab Test - ${item.labTest.name}`,

            quantity,

            unitPrice,

            amount,
          },
        });
      }

      await this.recalculateInvoice(tx, invoiceId);
    });

    return this.findOne(clinicId, invoiceId);
  }

  // ===========================================================================
  // RESPONSE MAPPER
  // ===========================================================================

  private mapInvoice(invoice: InvoiceWithItems): InvoiceResponseDto {
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

  private async recalculateInvoice(
    tx: Prisma.TransactionClient,
    invoiceId: string,
  ): Promise<void> {
    const items = await tx.invoiceItem.findMany({
      where: {
        invoiceId,
      },
      select: {
        amount: true,
      },
    });

    const subtotal = items.reduce(
      (sum, item) => sum.add(item.amount),
      new Prisma.Decimal(0),
    );

    const invoice = await tx.invoice.findUnique({
      where: {
        id: invoiceId,
      },
      select: {
        discount: true,
        tax: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const discount = invoice.discount ?? new Prisma.Decimal(0);

    const tax = invoice.tax ?? new Prisma.Decimal(0);

    const total = subtotal.sub(discount).add(tax);

    await tx.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        subtotal,
        total,
      },
    });
  }
}
