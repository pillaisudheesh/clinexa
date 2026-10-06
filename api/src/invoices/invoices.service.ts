import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InvoiceStatus, LabOrderStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import {
  CreateInvoiceDto,
  CreateInvoiceItemDto,
} from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';

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

    this.validateManualItems(dto.items);

    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: dto.appointmentId,
        clinicId,
      },
      select: {
        id: true,
        patientId: true,
        invoices: {
          select: {
            id: true,
            type: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.invoices.some((invoice) => invoice.type === dto.type)) {
      throw new ConflictException(
        'An invoice of this type already exists for this appointment',
      );
    }

    const subtotal = this.calculateSubtotal(dto.items);
    const discount = this.roundMoney(dto.discount ?? 0);
    const tax = this.roundMoney(dto.tax ?? 0);

    this.validateAdjustments(subtotal, discount, tax);

    const total = this.calculateTotal(subtotal, discount, tax);

    const invoice = await this.prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.update({
        where: { id: clinicId },
        data: {
          invoiceSequence: {
            increment: 1,
          },
        },
        select: {
          invoiceSequence: true,
        },
      });

      const invoiceNumber = this.formatInvoiceNumber(clinic.invoiceSequence);

      return tx.invoice.create({
        data: {
          invoiceNumber,
          clinicId,
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          type: dto.type,
          status: InvoiceStatus.DRAFT,
          subtotal: this.decimal(subtotal),
          discount: this.decimal(discount),
          tax: this.decimal(tax),
          total: this.decimal(total),
          amountPaid: this.decimal(0),
          balanceDue: this.decimal(total),
          notes: dto.notes,
          items: {
            create: dto.items.map((item) => this.toInvoiceItemCreate(item)),
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
      ...(patientId && { patientId }),
      ...(appointmentId && { appointmentId }),
      ...(status && { status }),
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
      this.prisma.invoice.count({ where }),
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
  // SUMMARY
  // ===========================================================================

  async getSummary(clinicId: string) {
    const activeStatuses: InvoiceStatus[] = [
      InvoiceStatus.ISSUED,
      InvoiceStatus.PARTIALLY_PAID,
      InvoiceStatus.PAID,
    ];

    const [
      totalInvoices,
      draftInvoices,
      issuedInvoices,
      partiallyPaidInvoices,
      paidInvoices,
      cancelledInvoices,
      refundedInvoices,
      financials,
    ] = await this.prisma.$transaction([
      this.prisma.invoice.count({ where: { clinicId } }),
      this.prisma.invoice.count({
        where: { clinicId, status: InvoiceStatus.DRAFT },
      }),
      this.prisma.invoice.count({
        where: { clinicId, status: InvoiceStatus.ISSUED },
      }),
      this.prisma.invoice.count({
        where: { clinicId, status: InvoiceStatus.PARTIALLY_PAID },
      }),
      this.prisma.invoice.count({
        where: { clinicId, status: InvoiceStatus.PAID },
      }),
      this.prisma.invoice.count({
        where: { clinicId, status: InvoiceStatus.CANCELLED },
      }),
      this.prisma.invoice.count({
        where: { clinicId, status: InvoiceStatus.REFUNDED },
      }),
      this.prisma.invoice.aggregate({
        where: {
          clinicId,
          status: { in: activeStatuses },
        },
        _sum: {
          total: true,
          amountPaid: true,
          balanceDue: true,
        },
      }),
    ]);

    return {
      totalInvoices,
      draftInvoices,
      issuedInvoices,
      partiallyPaidInvoices,
      paidInvoices,
      cancelledInvoices,
      refundedInvoices,
      totalBilled: this.roundMoney(Number(financials._sum.total ?? 0)),
      totalCollected: this.roundMoney(Number(financials._sum.amountPaid ?? 0)),
      totalOutstanding: this.roundMoney(
        Number(financials._sum.balanceDue ?? 0),
      ),
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
  // UPDATE DRAFT
  // ===========================================================================

  async update(
    clinicId: string,
    id: string,
    dto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.getInvoiceForUpdate(clinicId, id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be updated');
    }

    if (dto.items) {
      this.validateManualItems(dto.items);

      const hasLinkedItems = invoice.items.some(
        (item) => item.labOrderItemId || item.pharmacyDispensingItemId,
      );

      if (hasLinkedItems) {
        throw new BadRequestException(
          'Invoice containing laboratory or pharmacy charges cannot replace its items. Add or remove manual items individually instead.',
        );
      }
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

    this.validateAdjustments(subtotal, discount, tax);

    const total = this.calculateTotal(subtotal, discount, tax);
    const amountPaid = this.roundMoney(Number(invoice.amountPaid));
    const balanceDue = this.roundMoney(Math.max(total - amountPaid, 0));

    const updatedInvoice = await this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.invoiceItem.deleteMany({
          where: {
            invoiceId: id,
            labOrderItemId: null,
            pharmacyDispensingItemId: null,
          },
        });

        await tx.invoiceItem.createMany({
          data: items.map((item) => ({
            invoiceId: id,
            description: item.description,
            quantity: this.decimal(this.roundQuantity(item.quantity)),
            unitPrice: this.decimal(this.roundMoney(item.unitPrice)),
            amount: this.decimal(
              this.roundMoney(
                this.roundQuantity(item.quantity) *
                  this.roundMoney(item.unitPrice),
              ),
            ),
          })),
        });
      }

      return tx.invoice.update({
        where: { id },
        data: {
          subtotal: this.decimal(subtotal),
          discount: this.decimal(discount),
          tax: this.decimal(tax),
          total: this.decimal(total),
          balanceDue: this.decimal(balanceDue),
          ...(dto.notes !== undefined && { notes: dto.notes }),
        },
        include: {
          items: true,
        },
      });
    });

    return this.mapInvoice(updatedInvoice);
  }

  // ===========================================================================
  // ADD MANUAL ITEM
  // ===========================================================================

  async addItem(
    clinicId: string,
    invoiceId: string,
    dto: CreateInvoiceItemDto,
  ): Promise<InvoiceResponseDto> {
    this.validateManualItem(dto);

    const invoice = await this.getInvoiceForUpdate(clinicId, invoiceId);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be modified');
    }

    const quantity = this.roundQuantity(dto.quantity);
    const unitPrice = this.roundMoney(dto.unitPrice);
    const amount = this.roundMoney(quantity * unitPrice);

    const subtotal = this.roundMoney(Number(invoice.subtotal) + amount);
    const discount = this.roundMoney(Number(invoice.discount));
    const tax = this.roundMoney(Number(invoice.tax));

    this.validateAdjustments(subtotal, discount, tax);

    const total = this.calculateTotal(subtotal, discount, tax);
    const amountPaid = this.roundMoney(Number(invoice.amountPaid));
    const balanceDue = this.roundMoney(Math.max(total - amountPaid, 0));

    const updatedInvoice = await this.prisma.$transaction(async (tx) => {
      await tx.invoiceItem.create({
        data: {
          invoiceId,
          description: dto.description,
          quantity: this.decimal(quantity),
          unitPrice: this.decimal(unitPrice),
          amount: this.decimal(amount),
        },
      });

      return tx.invoice.update({
        where: { id: invoiceId },
        data: {
          subtotal: this.decimal(subtotal),
          total: this.decimal(total),
          balanceDue: this.decimal(balanceDue),
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
    const invoice = await this.getInvoiceForUpdate(clinicId, invoiceId);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be modified');
    }

    const item = invoice.items.find((currentItem) => currentItem.id === itemId);

    if (!item) {
      throw new NotFoundException('Invoice item not found');
    }

    if (item.labOrderItemId || item.pharmacyDispensingItemId) {
      throw new BadRequestException(
        'Laboratory and pharmacy charges cannot be manually removed from an invoice',
      );
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

    this.validateAdjustments(subtotal, discount, tax);

    const total = this.calculateTotal(subtotal, discount, tax);
    const amountPaid = this.roundMoney(Number(invoice.amountPaid));
    const balanceDue = this.roundMoney(Math.max(total - amountPaid, 0));

    const updatedInvoice = await this.prisma.$transaction(async (tx) => {
      await tx.invoiceItem.delete({
        where: { id: itemId },
      });

      return tx.invoice.update({
        where: { id: invoiceId },
        data: {
          subtotal: this.decimal(subtotal),
          total: this.decimal(total),
          balanceDue: this.decimal(balanceDue),
        },
        include: {
          items: true,
        },
      });
    });

    return this.mapInvoice(updatedInvoice);
  }

  // ===========================================================================
  // ADD LAB ORDER ITEMS
  // ===========================================================================

  async addLabOrderItems(
    clinicId: string,
    invoiceId: string,
    labOrderId: string,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.getInvoiceForUpdate(clinicId, invoiceId);

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
  // ADD PHARMACY DISPENSING ITEMS
  // ===========================================================================

  async addPharmacyDispensingItems(
    clinicId: string,
    invoiceId: string,
    dispensingId: string,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.getInvoiceForUpdate(clinicId, invoiceId);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Pharmacy charges can only be added to a draft invoice',
      );
    }

    const dispensing = await this.prisma.pharmacyDispensing.findFirst({
      where: {
        id: dispensingId,
        clinicId,
      },
      include: {
        items: {
          include: {
            medicine: true,
            invoiceItem: true,
          },
        },
      },
    });

    if (!dispensing) {
      throw new NotFoundException('Pharmacy dispensing not found');
    }

    if (dispensing.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cannot add a cancelled pharmacy dispensing to an invoice',
      );
    }

    const unbilledItems = dispensing.items.filter((item) => !item.invoiceItem);

    if (unbilledItems.length === 0) {
      throw new ConflictException(
        'All medicines in this dispensing are already billed',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of unbilledItems) {
        await tx.invoiceItem.create({
          data: {
            invoiceId,
            pharmacyDispensingItemId: item.id,
            description: `Medicine - ${item.medicine.name}`,
            quantity: new Prisma.Decimal(item.quantity),
            unitPrice: item.unitPrice,
            amount: item.amount,
          },
        });
      }

      await this.recalculateInvoice(tx, invoiceId);
    });

    return this.findOne(clinicId, invoiceId);
  }

  // ===========================================================================
  // ISSUE
  // ===========================================================================

  async issue(clinicId: string, id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.getInvoiceForUpdate(clinicId, id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be issued');
    }

    if (invoice.items.length === 0) {
      throw new BadRequestException(
        'An invoice must contain at least one item',
      );
    }

    const subtotal = this.calculateItemSubtotalFromRecords(invoice.items);
    const discount = this.roundMoney(Number(invoice.discount));
    const tax = this.roundMoney(Number(invoice.tax));
    this.validateAdjustments(subtotal, discount, tax);

    const total = this.calculateTotal(subtotal, discount, tax);

    const updatedInvoice = await this.prisma.$transaction(async (tx) => {
      return tx.invoice.update({
        where: { id },
        data: {
          subtotal: this.decimal(subtotal),
          total: this.decimal(total),
          balanceDue: this.decimal(total),
          status: InvoiceStatus.ISSUED,
          issuedAt: new Date(),
        },
        include: {
          items: true,
        },
      });
    });

    return this.mapInvoice(updatedInvoice);
  }

  // ===========================================================================
  // CANCEL
  // ===========================================================================

  async cancel(clinicId: string, id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.getInvoiceForUpdate(clinicId, id);

    if (
      invoice.status === InvoiceStatus.PAID ||
      invoice.status === InvoiceStatus.PARTIALLY_PAID ||
      invoice.status === InvoiceStatus.REFUNDED
    ) {
      throw new BadRequestException(
        'An invoice with payment activity cannot be cancelled. Refund the payments first.',
      );
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Invoice is already cancelled');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
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
      type: invoice.type,
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

  // ===========================================================================
  // RECALCULATE
  // ===========================================================================

  private async recalculateInvoice(
    tx: Prisma.TransactionClient,
    invoiceId: string,
  ): Promise<void> {
    const items = await tx.invoiceItem.findMany({
      where: { invoiceId },
      select: { amount: true },
    });

    const subtotal = this.roundMoney(
      items.reduce((sum, item) => sum + Number(item.amount), 0),
    );

    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        discount: true,
        tax: true,
        amountPaid: true,
        status: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const discount = this.roundMoney(Number(invoice.discount));
    const tax = this.roundMoney(Number(invoice.tax));
    this.validateAdjustments(subtotal, discount, tax);

    const total = this.calculateTotal(subtotal, discount, tax);
    const amountPaid = this.roundMoney(Number(invoice.amountPaid));
    const balanceDue = this.roundMoney(Math.max(total - amountPaid, 0));

    let status = invoice.status;

    if (status !== InvoiceStatus.DRAFT && status !== InvoiceStatus.CANCELLED) {
      if (amountPaid === 0) {
        status = InvoiceStatus.ISSUED;
      } else if (balanceDue === 0) {
        status = InvoiceStatus.PAID;
      } else {
        status = InvoiceStatus.PARTIALLY_PAID;
      }
    }

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotal: this.decimal(subtotal),
        total: this.decimal(total),
        balanceDue: this.decimal(balanceDue),
        status,
      },
    });
  }

  // ===========================================================================
  // VALIDATION / HELPERS
  // ===========================================================================

  private async getInvoiceForUpdate(
    clinicId: string,
    id: string,
  ): Promise<InvoiceWithItems> {
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

    return invoice;
  }

  private validateManualItems(
    items: Array<{ description: string; quantity: number; unitPrice: number }>,
  ): void {
    if (items.length === 0) {
      throw new BadRequestException('At least one invoice item is required');
    }

    for (const item of items) {
      this.validateManualItem(item);
    }
  }

  private validateManualItem(item: {
    description: string;
    quantity: number;
    unitPrice: number;
  }): void {
    if (!item.description?.trim()) {
      throw new BadRequestException('Invoice item description is required');
    }

    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new BadRequestException(
        'Invoice item quantity must be greater than zero',
      );
    }

    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
      throw new BadRequestException(
        'Invoice item unit price cannot be negative',
      );
    }
  }

  private validateAdjustments(
    subtotal: number,
    discount: number,
    tax: number,
  ): void {
    if (!Number.isFinite(discount) || discount < 0) {
      throw new BadRequestException('Discount cannot be negative');
    }

    if (!Number.isFinite(tax) || tax < 0) {
      throw new BadRequestException('Tax cannot be negative');
    }

    if (discount > subtotal) {
      throw new BadRequestException('Discount cannot exceed subtotal');
    }
  }

  private calculateTotal(
    subtotal: number,
    discount: number,
    tax: number,
  ): number {
    return this.roundMoney(subtotal - discount + tax);
  }

  private calculateSubtotal(
    items: Array<{ quantity: number; unitPrice: number }>,
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

  private calculateItemSubtotalFromRecords(
    items: Array<{ amount: Prisma.Decimal }>,
  ): number {
    return this.roundMoney(
      items.reduce((total, item) => total + Number(item.amount), 0),
    );
  }

  private toInvoiceItemCreate(item: CreateInvoiceItemDto) {
    const quantity = this.roundQuantity(item.quantity);
    const unitPrice = this.roundMoney(item.unitPrice);
    const amount = this.roundMoney(quantity * unitPrice);

    return {
      description: item.description.trim(),
      quantity: this.decimal(quantity),
      unitPrice: this.decimal(unitPrice),
      amount: this.decimal(amount),
    };
  }

  private formatInvoiceNumber(sequence: number): string {
    const year = new Date().getFullYear();
    return `INV-${year}-${String(sequence).padStart(6, '0')}`;
  }

  private decimal(value: number): Prisma.Decimal {
    return new Prisma.Decimal(this.roundMoney(value).toFixed(2));
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private roundQuantity(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
