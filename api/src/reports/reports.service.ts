import { Injectable } from '@nestjs/common';
import {
  InvoiceStatus,
  PaymentStatus,
  PharmacyDispensingStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(clinicId: string, query: ReportQueryDto) {
    const { from, to, days } = this.resolveRange(query);

    const [
      newPatients,
      appointments,
      appointmentStatuses,
      invoices,
      payments,
      labOrders,
      labStatuses,
      dispensing,
      inventory,
      dailyPayments,
      dailyAppointments,
    ] = await Promise.all([
      this.prisma.patient.count({ where: { clinicId, createdAt: { gte: from, lt: to } } }),
      this.prisma.appointment.count({ where: { clinicId, appointmentDate: { gte: from, lt: to } } }),
      this.prisma.appointment.groupBy({ by: ['status'], where: { clinicId, appointmentDate: { gte: from, lt: to } }, _count: { _all: true } }),
      this.prisma.invoice.aggregate({
        where: { clinicId, createdAt: { gte: from, lt: to }, status: { notIn: [InvoiceStatus.DRAFT, InvoiceStatus.CANCELLED, InvoiceStatus.REFUNDED] } },
        _sum: { total: true, balanceDue: true },
        _count: { _all: true },
      }),
      this.prisma.payment.aggregate({
        where: { invoice: { clinicId }, paidAt: { gte: from, lt: to }, status: PaymentStatus.SUCCESS },
        _sum: { amount: true }, _count: { _all: true },
      }),
      this.prisma.labOrder.count({ where: { clinicId, createdAt: { gte: from, lt: to } } }),
      this.prisma.labOrder.groupBy({ by: ['status'], where: { clinicId, createdAt: { gte: from, lt: to } }, _count: { _all: true } }),
      this.prisma.pharmacyDispensing.groupBy({ by: ['status'], where: { clinicId, createdAt: { gte: from, lt: to } }, _count: { _all: true } }),
      this.prisma.inventoryTransaction.groupBy({ by: ['type'], where: { clinicId, createdAt: { gte: from, lt: to } }, _count: { _all: true }, _sum: { quantity: true } }),
      this.prisma.payment.findMany({ where: { invoice: { clinicId }, paidAt: { gte: from, lt: to }, status: PaymentStatus.SUCCESS }, select: { amount: true, paidAt: true } }),
      this.prisma.appointment.findMany({ where: { clinicId, appointmentDate: { gte: from, lt: to } }, select: { appointmentDate: true } }),
    ]);

    const daily = days.map((date) => ({ date, revenue: 0, appointments: 0 }));
    const index = new Map(daily.map((item, position) => [item.date, position]));

    for (const payment of dailyPayments) {
      const position = index.get(this.dateKey(payment.paidAt));
      if (position !== undefined) daily[position].revenue += Number(payment.amount);
    }
    for (const appointment of dailyAppointments) {
      const position = index.get(this.dateKey(appointment.appointmentDate));
      if (position !== undefined) daily[position].appointments += 1;
    }

    return {
      fromDate: days[0],
      toDate: days[days.length - 1],
      totals: {
        newPatients,
        appointments,
        invoices: invoices._count._all,
        invoicedAmount: Number(invoices._sum.total ?? 0),
        collectedAmount: Number(payments._sum.amount ?? 0),
        invoicePayments: payments._count._all,
        outstandingAmount: Number(invoices._sum.balanceDue ?? 0),
        labOrders,
        dispensed: this.countStatus(dispensing, PharmacyDispensingStatus.COMPLETED),
      },
      appointmentsByStatus: appointmentStatuses.map((item) => ({ status: item.status, count: item._count._all })),
      labOrdersByStatus: labStatuses.map((item) => ({ status: item.status, count: item._count._all })),
      pharmacyByStatus: dispensing.map((item) => ({ status: item.status, count: item._count._all })),
      inventoryByType: inventory.map((item) => ({ status: item.type, count: item._count._all, quantity: item._sum.quantity ?? 0 })),
      daily,
    };
  }

  private resolveRange(query: ReportQueryDto) {
    const now = new Date();
    const start = query.fromDate ? new Date(`${query.fromDate}T00:00:00`) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const end = query.toDate ? new Date(`${query.toDate}T00:00:00`) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end.setDate(end.getDate() + 1);
    return { from: start, to: end, days: this.daysBetween(start, end) };
  }

  private daysBetween(start: Date, endExclusive: Date): string[] {
    const result: string[] = [];
    const cursor = new Date(start);
    while (cursor < endExclusive && result.length < 366) {
      result.push(this.dateKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }

  private dateKey(value: Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }

  private countStatus(rows: Array<{ status: string; _count: { _all: number } }>, status: string) {
    return rows.find((item) => item.status === status)?._count._all ?? 0;
  }
}
