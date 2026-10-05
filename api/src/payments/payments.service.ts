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
    if (!Number.isFinite(dto.amount) || dto.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const amount = this.roundMoney(dto.amount);

    try {
      const payment = await this.prisma.$transaction(
        async (tx) => {
          /*
           * Read and validate the invoice inside the transaction.
           *
           * Serializable isolation prevents two concurrent payment requests
           * from both using the same outstanding balance.
           */
          const invoice = await tx.invoice.findFirst({
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

          const currentBalance = this.roundMoney(Number(invoice.balanceDue));

          if (currentBalance <= 0) {
            throw new BadRequestException('Invoice has no outstanding balance');
          }

          if (amount > currentBalance) {
            throw new BadRequestException(
              `Payment amount cannot exceed the outstanding balance of ${currentBalance.toFixed(2)}`,
            );
          }

          const currentAmountPaid = this.roundMoney(Number(invoice.amountPaid));

          const total = this.roundMoney(Number(invoice.total));

          const newAmountPaid = this.roundMoney(currentAmountPaid + amount);

          const newBalanceDue = this.roundMoney(
            Math.max(total - newAmountPaid, 0),
          );

          const newInvoiceStatus =
            newBalanceDue === 0
              ? InvoiceStatus.PAID
              : InvoiceStatus.PARTIALLY_PAID;

          const createdPayment = await tx.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: new Prisma.Decimal(amount.toFixed(2)),
              method: dto.method,
              status: PaymentStatus.SUCCESS,
              transactionReference: dto.transactionReference,
              notes: dto.notes,
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

          return createdPayment;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );

      return this.mapPayment(payment);
    } catch (error) {
      /*
       * Prisma uses P2034 when a serializable transaction conflicts with
       * another concurrent transaction. The request can safely be retried
       * by the caller using the current invoice balance.
       */
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new BadRequestException(
          'The invoice was updated by another payment. Please refresh and try again.',
        );
      }

      throw error;
    }
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
      ...(method && { method }),
      ...(status && { status }),
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
    try {
      const refundedPayment = await this.prisma.$transaction(
        async (tx) => {
          const payment = await tx.payment.findFirst({
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
            throw new BadRequestException(
              'Only successful payments can be refunded',
            );
          }

          const invoice = await tx.invoice.findUnique({
            where: {
              id: payment.invoiceId,
            },
          });

          if (!invoice) {
            throw new NotFoundException('Invoice not found');
          }

          if (invoice.status === InvoiceStatus.CANCELLED) {
            throw new BadRequestException(
              'Payments for a cancelled invoice cannot be refunded',
            );
          }

          const paymentAmount = this.roundMoney(Number(payment.amount));

          const currentAmountPaid = this.roundMoney(Number(invoice.amountPaid));

          if (paymentAmount > currentAmountPaid) {
            throw new BadRequestException(
              'Payment amount exceeds the invoice amount currently recorded as paid',
            );
          }

          const newAmountPaid = this.roundMoney(
            currentAmountPaid - paymentAmount,
          );

          const total = this.roundMoney(Number(invoice.total));

          const newBalanceDue = this.roundMoney(
            Math.max(total - newAmountPaid, 0),
          );

          /*
           * Determine whether this refund is a full invoice refund.
           *
           * If no successful payments remain after this refund, the invoice
           * is fully refunded. Otherwise its status reflects the remaining
           * amount paid.
           */
          const remainingSuccessfulPayments = await tx.payment.count({
            where: {
              invoiceId: invoice.id,
              status: PaymentStatus.SUCCESS,
              id: {
                not: payment.id,
              },
            },
          });

          let newInvoiceStatus: InvoiceStatus;

          if (remainingSuccessfulPayments === 0) {
            newInvoiceStatus = InvoiceStatus.REFUNDED;
          } else if (newBalanceDue === 0) {
            newInvoiceStatus = InvoiceStatus.PAID;
          } else {
            newInvoiceStatus = InvoiceStatus.PARTIALLY_PAID;
          }

          const updatedPayment = await tx.payment.update({
            where: {
              id: payment.id,
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
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );

      return this.mapPayment(refundedPayment);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new BadRequestException(
          'The payment or invoice was updated by another transaction. Please refresh and try again.',
        );
      }

      throw error;
    }
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
