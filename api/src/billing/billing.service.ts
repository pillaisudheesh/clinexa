import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, InvoiceType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(clinicId: string, dto: CreateInvoiceDto) {
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

    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: dto.appointmentId,
        clinicId,
        patientId: dto.patientId,
      },
    });

    if (!appointment) {
      throw new NotFoundException(
        'Appointment not found for the selected patient',
      );
    }

    const existingInvoice = await this.prisma.invoice.findFirst({
      where: {
        appointmentId: appointment.id,
        type: InvoiceType.CONSULTATION,
      },
    });

    if (existingInvoice) {
      throw new ConflictException(
        'An invoice already exists for this appointment',
      );
    }

    const subtotal = dto.items.reduce(
      (sum, item) =>
        sum.add(
          new Prisma.Decimal(item.quantity).mul(
            new Prisma.Decimal(item.unitPrice),
          ),
        ),
      new Prisma.Decimal(0),
    );

    const discount = new Prisma.Decimal(dto.discount ?? '0');
    const tax = new Prisma.Decimal(dto.tax ?? '0');

    const total = subtotal.sub(discount).add(tax);

    if (total.lessThan(0)) {
      throw new ConflictException('Invoice total cannot be negative');
    }

    return this.prisma.invoice.create({
      data: {
        invoiceNumber: await this.generateInvoiceNumber(clinicId),
        clinicId,
        patientId: dto.patientId,
        appointmentId: dto.appointmentId,

        status: 'DRAFT',

        subtotal,
        discount,
        tax,
        total,

        amountPaid: new Prisma.Decimal(0),
        balanceDue: total,

        notes: dto.notes,
        type: dto.type,

        items: {
          create: dto.items.map((item) => ({
            description: item.description,
            quantity: new Prisma.Decimal(item.quantity),
            unitPrice: new Prisma.Decimal(item.unitPrice),
            amount: new Prisma.Decimal(item.quantity).mul(
              new Prisma.Decimal(item.unitPrice),
            ),
            labOrderItemId: item.labOrderItemId,
            pharmacyDispensingItemId: item.pharmacyDispensingItemId,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async update(clinicId: string, invoiceId: string, dto: UpdateInvoiceDto) {
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

    if (
      invoice.status === 'PAID' ||
      invoice.status === 'CANCELLED' ||
      invoice.status === 'REFUNDED'
    ) {
      throw new ConflictException('This invoice cannot be modified');
    }

    const subtotal = invoice.items.reduce(
      (sum, item) => sum.add(item.amount),
      new Prisma.Decimal(0),
    );

    const discount =
      dto.discount !== undefined
        ? new Prisma.Decimal(dto.discount)
        : invoice.discount;

    const tax =
      dto.tax !== undefined ? new Prisma.Decimal(dto.tax) : invoice.tax;

    const total = subtotal.sub(discount).add(tax);

    if (total.lessThan(0)) {
      throw new ConflictException('Invoice total cannot be negative');
    }

    const balanceDue = total.sub(invoice.amountPaid);

    if (balanceDue.lessThan(0)) {
      throw new ConflictException(
        'Invoice total cannot be less than the amount already paid',
      );
    }

    return this.prisma.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        subtotal,
        discount,
        tax,
        total,
        balanceDue,
        ...(dto.notes !== undefined && {
          notes: dto.notes,
        }),
      },
      include: {
        items: true,
        payments: true,
      },
    });
  }

  async findAll(clinicId: string, query: InvoiceQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      clinicId,

      ...(query.status && {
        status: query.status,
      }),

      ...(query.patientId && {
        patientId: query.patientId,
      }),

      ...(query.search && {
        OR: [
          {
            invoiceNumber: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            patient: {
              firstName: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          },
          {
            patient: {
              lastName: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          appointment: {
            select: {
              id: true,
              appointmentDate: true,
              status: true,
            },
          },
          items: true,
          payments: true,
        },
      }),

      this.prisma.invoice.count({
        where,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(clinicId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        clinicId,
      },
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
        payments: {
          orderBy: {
            paidAt: 'desc',
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async createPayment(
    clinicId: string,
    invoiceId: string,
    dto: CreatePaymentDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: {
          id: invoiceId,
          clinicId,
        },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      if (invoice.status === 'CANCELLED' || invoice.status === 'REFUNDED') {
        throw new ConflictException('Payment cannot be added to this invoice');
      }

      const amount = new Prisma.Decimal(dto.amount);

      if (amount.greaterThan(invoice.balanceDue)) {
        throw new ConflictException(
          'Payment amount cannot exceed the balance due',
        );
      }

      const amountPaid = invoice.amountPaid.add(amount);
      const balanceDue = invoice.total.sub(amountPaid);

      const status = balanceDue.isZero()
        ? 'PAID'
        : amountPaid.greaterThan(0)
          ? 'PARTIALLY_PAID'
          : invoice.status;

      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          method: dto.method,
          transactionReference: dto.transactionReference,
          notes: dto.notes,
        },
      });

      const updatedInvoice = await tx.invoice.update({
        where: {
          id: invoiceId,
        },
        data: {
          amountPaid,
          balanceDue,
          status,
        },
        include: {
          items: true,
          payments: {
            orderBy: {
              paidAt: 'desc',
            },
          },
        },
      });

      return {
        payment,
        invoice: updatedInvoice,
      };
    });
  }

  async issue(clinicId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        clinicId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== 'DRAFT') {
      throw new ConflictException('Only draft invoices can be issued');
    }

    return this.prisma.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        status: 'ISSUED',
        issuedAt: new Date(),
      },
      include: {
        items: true,
        payments: true,
      },
    });
  }

  async cancel(clinicId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        clinicId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== 'DRAFT' && invoice.status !== 'ISSUED') {
      throw new ConflictException(
        'Only draft or issued invoices can be cancelled',
      );
    }

    return this.prisma.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        status: 'CANCELLED',
      },
      include: {
        items: true,
        payments: true,
      },
    });
  }

  private async generateInvoiceNumber(clinicId: string): Promise<string> {
    const clinic = await this.prisma.clinic.findUnique({
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

    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const startOfNextYear = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const count = await this.prisma.invoice.count({
      where: {
        clinicId,
        createdAt: {
          gte: startOfYear,
          lt: startOfNextYear,
        },
      },
    });

    return `INV-${clinic.code}-${year}-${String(count + 1).padStart(6, '0')}`;
  }
}
