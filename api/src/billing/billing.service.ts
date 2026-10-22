import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InvoiceStatus,
  InvoiceType,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBillingInvoiceDto } from './dto/create-invoice.dto';
import { UpdateBillingInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { CreateBillingPaymentDto } from './dto/create-payment.dto';

const ZERO = new Prisma.Decimal('0.00');

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(clinicId: string, dto: CreateBillingInvoiceDto) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, clinicId, isActive: true },
      select: { id: true },
    });
    if (!patient) throw new NotFoundException('Active patient not found');

    const appointment = await this.prisma.appointment.findFirst({
      where: { id: dto.appointmentId, clinicId, patientId: dto.patientId },
      select: { id: true },
    });
    if (!appointment) {
      throw new NotFoundException(
        'Appointment not found for the selected patient',
      );
    }

    const itemLinks = dto.items.map((item) => ({
      labOrderItemId: item.labOrderItemId,
      pharmacyDispensingItemId: item.pharmacyDispensingItemId,
    }));
    for (const item of itemLinks) {
      if (item.labOrderItemId && item.pharmacyDispensingItemId) {
        throw new BadRequestException(
          'An invoice item cannot reference both a lab item and a pharmacy dispensing item',
        );
      }
    }

    const labIds = [
      ...new Set(
        itemLinks
          .map((x) => x.labOrderItemId)
          .filter((x): x is string => Boolean(x)),
      ),
    ];
    const dispensingItemIds = [
      ...new Set(
        itemLinks
          .map((x) => x.pharmacyDispensingItemId)
          .filter((x): x is string => Boolean(x)),
      ),
    ];

    // A source item may be invoiced only once. Reject duplicates explicitly
    // instead of relying on the database's unique constraint to fail later.
    if (labIds.length !== itemLinks.filter((x) => x.labOrderItemId).length) {
      throw new BadRequestException(
        'A laboratory item can only be invoiced once',
      );
    }
    if (
      dispensingItemIds.length !==
      itemLinks.filter((x) => x.pharmacyDispensingItemId).length
    ) {
      throw new BadRequestException(
        'A pharmacy dispensing item can only be invoiced once',
      );
    }

    if (labIds.length) {
      const validLabItems = await this.prisma.labOrderItem.findMany({
        where: {
          id: { in: labIds },
          labOrder: {
            clinicId,
            patientId: dto.patientId,
            appointmentId: dto.appointmentId,
          },
        },
        select: { id: true },
      });
      if (validLabItems.length !== labIds.length) {
        throw new BadRequestException(
          'One or more laboratory items do not belong to this clinic, patient, and appointment',
        );
      }
    }

    if (dispensingItemIds.length) {
      const validDispensingItems =
        await this.prisma.pharmacyDispensingItem.findMany({
          where: {
            id: { in: dispensingItemIds },
            dispensing: {
              clinicId,
              prescription: {
                medicalRecord: {
                  patientId: dto.patientId,
                  appointmentId: dto.appointmentId,
                },
              },
            },
          },
          select: { id: true },
        });
      if (validDispensingItems.length !== dispensingItemIds.length) {
        throw new BadRequestException(
          'One or more pharmacy dispensing items do not belong to this clinic, patient, and appointment',
        );
      }
    }

    const subtotal = dto.items.reduce((sum, item) => {
      const quantity = new Prisma.Decimal(item.quantity);
      const unitPrice = new Prisma.Decimal(item.unitPrice);
      if (!quantity.greaterThan(0))
        throw new BadRequestException(
          'Invoice item quantity must be greater than zero',
        );
      if (unitPrice.lessThan(0))
        throw new BadRequestException(
          'Invoice item unit price cannot be negative',
        );
      return sum.add(quantity.mul(unitPrice).toDecimalPlaces(2));
    }, ZERO);
    const discount = new Prisma.Decimal(dto.discount ?? '0').toDecimalPlaces(2);
    const tax = new Prisma.Decimal(dto.tax ?? '0').toDecimalPlaces(2);
    if (discount.lessThan(0) || tax.lessThan(0))
      throw new BadRequestException('Discount and tax cannot be negative');
    if (discount.greaterThan(subtotal))
      throw new BadRequestException('Discount cannot exceed the subtotal');
    const total = subtotal.sub(discount).add(tax).toDecimalPlaces(2);

    return this.prisma.$transaction(
      async (tx) => {
        if (
          (dto.type ?? InvoiceType.CONSULTATION) === InvoiceType.CONSULTATION
        ) {
          const existing = await tx.invoice.findFirst({
            where: {
              clinicId,
              appointmentId: dto.appointmentId,
              type: InvoiceType.CONSULTATION,
              status: { not: InvoiceStatus.CANCELLED },
            },
            select: { id: true },
          });
          if (existing)
            throw new ConflictException(
              'A consultation invoice already exists for this appointment',
            );
        }

        const invoiceNumber = await this.generateInvoiceNumber(tx, clinicId);
        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            clinicId,
            patientId: dto.patientId,
            appointmentId: dto.appointmentId,
            status: InvoiceStatus.DRAFT,
            subtotal,
            discount,
            tax,
            total,
            amountPaid: ZERO,
            balanceDue: total,
            notes: dto.notes,
            type: dto.type ?? InvoiceType.CONSULTATION,
            items: {
              create: dto.items.map((item) => {
                const quantity = new Prisma.Decimal(item.quantity);
                const unitPrice = new Prisma.Decimal(item.unitPrice);
                return {
                  description: item.description,
                  quantity,
                  unitPrice,
                  amount: quantity.mul(unitPrice).toDecimalPlaces(2),
                  ...(item.labOrderItemId
                    ? { labOrderItem: { connect: { id: item.labOrderItemId } } }
                    : {}),
                  ...(item.pharmacyDispensingItemId
                    ? {
                        pharmacyDispensingItem: {
                          connect: { id: item.pharmacyDispensingItemId },
                        },
                      }
                    : {}),
                };
              }),
            },
          },
          include: { items: true, patient: true },
        });
        await this.writeAudit(tx, clinicId, 'CREATE', invoice.id, {
          invoiceNumber,
          total: total.toString(),
          type: invoice.type,
        });
        return invoice;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async update(
    clinicId: string,
    invoiceId: string,
    dto: UpdateBillingInvoiceDto,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const invoice = await tx.invoice.findFirst({
          where: { id: invoiceId, clinicId },
          include: { items: true },
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        if (
          invoice.status !== InvoiceStatus.DRAFT &&
          invoice.status !== InvoiceStatus.ISSUED
        ) {
          throw new ConflictException(
            'Only draft or issued invoices can be modified',
          );
        }
        const subtotal = invoice.items
          .reduce((sum, item) => sum.add(item.amount), ZERO)
          .toDecimalPlaces(2);
        const discount =
          dto.discount !== undefined
            ? new Prisma.Decimal(dto.discount).toDecimalPlaces(2)
            : invoice.discount;
        const tax =
          dto.tax !== undefined
            ? new Prisma.Decimal(dto.tax).toDecimalPlaces(2)
            : invoice.tax;
        if (discount.lessThan(0) || tax.lessThan(0))
          throw new BadRequestException('Discount and tax cannot be negative');
        if (discount.greaterThan(subtotal))
          throw new BadRequestException('Discount cannot exceed the subtotal');
        const total = subtotal.sub(discount).add(tax).toDecimalPlaces(2);
        const balanceDue = total.sub(invoice.amountPaid).toDecimalPlaces(2);
        if (balanceDue.lessThan(0))
          throw new ConflictException(
            'Invoice total cannot be less than the amount already paid',
          );
        const updated = await tx.invoice.update({
          where: { id: invoiceId, clinicId },
          data: {
            subtotal,
            discount,
            tax,
            total,
            balanceDue,
            ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          },
          include: { items: true, payments: true },
        });
        await this.writeAudit(tx, clinicId, 'UPDATE', invoiceId, {
          changedFields: Object.keys(dto),
        });
        return updated;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async findAll(clinicId: string, query: InvoiceQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const where: Prisma.InvoiceWhereInput = {
      clinicId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.patientId ? { patientId: query.patientId } : {}),
      ...(query.search
        ? {
            OR: [
              {
                invoiceNumber: { contains: query.search, mode: 'insensitive' },
              },
              {
                patient: {
                  firstName: { contains: query.search, mode: 'insensitive' },
                },
              },
              {
                patient: {
                  lastName: { contains: query.search, mode: 'insensitive' },
                },
              },
              {
                patient: {
                  patientNumber: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              patientNumber: true,
              firstName: true,
              lastName: true,
            },
          },
          appointment: {
            select: { id: true, appointmentDate: true, status: true },
          },
          items: true,
          payments: { orderBy: { paidAt: 'desc' } },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(clinicId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, clinicId },
      include: {
        patient: {
          select: {
            id: true,
            patientNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            status: true,
            consultationFee: true,
          },
        },
        items: true,
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async createPayment(
    clinicId: string,
    invoiceId: string,
    dto: CreateBillingPaymentDto,
  ) {
    const amount = new Prisma.Decimal(dto.amount).toDecimalPlaces(2);
    if (!amount.greaterThan(0))
      throw new BadRequestException('Payment amount must be greater than zero');

    return this.prisma.$transaction(
      async (tx) => {
        // Serializable isolation prevents two concurrent payments from both using the same stale balance.
        const invoice = await tx.invoice.findFirst({
          where: { id: invoiceId, clinicId },
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        if (
          invoice.status !== InvoiceStatus.ISSUED &&
          invoice.status !== InvoiceStatus.PARTIALLY_PAID
        ) {
          throw new ConflictException(
            'Payments can only be recorded against issued invoices with an outstanding balance',
          );
        }
        if (!invoice.balanceDue.greaterThan(0))
          throw new ConflictException('Invoice has no outstanding balance');
        if (amount.greaterThan(invoice.balanceDue))
          throw new ConflictException(
            'Payment amount cannot exceed the balance due',
          );

        const amountPaid = invoice.amountPaid.add(amount).toDecimalPlaces(2);
        const balanceDue = invoice.total.sub(amountPaid).toDecimalPlaces(2);
        const status = balanceDue.isZero()
          ? InvoiceStatus.PAID
          : InvoiceStatus.PARTIALLY_PAID;
        const payment = await tx.payment.create({
          data: {
            invoiceId,
            amount,
            method: dto.method,
            transactionReference: dto.transactionReference,
            notes: dto.notes,
            status: PaymentStatus.SUCCESS,
          },
        });
        const updatedInvoice = await tx.invoice.update({
          where: { id: invoiceId, clinicId },
          data: { amountPaid, balanceDue, status },
          include: {
            items: true,
            payments: { orderBy: { paidAt: 'desc' } },
          },
        });
        await this.writeAudit(tx, clinicId, 'PAYMENT_RECORDED', invoiceId, {
          paymentId: payment.id,
          amount: amount.toString(),
          balanceDue: balanceDue.toString(),
        });
        return { payment, invoice: updatedInvoice };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async issue(clinicId: string, invoiceId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const invoice = await tx.invoice.findFirst({
          where: { id: invoiceId, clinicId },
          include: { items: true },
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        if (invoice.status !== InvoiceStatus.DRAFT)
          throw new ConflictException('Only draft invoices can be issued');
        if (!invoice.items.length)
          throw new ConflictException(
            'An invoice must have at least one item before it can be issued',
          );
        if (invoice.total.lessThan(0))
          throw new ConflictException('Invoice total cannot be negative');
        const updated = await tx.invoice.update({
          where: { id: invoiceId, clinicId },
          data: { status: InvoiceStatus.ISSUED, issuedAt: new Date() },
          include: { items: true, payments: true },
        });
        await this.writeAudit(tx, clinicId, 'ISSUE', invoiceId, {
          invoiceNumber: invoice.invoiceNumber,
        });
        return updated;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async cancel(clinicId: string, invoiceId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const invoice = await tx.invoice.findFirst({
          where: { id: invoiceId, clinicId },
          include: { payments: true },
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        if (
          invoice.status !== InvoiceStatus.DRAFT &&
          invoice.status !== InvoiceStatus.ISSUED
        ) {
          throw new ConflictException(
            'Only draft or issued invoices can be cancelled',
          );
        }
        if (
          invoice.payments.some(
            (payment) =>
              payment.status === PaymentStatus.SUCCESS ||
              payment.status === PaymentStatus.PAID ||
              payment.status === PaymentStatus.PARTIALLY_PAID,
          )
        ) {
          throw new ConflictException(
            'An invoice with recorded payments cannot be cancelled; use the refund workflow',
          );
        }
        const updated = await tx.invoice.update({
          where: { id: invoiceId, clinicId },
          data: { status: InvoiceStatus.CANCELLED },
          include: { items: true, payments: true },
        });
        await this.writeAudit(tx, clinicId, 'CANCEL', invoiceId, {
          invoiceNumber: invoice.invoiceNumber,
        });
        return updated;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  private async generateInvoiceNumber(
    tx: Prisma.TransactionClient,
    clinicId: string,
  ): Promise<string> {
    // Use the persisted clinic counter and skip numbers already in use by
    // invoices created before the counter was introduced or synchronized.
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

  private async writeAudit(
    tx: Prisma.TransactionClient,
    clinicId: string,
    action: string,
    entityId: string,
    details: Record<string, unknown>,
  ) {
    await tx.auditLog.create({
      data: {
        clinicId,
        action,
        entity: 'Invoice',
        entityId,
        details: details as Prisma.InputJsonObject,
      },
    });
  }
}
