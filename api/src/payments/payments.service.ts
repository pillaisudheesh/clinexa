import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InvoiceStatus, PaymentStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

type PaymentRecord = Prisma.PaymentGetPayload<{
  select: {
    id: true;
    invoiceId: true;
    amount: true;
    method: true;
    status: true;
    transactionReference: true;
    notes: true;
    paidAt: true;
    createdAt: true;
  };
}>;

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // CREATE PAYMENT
  // ===========================================================================

  async create(
    clinicId: string,
    dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    if (dto.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: dto.invoiceId,
        clinicId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (
      invoice.status === InvoiceStatus.CANCELLED ||
      invoice.status === InvoiceStatus.REFUNDED
    ) {
      throw new BadRequestException(
        'Payments cannot be added to a cancelled or refunded invoice',
      );
    }

    if (invoice.status === InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Invoice must be issued before accepting payment',
      );
    }

    const amount = this.roundMoney(dto.amount);

    const balanceDue = this.roundMoney(Number(invoice.balanceDue));

    if (amount > balanceDue) {
      throw new BadRequestException(
        `Payment amount cannot exceed the outstanding balance of ${balanceDue.toFixed(2)}`,
      );
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      /*
       * Re-read the invoice inside the transaction.
       *
       * This ensures that the balance we use is current
       * when multiple payment requests arrive close together.
       */
      const currentInvoice = await tx.invoice.findUnique({
        where: {
          id: invoice.id,
        },
      });

      if (!currentInvoice) {
        throw new NotFoundException('Invoice not found');
      }

      if (
        currentInvoice.status === InvoiceStatus.CANCELLED ||
        currentInvoice.status === InvoiceStatus.REFUNDED
      ) {
        throw new BadRequestException(
          'Payments cannot be added to this invoice',
        );
      }

      const currentBalance = this.roundMoney(Number(currentInvoice.balanceDue));

      if (amount > currentBalance) {
        throw new BadRequestException(
          `Payment amount cannot exceed the outstanding balance of ${currentBalance.toFixed(2)}`,
        );
      }

      const currentAmountPaid = this.roundMoney(
        Number(currentInvoice.amountPaid),
      );

      const newAmountPaid = this.roundMoney(currentAmountPaid + amount);

      const newBalanceDue = this.roundMoney(
        Number(currentInvoice.total) - newAmountPaid,
      );

      const newInvoiceStatus =
        newBalanceDue === 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

      const createdPayment = await tx.payment.create({
        data: {
          invoiceId: currentInvoice.id,

          amount: new Prisma.Decimal(amount.toFixed(2)),

          method: dto.method,

          status: PaymentStatus.SUCCESS,

          transactionReference: dto.transactionReference,

          notes: dto.notes,
        },
      });

      await tx.invoice.update({
        where: {
          id: currentInvoice.id,
        },

        data: {
          amountPaid: new Prisma.Decimal(newAmountPaid.toFixed(2)),

          balanceDue: new Prisma.Decimal(newBalanceDue.toFixed(2)),

          status: newInvoiceStatus,
        },
      });

      return createdPayment;
    });

    return this.mapPayment(payment);
  }

  // ===========================================================================
  // LIST PAYMENTS FOR INVOICE
  // ===========================================================================

  async findByInvoice(
    clinicId: string,
    invoiceId: string,
    query: PaymentQueryDto,
  ): Promise<PaginatedResponseDto<PaymentResponseDto>> {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        clinicId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const { page = 1, limit = 10, method, status } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      invoiceId,

      ...(method && {
        method,
      }),

      ...(status && {
        status,
      }),
    };

    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,

        orderBy: {
          paidAt: 'desc',
        },
      }),

      this.prisma.payment.count({
        where,
      }),
    ]);

    return {
      data: payments.map((payment) => this.mapPayment(payment)),

      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  // GET PAYMENT
  // ===========================================================================

  async findOne(clinicId: string, id: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        invoice: {
          clinicId,
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.mapPayment(payment);
  }

  // ===========================================================================
  // REFUND
  // ===========================================================================

  async refund(clinicId: string, id: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        invoice: {
          clinicId,
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Payment has already been refunded');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    const refundedPayment = await this.prisma.$transaction(async (tx) => {
      const currentPayment = await tx.payment.findUnique({
        where: {
          id: payment.id,
        },
      });

      if (!currentPayment) {
        throw new NotFoundException('Payment not found');
      }

      if (currentPayment.status !== PaymentStatus.SUCCESS) {
        throw new BadRequestException(
          'Only successful payments can be refunded',
        );
      }

      const invoice = await tx.invoice.findUnique({
        where: {
          id: currentPayment.invoiceId,
        },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      const paymentAmount = Number(currentPayment.amount);

      const currentAmountPaid = Number(invoice.amountPaid);

      const newAmountPaid = this.roundMoney(
        Math.max(currentAmountPaid - paymentAmount, 0),
      );

      const total = Number(invoice.total);

      const newBalanceDue = this.roundMoney(total - newAmountPaid);

      let newInvoiceStatus: InvoiceStatus;

      if (newAmountPaid === 0) {
        newInvoiceStatus = InvoiceStatus.ISSUED;
      } else if (newBalanceDue > 0) {
        newInvoiceStatus = InvoiceStatus.PARTIALLY_PAID;
      } else {
        newInvoiceStatus = InvoiceStatus.PAID;
      }

      const updatedPayment = await tx.payment.update({
        where: {
          id: currentPayment.id,
        },

        data: {
          status: PaymentStatus.REFUNDED,
        },
      });

      await tx.invoice.update({
        where: {
          id: invoice.id,
        },

        data: {
          amountPaid: new Prisma.Decimal(newAmountPaid.toFixed(2)),

          balanceDue: new Prisma.Decimal(newBalanceDue.toFixed(2)),

          status: newInvoiceStatus,
        },
      });

      return updatedPayment;
    });

    return this.mapPayment(refundedPayment);
  }

  // ===========================================================================
  // RESPONSE MAPPER
  // ===========================================================================

  private mapPayment(payment: PaymentRecord): PaymentResponseDto {
    return {
      id: payment.id,

      invoiceId: payment.invoiceId,

      amount: Number(payment.amount),

      method: payment.method,

      status: payment.status,

      transactionReference: payment.transactionReference,

      notes: payment.notes,

      paidAt: payment.paidAt,

      createdAt: payment.createdAt,
    };
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
