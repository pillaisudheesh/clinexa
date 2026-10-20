import { BadRequestException, Injectable } from '@nestjs/common';
import {
  InvoiceStatus,
  PaymentStatus,
  PharmacyDispensingStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueryDto } from './dto/report-query.dto';
import {
  addCalendarDays,
  dateKeyInTimezone,
  dateOnlyUtcRange,
  parseDateKey,
  startOfDateInTimezone,
} from '../common/utils/timezone.util';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(clinicId: string, query: ReportQueryDto) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { timezone: true },
    });
    const timezone = clinic?.timezone || 'UTC';
    const { from, to, fromDate, toDate, days } = this.resolveRange(query, timezone);
    const appointmentFrom = dateOnlyUtcRange(fromDate).from;
    const appointmentTo = dateOnlyUtcRange(addCalendarDays(toDate, 1)).from;

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
      this.prisma.appointment.count({ where: { clinicId, appointmentDate: { gte: appointmentFrom, lt: appointmentTo } } }),
      this.prisma.appointment.groupBy({ by: ['status'], where: { clinicId, appointmentDate: { gte: appointmentFrom, lt: appointmentTo } }, _count: { _all: true } }),
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
      this.prisma.appointment.findMany({ where: { clinicId, appointmentDate: { gte: appointmentFrom, lt: appointmentTo } }, select: { appointmentDate: true } }),
    ]);

    const daily = days.map((date) => ({ date, revenue: 0, appointments: 0 }));
    const index = new Map(daily.map((item, position) => [item.date, position]));

    for (const payment of dailyPayments) {
      const position = index.get(dateKeyInTimezone(payment.paidAt, timezone));
      if (position !== undefined) daily[position].revenue += Number(payment.amount);
    }
    for (const appointment of dailyAppointments) {
      const position = index.get(appointment.appointmentDate.toISOString().slice(0, 10));
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

  private resolveRange(query: ReportQueryDto, timezone: string) {
    const today = dateKeyInTimezone(new Date(), timezone);
    const fromDate = query.fromDate ?? addCalendarDays(today, -6);
    const toDate = query.toDate ?? today;

    try {
      parseDateKey(fromDate);
      parseDateKey(toDate);
    } catch {
      throw new BadRequestException('Report dates must use valid YYYY-MM-DD calendar dates');
    }
    if (fromDate > toDate) {
      throw new BadRequestException('fromDate must be on or before toDate');
    }
    const dayCount = Math.round(
      (Date.parse(`${toDate}T00:00:00Z`) - Date.parse(`${fromDate}T00:00:00Z`)) / 86_400_000,
    ) + 1;
    if (dayCount > 366) {
      throw new BadRequestException('Report date range cannot exceed 366 days');
    }

    const days: string[] = [];
    for (let i = 0; i < dayCount; i += 1) days.push(addCalendarDays(fromDate, i));
    return {
      from: startOfDateInTimezone(fromDate, timezone),
      to: startOfDateInTimezone(addCalendarDays(toDate, 1), timezone),
      fromDate,
      toDate,
      days,
    };
  }

  private countStatus(rows: Array<{ status: string; _count: { _all: number } }>, status: string) {
    return rows.find((item) => item.status === status)?._count._all ?? 0;
  }
}
