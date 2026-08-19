import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InventoryTransactionType,
  PharmacyDispensingStatus,
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
        },
      });

      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      // -----------------------------------------------------------------------
      // 2. Prevent duplicate dispensing
      // -----------------------------------------------------------------------

      const existing = await tx.pharmacyDispensing.findUnique({
        where: {
          prescriptionId,
        },
        select: {
          id: true,
        },
      });

      if (existing) {
        throw new ConflictException(
          'This prescription has already been dispensed',
        );
      }

      // -----------------------------------------------------------------------
      // 3. Parse prescription quantity
      // -----------------------------------------------------------------------

      const requestedQuantity = this.parseQuantity(prescription.quantity);

      // -----------------------------------------------------------------------
      // 4. Validate invoice if supplied
      // -----------------------------------------------------------------------

      if (dto.invoiceId) {
        const invoice = await tx.invoice.findFirst({
          where: {
            id: dto.invoiceId,
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

      const dispensing = await tx.pharmacyDispensing.create({
        data: {
          clinicId,

          prescriptionId,

          invoiceId: dto.invoiceId,

          status: PharmacyDispensingStatus.COMPLETED,
        },
      });

      // -----------------------------------------------------------------------
      // 7. Allocate stock using FEFO
      // -----------------------------------------------------------------------

      let remaining = requestedQuantity;

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

        await tx.medicineBatch.update({
          where: {
            id: batch.id,
          },
          data: {
            quantity: newQuantity,
          },
        });

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

        await tx.pharmacyDispensingItem.create({
          data: {
            dispensingId: dispensing.id,

            medicineId: prescription.medicineId,

            medicineBatchId: batch.id,

            quantity: quantityToDispense,

            unitPrice,

            amount,
          },
        });

        remaining -= quantityToDispense;
      }

      // -----------------------------------------------------------------------
      // 8. Add pharmacy charges to invoice
      // -----------------------------------------------------------------------

      if (dto.invoiceId) {
        await this.addToInvoice(tx, clinicId, dto.invoiceId, dispensing.id);
      }

      // -----------------------------------------------------------------------
      // 9. Load final dispensing record
      // -----------------------------------------------------------------------

      const result = await tx.pharmacyDispensing.findUnique({
        where: {
          id: dispensing.id,
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
    dispensingId: string,
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
        dispensingId,
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
        const invoice = await tx.invoice.findFirst({
          where: {
            id: dispensing.invoiceId,
            clinicId,
          },
          select: {
            id: true,
            status: true,
          },
        });

        if (!invoice) {
          throw new NotFoundException(
            'Invoice associated with dispensing was not found',
          );
        }

        if (invoice.status !== 'DRAFT') {
          throw new BadRequestException(
            'Dispensing cannot be cancelled after the invoice has been issued',
          );
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

      status: dispensing.status,

      createdAt: dispensing.createdAt,

      items,
    };
  }
}
