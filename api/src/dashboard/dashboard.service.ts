import { Injectable } from '@nestjs/common';
import {
  AppointmentStatus,
  InvoiceStatus,
  LabOrderStatus,
  PaymentStatus,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PermissionCodes } from '../auth/constants/permission-codes';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(clinicId: string, userId: string) {
    const permissions = await this.getUserPermissions(clinicId, userId);

    const can = (permission: string) => permissions.has(permission);

    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const [
      patientCount,
      doctorCount,
      todayAppointments,
      recentPatients,
      pendingLabOrders,
      lowStockRows,
      revenue,
      outstandingBilling,
      recentActivitySources,
    ] = await Promise.all([
      can(PermissionCodes.PATIENT_READ)
        ? this.prisma.patient.count({
            where: {
              clinicId,
              isActive: true,
            },
          })
        : null,

      can(PermissionCodes.DOCTOR_READ)
        ? this.prisma.doctor.count({
            where: {
              clinicId,
              isActive: true,
            },
          })
        : null,

      can(PermissionCodes.APPOINTMENT_READ)
        ? this.prisma.appointment.findMany({
            where: {
              clinicId,
              appointmentDate: {
                gte: startOfToday,
                lt: startOfTomorrow,
              },
              status: {
                not: AppointmentStatus.CANCELLED,
              },
            },
            orderBy: [
              {
                startTime: 'asc',
              },
            ],
            take: 8,
            select: {
              id: true,
              appointmentNumber: true,
              appointmentDate: true,
              startTime: true,
              endTime: true,
              status: true,
              priority: true,
              type: true,
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
                  title: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          })
        : [],

      can(PermissionCodes.PATIENT_READ)
        ? this.prisma.patient.findMany({
            where: {
              clinicId,
              isActive: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 6,
            select: {
              id: true,
              patientNumber: true,
              firstName: true,
              lastName: true,
              phone: true,
              createdAt: true,
            },
          })
        : [],

      can(PermissionCodes.LAB_READ)
        ? this.prisma.labOrder.count({
            where: {
              clinicId,
              status: {
                in: [LabOrderStatus.PENDING, LabOrderStatus.IN_PROGRESS],
              },
            },
          })
        : null,

      can(PermissionCodes.INVENTORY_READ)
        ? this.prisma.medicineBatch.findMany({
            where: {
              clinicId,
              isActive: true,
            },
            select: {
              quantity: true,
              reorderLevel: true,
            },
          })
        : null,

      can(PermissionCodes.BILLING_READ)
        ? this.prisma.payment.aggregate({
            where: {
              invoice: {
                clinicId,
              },
              status: PaymentStatus.SUCCESS,
              paidAt: {
                gte: startOfToday,
                lt: startOfTomorrow,
              },
            },
            _sum: {
              amount: true,
            },
          })
        : null,

      can(PermissionCodes.BILLING_READ)
        ? this.prisma.invoice.aggregate({
            where: {
              clinicId,
              status: {
                in: [
                  InvoiceStatus.ISSUED,
                  InvoiceStatus.PARTIALLY_PAID,
                ],
              },
              balanceDue: {
                gt: 0,
              },
            },
            _sum: {
              balanceDue: true,
            },
            _count: {
              _all: true,
            },
          })
        : null,

      Promise.all([
        can(PermissionCodes.PATIENT_READ)
          ? this.prisma.patient.findMany({
              where: { clinicId },
              orderBy: { createdAt: 'desc' },
              take: 4,
              select: {
                id: true,
                patientNumber: true,
                firstName: true,
                lastName: true,
                createdAt: true,
              },
            })
          : [],
        can(PermissionCodes.APPOINTMENT_READ)
          ? this.prisma.appointment.findMany({
              where: { clinicId },
              orderBy: { createdAt: 'desc' },
              take: 4,
              select: {
                id: true,
                appointmentNumber: true,
                status: true,
                createdAt: true,
                patient: { select: { firstName: true, lastName: true } },
              },
            })
          : [],
        can(PermissionCodes.BILLING_READ)
          ? this.prisma.payment.findMany({
              where: {
                invoice: { clinicId },
                status: PaymentStatus.SUCCESS,
              },
              orderBy: { paidAt: 'desc' },
              take: 4,
              select: {
                id: true,
                amount: true,
                paidAt: true,
                invoice: {
                  select: {
                    invoiceNumber: true,
                    patient: { select: { firstName: true, lastName: true } },
                  },
                },
              },
            })
          : [],
        can(PermissionCodes.LAB_READ)
          ? this.prisma.labOrder.findMany({
              where: { clinicId },
              orderBy: { createdAt: 'desc' },
              take: 4,
              select: {
                id: true,
                status: true,
                createdAt: true,
                patient: { select: { firstName: true, lastName: true } },
              },
            })
          : [],
        can(PermissionCodes.INVENTORY_READ)
          ? this.prisma.inventoryTransaction.findMany({
              where: { clinicId },
              orderBy: { createdAt: 'desc' },
              take: 4,
              select: {
                id: true,
                type: true,
                quantity: true,
                createdAt: true,
                medicineBatch: {
                  select: { medicine: { select: { name: true } } },
                },
              },
            })
          : [],
      ]),
    ]);

    const [activityPatients, activityAppointments, activityPayments, activityLabs, activityInventory] = recentActivitySources;

    const recentActivity = [
      ...activityPatients.map((item) => ({
        id: `patient-${item.id}`,
        type: 'PATIENT',
        title: 'New patient registered',
        description: `${item.firstName} ${item.lastName} · ${item.patientNumber}`,
        createdAt: item.createdAt,
      })),
      ...activityAppointments.map((item) => ({
        id: `appointment-${item.id}`,
        type: 'APPOINTMENT',
        title: 'Appointment updated',
        description: `${item.patient.firstName} ${item.patient.lastName} · ${item.appointmentNumber} · ${item.status.replaceAll('_', ' ')}`,
        createdAt: item.createdAt,
      })),
      ...activityPayments.map((item) => ({
        id: `payment-${item.id}`,
        type: 'PAYMENT',
        title: 'Payment received',
        description: `${item.invoice.patient.firstName} ${item.invoice.patient.lastName} · ${item.invoice.invoiceNumber} · ₹${Number(item.amount).toFixed(0)}`,
        createdAt: item.paidAt,
      })),
      ...activityLabs.map((item) => ({
        id: `lab-${item.id}`,
        type: 'LAB',
        title: 'Lab order created',
        description: `${item.patient.firstName} ${item.patient.lastName} · ${item.status.replaceAll('_', ' ')}`,
        createdAt: item.createdAt,
      })),
      ...activityInventory.map((item) => ({
        id: `inventory-${item.id}`,
        type: 'INVENTORY',
        title: 'Inventory activity',
        description: `${item.medicineBatch.medicine.name} · ${item.type.replaceAll('_', ' ')} · ${item.quantity}`,
        createdAt: item.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 8);

    const appointmentStatusCounts = can(PermissionCodes.APPOINTMENT_READ)
      ? await this.prisma.appointment.groupBy({
          by: ['status'],
          where: {
            clinicId,
            appointmentDate: {
              gte: startOfToday,
              lt: startOfTomorrow,
            },
          },
          _count: {
            _all: true,
          },
        })
      : [];

    return {
      date: startOfToday.toISOString(),

      metrics: {
        patients: patientCount,
        doctors: doctorCount,
        todayAppointments: can(PermissionCodes.APPOINTMENT_READ)
          ? todayAppointments.length
          : null,
        pendingLabOrders,
        lowStockBatches: lowStockRows
          ? lowStockRows.filter(
              (batch) => batch.quantity <= batch.reorderLevel,
            ).length
          : null,
        collectedRevenue: revenue?._sum.amount
          ? Number(revenue._sum.amount)
          : revenue
            ? 0
            : null,
        outstandingBillingAmount: outstandingBilling?._sum.balanceDue
          ? Number(outstandingBilling._sum.balanceDue)
          : outstandingBilling
            ? 0
            : null,
        outstandingBillingInvoices: outstandingBilling?._count._all ?? null,
      },

      appointmentStatus: appointmentStatusCounts.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),

      todayAppointments: todayAppointments.map((appointment) => ({
        id: appointment.id,
        appointmentNumber: appointment.appointmentNumber,
        appointmentDate: appointment.appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        priority: appointment.priority,
        type: appointment.type,
        patient: {
          id: appointment.patient.id,
          patientNumber: appointment.patient.patientNumber,
          name: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        },
        doctor: {
          id: appointment.doctor.id,
          name: `${appointment.doctor.title} ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
        },
      })),

      recentActivity: recentActivity.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),

      recentPatients: recentPatients.map((patient) => ({
        id: patient.id,
        patientNumber: patient.patientNumber,
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone,
        createdAt: patient.createdAt,
      })),

      permissions: {
        patients: can(PermissionCodes.PATIENT_READ),
        appointments: can(PermissionCodes.APPOINTMENT_READ),
        doctors: can(PermissionCodes.DOCTOR_READ),
        laboratory: can(PermissionCodes.LAB_READ),
        inventory: can(PermissionCodes.INVENTORY_READ),
        billing: can(PermissionCodes.BILLING_READ),
        reports: can(PermissionCodes.REPORT_READ),
      },
    };
  }

  private async getUserPermissions(
    clinicId: string,
    userId: string,
  ): Promise<Set<string>> {
    const roles = await this.prisma.userRole.findMany({
      where: {
        userId,
        role: {
          clinicId,
          isActive: true,
        },
      },
      select: {
        role: {
          select: {
            permissions: {
              select: {
                permission: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const result = new Set<string>();

    for (const userRole of roles) {
      for (const rolePermission of userRole.role.permissions) {
        result.add(rolePermission.permission.code);
      }
    }

    return result;
  }
}
