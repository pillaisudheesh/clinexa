import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InventoryTransactionType,
  PharmacyDispensingStatus,
  InvoiceType,
  InvoiceStatus,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { DispensePrescriptionDto } from './dto/dispense-prescription.dto';
import {
  DispensingItemResponseDto,
  DispensingResponseDto,
} from './dto/dispensing-response.dto';

@Injectable()
export class DispensingService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // DISPENSE
  // ===========================================================================

  async dispense(
    clinicId: string,
    prescriptionId: string,
    dto: DispensePrescriptionDto,
  ): Promise<DispensingResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      // -----------------------------------------------------------------------
      // 1. Find prescription and verify clinic ownership
      // -----------------------------------------------------------------------

      const prescription = await tx.prescription.findFirst({
        where: {
          id: prescriptionId,
          medicalRecord: {
            patient: {
              clinicId,
            },
          },
        },
        include: {
          medicine: true,
          medicalRecord: {
            select: {
              appointmentId: true,
              patientId: true,
            },
          },
        },
      });

      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      // -----------------------------------------------------------------------
      // 2. Load an existing dispensing, if this is a subsequent partial issue
      // -----------------------------------------------------------------------

      const existing = await tx.pharmacyDispensing.findUnique({
        where: {
          prescriptionId,
        },
        select: {
          id: true,
          invoiceId: true,
          status: true,
          items: {
            select: {
              quantity: true,
            },
          },
        },
      });

      if (existing?.status === PharmacyDispensingStatus.COMPLETED) {
        throw new ConflictException(
          'This prescription has already been fully dispensed',
        );
      }

      if (existing?.status === PharmacyDispensingStatus.CANCELLED) {
        throw new ConflictException(
          'A cancelled dispensing cannot be resumed; create a new prescription if medicine is still required',
        );
      }

      if (
        existing?.invoiceId &&
        dto.invoiceId &&
        existing.invoiceId !== dto.invoiceId
      ) {
        throw new BadRequestException(
          'All partial dispensing charges must use the same invoice',
        );
      }

      let invoiceId = dto.invoiceId ?? existing?.invoiceId;

      if (!invoiceId) {
        const invoiceNumber = await this.generateInvoiceNumber(tx, clinicId);

        const invoice = await tx.invoice.create({
          data: {
            clinicId,
            patientId: prescription.medicalRecord.patientId,
            appointmentId: prescription.medicalRecord.appointmentId,
            invoiceNumber,
            type: InvoiceType.PHARMACY,
            status: InvoiceStatus.DRAFT,
            subtotal: 0,
            discount: 0,
            tax: 0,
            total: 0,
            amountPaid: 0,
            balanceDue: 0,
          },
          select: {
            id: true,
          },
        });

        invoiceId = invoice.id;
      }

      let pharmacyInvoiceId = invoiceId;

      if (!pharmacyInvoiceId) {
        const invoiceNumber = await this.generateInvoiceNumber(tx, clinicId);

        const pharmacyInvoice = await tx.invoice.create({
          data: {
            clinicId,
            patientId: prescription.medicalRecord.appointmentId
              ? prescription.medicalRecord.appointmentId
              : '',
            appointmentId: prescription.medicalRecord.appointmentId,
            invoiceNumber,
            type: InvoiceType.PHARMACY,
            status: InvoiceStatus.DRAFT,
            subtotal: 0,
            discount: 0,
            tax: 0,
            total: 0,
            amountPaid: 0,
            balanceDue: 0,
          },
          select: {
            id: true,
          },
        });

        pharmacyInvoiceId = pharmacyInvoice.id;
      }

      // -----------------------------------------------------------------------
      // 3. Parse prescription quantity
      // -----------------------------------------------------------------------

      const prescribedQuantity = this.parseQuantity(prescription.quantity);
      const alreadyDispensed =
        existing?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
      const outstandingQuantity = prescribedQuantity - alreadyDispensed;

      if (outstandingQuantity <= 0) {
        throw new ConflictException(
          'This prescription has already been fully dispensed',
        );
      }

      const requestedQuantity = dto.quantity ?? outstandingQuantity;

      if (requestedQuantity > outstandingQuantity) {
        throw new BadRequestException(
          `Requested dispensing quantity ${requestedQuantity} exceeds the outstanding quantity of ${outstandingQuantity}`,
        );
      }

      // -----------------------------------------------------------------------
      // 4. Validate invoice if supplied
      // -----------------------------------------------------------------------

      if (invoiceId) {
        const invoice = await tx.invoice.findFirst({
          where: {
            id: invoiceId,
            clinicId,
          },
          select: {
            id: true,
            status: true,
          },
        });

        if (!invoice) {
          throw new NotFoundException('Invoice not found');
        }

        if (invoice.status !== 'DRAFT') {
          throw new BadRequestException(
            'Pharmacy charges can only be added to a draft invoice',
          );
        }
      }

      // -----------------------------------------------------------------------
      // 5. Find available batches using FEFO
      // -----------------------------------------------------------------------

      const now = new Date();

      const batches = await tx.medicineBatch.findMany({
        where: {
          clinicId,

          medicineId: prescription.medicineId,

          isActive: true,

          expiryDate: {
            gt: now,
          },

          quantity: {
            gt: 0,
          },
        },

        orderBy: [
          {
            expiryDate: 'asc',
          },
          {
            createdAt: 'asc',
          },
        ],
      });

      const totalAvailable = batches.reduce(
        (total, batch) => total + batch.quantity,
        0,
      );

      if (totalAvailable < requestedQuantity) {
        throw new BadRequestException(
          `Insufficient stock. Required: ${requestedQuantity}, available: ${totalAvailable}`,
        );
      }

      // -----------------------------------------------------------------------
      // 6. Create dispensing record
      // -----------------------------------------------------------------------

      const dispensing = existing
        ? await tx.pharmacyDispensing.update({
            where: { id: existing.id },
            data: {
              ...(invoiceId && !existing.invoiceId ? { invoiceId } : {}),
            },
          })
        : await tx.pharmacyDispensing.create({
            data: {
              clinicId,
              prescriptionId,
              invoiceId,
              status: PharmacyDispensingStatus.PARTIALLY_DISPENSED,
            },
          });

      // -----------------------------------------------------------------------
      // 7. Allocate stock using FEFO
      // -----------------------------------------------------------------------

      let remaining = requestedQuantity;
      const dispensingItemIds: string[] = [];

      for (const batch of batches) {
        if (remaining <= 0) {
          break;
        }

        const quantityToDispense = Math.min(remaining, batch.quantity);

        const newQuantity = batch.quantity - quantityToDispense;

        const unitPrice = batch.sellingPrice;

        const amount = unitPrice.mul(quantityToDispense);

        // ---------------------------------------------------------------------
        // Update stock
        // ---------------------------------------------------------------------

        const stockUpdate = await tx.medicineBatch.updateMany({
          where: {
            id: batch.id,
            clinicId,
            isActive: true,
            expiryDate: { gt: now },
            quantity: { gte: quantityToDispense },
          },
          data: { quantity: newQuantity },
        });

        if (stockUpdate.count !== 1) {
          throw new ConflictException(
            `Stock changed while dispensing batch ${batch.batchNumber}; please retry`,
          );
        }

        // ---------------------------------------------------------------------
        // Inventory audit
        // ---------------------------------------------------------------------

        await tx.inventoryTransaction.create({
          data: {
            clinicId,

            medicineBatchId: batch.id,

            type: InventoryTransactionType.DISPENSE,

            quantity: quantityToDispense,

            previousQuantity: batch.quantity,

            newQuantity,

            referenceId: dispensing.id,

            notes: dto.notes ?? `Dispensed for prescription ${prescription.id}`,
          },
        });

        // ---------------------------------------------------------------------
        // Dispensing item
        // ---------------------------------------------------------------------

        const dispensingItem = await tx.pharmacyDispensingItem.create({
          data: {
            dispensingId: dispensing.id,

            medicineId: prescription.medicineId,

            medicineBatchId: batch.id,

            quantity: quantityToDispense,

            unitPrice,

            amount,
          },
        });

        dispensingItemIds.push(dispensingItem.id);

        remaining -= quantityToDispense;
      }

      // -----------------------------------------------------------------------
      // 8. Add pharmacy charges to invoice
      // -----------------------------------------------------------------------

      const dispensingStatus =
        alreadyDispensed + requestedQuantity === prescribedQuantity
          ? PharmacyDispensingStatus.COMPLETED
          : PharmacyDispensingStatus.PARTIALLY_DISPENSED;

      await tx.pharmacyDispensing.update({
        where: { id: dispensing.id },
        data: { status: dispensingStatus },
      });

      if (invoiceId) {
        await this.addToInvoice(tx, clinicId, invoiceId, dispensingItemIds);
      }

      // -----------------------------------------------------------------------
      // 9. Load final dispensing record
      // -----------------------------------------------------------------------

      const result = await tx.pharmacyDispensing.findUnique({
        where: {
          id: dispensing.id,
        },

        include: {
          invoice: {
            select: {
              invoiceNumber: true,
            },
          },
          items: {
            include: {
              medicine: true,
              medicineBatch: true,
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Dispensing record not found');
      }

      return this.mapDispensing(result);
    });
  }

  // ===========================================================================
  // ADD TO INVOICE
  // ===========================================================================

  private async addToInvoice(
    tx: Prisma.TransactionClient,
    clinicId: string,
    invoiceId: string,
    dispensingItemIds: string[],
  ): Promise<void> {
    const invoice = await tx.invoice.findFirst({
      where: {
        id: invoiceId,
        clinicId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException(
        'Pharmacy charges can only be added to a draft invoice',
      );
    }

    const items = await tx.pharmacyDispensingItem.findMany({
      where: {
        id: { in: dispensingItemIds },
      },
      include: {
        medicine: true,
      },
    });

    for (const item of items) {
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
  }

  // ===========================================================================
  // RECALCULATE INVOICE
  // ===========================================================================

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
        amountPaid: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const discount = invoice.discount ?? new Prisma.Decimal(0);

    const tax = invoice.tax ?? new Prisma.Decimal(0);

    const total = subtotal.sub(discount).add(tax);
    const balanceDue = total.sub(invoice.amountPaid);

    await tx.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        subtotal,
        total,
        balanceDue,
      },
    });
  }

  // ===========================================================================
  // GET BY PRESCRIPTION
  // ===========================================================================

  async findByPrescription(
    clinicId: string,
    prescriptionId: string,
  ): Promise<DispensingResponseDto> {
    const dispensing = await this.prisma.pharmacyDispensing.findFirst({
      where: {
        clinicId,
        prescriptionId,
      },

      include: {
        invoice: {
          select: {
            invoiceNumber: true,
          },
        },
        items: {
          include: {
            medicine: true,
            medicineBatch: true,
          },
        },
      },
    });

    if (!dispensing) {
      throw new NotFoundException('Dispensing record not found');
    }

    return this.mapDispensing(dispensing);
  }

  // ===========================================================================
  // QUANTITY PARSER
  // ===========================================================================

  private parseQuantity(value: string | null): number {
    if (!value) {
      throw new BadRequestException(
        'Prescription quantity is required for dispensing',
      );
    }

    const match = value.match(/\d+/);

    if (!match) {
      throw new BadRequestException(
        `Unable to determine quantity from prescription quantity "${value}"`,
      );
    }

    const quantity = Number(match[0]);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException(
        'Prescription quantity must be a positive integer',
      );
    }

    return quantity;
  }

  // ===========================================================================
  // CANCEL DISPENSING
  // ===========================================================================

  async cancel(clinicId: string, id: string): Promise<DispensingResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      // -----------------------------------------------------------------------
      // 1. Find dispensing record
      // -----------------------------------------------------------------------

      const dispensing = await tx.pharmacyDispensing.findFirst({
        where: {
          id,
          clinicId,
        },
        include: {
          items: {
            include: {
              medicine: true,
              medicineBatch: true,
            },
          },
        },
      });

      if (!dispensing) {
        throw new NotFoundException('Dispensing record not found');
      }

      // -----------------------------------------------------------------------
      // 2. Prevent duplicate cancellation
      // -----------------------------------------------------------------------

      if (dispensing.status === PharmacyDispensingStatus.CANCELLED) {
        throw new ConflictException('Dispensing has already been cancelled');
      }

      // -----------------------------------------------------------------------
      // 3. Validate invoice
      // -----------------------------------------------------------------------

      if (dispensing.invoiceId) {
        await tx.invoiceItem.deleteMany({
          where: {
            invoiceId: dispensing.invoiceId,
            pharmacyDispensingItemId: {
              in: dispensing.items.map((item) => item.id),
            },
          },
        });

        // ---------------------------------------------------------------------
        // Recalculate invoice
        // ---------------------------------------------------------------------

        await this.recalculateInvoice(tx, dispensing.invoiceId);

        // ---------------------------------------------------------------------
        // Cancel invoice when no charges remain
        // ---------------------------------------------------------------------

        const remainingInvoiceItems = await tx.invoiceItem.count({
          where: {
            invoiceId: dispensing.invoiceId,
          },
        });

        if (remainingInvoiceItems === 0) {
          await tx.invoice.update({
            where: {
              id: dispensing.invoiceId,
            },
            data: {
              status: InvoiceStatus.CANCELLED,
            },
          });
        }
      }

      // -----------------------------------------------------------------------
      // 4. Restore stock to the exact batches
      // -----------------------------------------------------------------------

      for (const item of dispensing.items) {
        const batch = await tx.medicineBatch.findFirst({
          where: {
            id: item.medicineBatchId,
            clinicId,
          },
        });

        if (!batch) {
          throw new NotFoundException(
            `Medicine batch ${item.medicineBatch.batchNumber} not found`,
          );
        }

        const newQuantity = batch.quantity + item.quantity;

        // ---------------------------------------------------------------------
        // Restore stock
        // ---------------------------------------------------------------------

        await tx.medicineBatch.update({
          where: {
            id: batch.id,
          },
          data: {
            quantity: newQuantity,
          },
        });

        // ---------------------------------------------------------------------
        // Create RETURN inventory transaction
        // ---------------------------------------------------------------------

        await tx.inventoryTransaction.create({
          data: {
            clinicId,

            medicineBatchId: batch.id,

            type: InventoryTransactionType.RETURN,

            quantity: item.quantity,

            previousQuantity: batch.quantity,

            newQuantity,

            referenceId: dispensing.id,

            notes: `Stock returned due to cancellation of dispensing ${dispensing.id}`,
          },
        });
      }

      // -----------------------------------------------------------------------
      // 5. Remove pharmacy invoice items
      // -----------------------------------------------------------------------

      if (dispensing.invoiceId) {
        await tx.invoiceItem.deleteMany({
          where: {
            invoiceId: dispensing.invoiceId,

            pharmacyDispensingItemId: {
              in: dispensing.items.map((item) => item.id),
            },
          },
        });

        // ---------------------------------------------------------------------
        // Recalculate invoice
        // ---------------------------------------------------------------------

        await this.recalculateInvoice(tx, dispensing.invoiceId);
      }

      // -----------------------------------------------------------------------
      // 6. Mark dispensing as cancelled
      // -----------------------------------------------------------------------

      await tx.pharmacyDispensing.update({
        where: {
          id: dispensing.id,
        },
        data: {
          status: PharmacyDispensingStatus.CANCELLED,
        },
      });

      // -----------------------------------------------------------------------
      // 7. Return updated dispensing
      // -----------------------------------------------------------------------

      const result = await tx.pharmacyDispensing.findUnique({
        where: {
          id: dispensing.id,
        },
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
            },
          },
          items: {
            include: {
              medicine: true,
              medicineBatch: true,
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Dispensing record not found');
      }

      return this.mapDispensing(result);
    });
  }

  // ===========================================================================
  // RESPONSE MAPPER
  // ===========================================================================

  private mapDispensing(
    dispensing: Prisma.PharmacyDispensingGetPayload<{
      include: {
        invoice: {
          select: {
            invoiceNumber: true;
          };
        };
        items: {
          include: {
            medicine: true;
            medicineBatch: true;
          };
        };
      };
    }>,
  ): DispensingResponseDto {
    const items: DispensingItemResponseDto[] = dispensing.items.map((item) => ({
      id: item.id,

      medicineId: item.medicineId,

      medicineName: item.medicine.name,

      medicineBatchId: item.medicineBatchId,

      batchNumber: item.medicineBatch.batchNumber,

      quantity: item.quantity,

      unitPrice: Number(item.unitPrice),

      amount: Number(item.amount),
    }));

    return {
      id: dispensing.id,

      clinicId: dispensing.clinicId,

      prescriptionId: dispensing.prescriptionId,

      invoiceId: dispensing.invoiceId,
      invoiceNumber: dispensing.invoice?.invoiceNumber ?? null,

      status: dispensing.status,

      createdAt: dispensing.createdAt,

      items,
    };
  }

  private async generateInvoiceNumber(
    tx: Prisma.TransactionClient,
    clinicId: string,
  ): Promise<string> {
    const clinic = await tx.clinic.findUnique({
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

    const count = await tx.invoice.count({
      where: {
        clinicId,
        createdAt: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
    });

    return `INV-${clinic.code}-${year}-${String(count + 1).padStart(6, '0')}`;
  }
}
