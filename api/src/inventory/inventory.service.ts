import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InventoryTransactionType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { CreateMedicineBatchDto } from './dto/create-medicine-batch.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { MedicineBatchQueryDto } from './dto/medicine-batch-query.dto';
import { MedicineBatchResponseDto } from './dto/medicine-batch-response.dto';
import { InventorySummaryResponseDto } from './inventory-summary-response.dto';
import { InventoryTransactionQueryDto } from './dto/inventory-transaction-query.dto';

import { InventoryTransactionResponseDto } from './dto/inventory-transaction-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { StockReceiptResponseDto } from './dto/stock-receipt-response.dto';
import { CreateStockReceiptDto } from './dto/create-stock-receipt.dto';
import { StockReceiptQueryDto } from './dto/stock-receipt-query.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ===========================================================================
  // CREATE BATCH
  // ===========================================================================

  async createBatch(
    clinicId: string,
    dto: CreateMedicineBatchDto,
    actorId: string,
  ): Promise<MedicineBatchResponseDto> {
    const medicine = await this.prisma.medicine.findFirst({
      where: {
        id: dto.medicineId,
        clinicId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!medicine) {
      throw new NotFoundException('Active medicine not found');
    }

    const expiryDate = new Date(dto.expiryDate);

    if (expiryDate <= new Date()) {
      throw new BadRequestException('Expiry date must be in the future');
    }

    if (dto.sellingPrice < dto.purchasePrice) {
      throw new BadRequestException(
        'Selling price cannot be less than purchase price',
      );
    }

    const existing = await this.prisma.medicineBatch.findFirst({
      where: {
        clinicId,
        medicineId: dto.medicineId,
        batchNumber: dto.batchNumber,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      throw new ConflictException(
        'A batch with this batch number already exists for this medicine',
      );
    }

    const batch = await this.prisma.$transaction(async (tx) => {
      const created = await tx.medicineBatch.create({
        data: {
          clinicId,

          medicineId: dto.medicineId,

          batchNumber: dto.batchNumber,

          expiryDate,

          purchasePrice: new Prisma.Decimal(dto.purchasePrice),

          sellingPrice: new Prisma.Decimal(dto.sellingPrice),

          quantity: dto.quantity,

          reorderLevel: dto.reorderLevel ?? 0,

          isActive: true,
        },

        include: {
          medicine: true,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          clinicId,

          medicineBatchId: created.id,

          type: InventoryTransactionType.PURCHASE,

          quantity: dto.quantity,

          previousQuantity: 0,

          newQuantity: dto.quantity,

          notes: dto.notes,
        },
      });

      await this.auditService.createInTransaction(tx, {
        clinicId,
        actorId,
        action: 'MEDICINE_BATCH_CREATED',
        entityType: 'MedicineBatch',
        entityId: created.id,
        description: 'Medicine batch created and initial stock recorded',
        metadata: {
          medicineId: created.medicineId,
          batchNumber: created.batchNumber,
          quantity: created.quantity,
          expiryDate: created.expiryDate.toISOString(),
        },
      });

      return created;
    });

    return this.mapBatch(batch);
  }

  // ===========================================================================
  // LIST BATCHES
  // ===========================================================================

  async findAll(
    clinicId: string,
    query: MedicineBatchQueryDto,
  ): Promise<PaginatedResponseDto<MedicineBatchResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search,
      medicineId,
      lowStock,
      expired,
      isActive,
    } = query;

    const skip = (page - 1) * limit;

    const now = new Date();

    const where: Prisma.MedicineBatchWhereInput = {
      clinicId,

      ...(medicineId && {
        medicineId,
      }),

      ...(isActive !== undefined && {
        isActive,
      }),

      ...(search && {
        OR: [
          {
            batchNumber: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            medicine: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      }),

      ...(expired !== undefined &&
        (expired
          ? {
              expiryDate: {
                lt: now,
              },
            }
          : {
              expiryDate: {
                gte: now,
              },
            })),

      ...(lowStock !== undefined &&
        (lowStock
          ? {
              quantity: {
                lte: 0,
              },
            }
          : {
              quantity: {
                gt: 0,
              },
            })),
    };

    const [batches, total] = await this.prisma.$transaction([
      this.prisma.medicineBatch.findMany({
        where,

        skip,
        take: limit,

        orderBy: [
          {
            expiryDate: 'asc',
          },
          {
            createdAt: 'asc',
          },
        ],

        include: {
          medicine: true,
        },
      }),

      this.prisma.medicineBatch.count({
        where,
      }),
    ]);

    return {
      data: batches.map((batch) => this.mapBatch(batch)),

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  // GET BATCH
  // ===========================================================================

  async findOne(
    clinicId: string,
    id: string,
  ): Promise<MedicineBatchResponseDto> {
    const batch = await this.prisma.medicineBatch.findFirst({
      where: {
        id,
        clinicId,
      },

      include: {
        medicine: true,
      },
    });

    if (!batch) {
      throw new NotFoundException('Medicine batch not found');
    }

    return this.mapBatch(batch);
  }

  // ===========================================================================
  // ADJUST STOCK
  // ===========================================================================

  async adjustStock(
    clinicId: string,
    id: string,
    dto: AdjustStockDto,
    actorId: string,
  ): Promise<MedicineBatchResponseDto> {
    if (dto.quantity === 0) {
      throw new BadRequestException('Stock adjustment quantity cannot be zero');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Lock this batch row before reading quantity so concurrent adjustments
      // serialize and the audit/ledger quantities reflect the committed order.
      const lockedRows = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "MedicineBatch"
        WHERE "id" = ${id} AND "clinicId" = ${clinicId}
        FOR UPDATE
      `;
      if (lockedRows.length === 0) {
        throw new NotFoundException('Medicine batch not found');
      }

      const batch = await tx.medicineBatch.findFirst({
        where: {
          id,
          clinicId,
        },
      });

      if (!batch) {
        throw new NotFoundException('Medicine batch not found');
      }

      if (!batch.isActive) {
        throw new BadRequestException(
          'Cannot adjust stock for an inactive batch',
        );
      }

      if (batch.expiryDate <= new Date()) {
        throw new BadRequestException(
          'Cannot adjust stock for an expired batch',
        );
      }

      const previousQuantity = batch.quantity;

      const newQuantity = previousQuantity + dto.quantity;

      if (newQuantity < 0) {
        throw new BadRequestException(
          `Insufficient stock. Current quantity: ${previousQuantity}`,
        );
      }

      const transactionType =
        dto.quantity > 0
          ? InventoryTransactionType.ADJUSTMENT_IN
          : InventoryTransactionType.ADJUSTMENT_OUT;

      const result = await tx.medicineBatch.update({
        where: {
          id: batch.id,
          clinicId,
        },

        data: {
          quantity: newQuantity,
        },

        include: {
          medicine: true,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          clinicId,

          medicineBatchId: batch.id,

          type: transactionType,

          quantity: Math.abs(dto.quantity),

          previousQuantity,

          newQuantity,

          notes: dto.notes,
        },
      });

      await this.auditService.createInTransaction(tx, {
        clinicId,
        actorId,
        action: 'INVENTORY_STOCK_ADJUSTED',
        entityType: 'MedicineBatch',
        entityId: batch.id,
        description: 'Inventory batch stock quantity adjusted',
        metadata: {
          adjustment: dto.quantity,
          previousQuantity,
          newQuantity,
          transactionType,
          notes: dto.notes ?? null,
        },
      });

      return result;
    });

    return this.mapBatch(updated);
  }

  // ===========================================================================
  // LOW STOCK
  // ===========================================================================

  async findLowStock(clinicId: string): Promise<MedicineBatchResponseDto[]> {
    const batches = await this.prisma.medicineBatch.findMany({
      where: {
        clinicId,
        isActive: true,
        quantity: {
          gt: 0,
        },
      },
      orderBy: {
        quantity: 'asc',
      },
      include: {
        medicine: true,
      },
    });

    return batches
      .filter((batch) => batch.quantity <= batch.reorderLevel)
      .map((batch) => this.mapBatch(batch));
  }

  // ===========================================================================
  // INVENTORY SUMMARY
  // ===========================================================================

  async getSummary(clinicId: string): Promise<InventorySummaryResponseDto> {
    const now = new Date();

    const expiringSoonDate = new Date(now);

    expiringSoonDate.setDate(expiringSoonDate.getDate() + 90);

    const [
      totalMedicines,
      totalBatches,
      stockBatches,
      lowStockBatches,
      expiringSoonBatches,
      expiredBatches,
    ] = await this.prisma.$transaction([
      // -----------------------------------------------------------------------
      // Active medicines
      // -----------------------------------------------------------------------

      this.prisma.medicine.count({
        where: {
          clinicId,
          isActive: true,
        },
      }),

      // -----------------------------------------------------------------------
      // Active batches
      // -----------------------------------------------------------------------

      this.prisma.medicineBatch.count({
        where: {
          clinicId,
          isActive: true,
        },
      }),

      // -----------------------------------------------------------------------
      // Stock batches
      // -----------------------------------------------------------------------

      this.prisma.medicineBatch.findMany({
        where: {
          clinicId,
          isActive: true,
        },
        select: {
          quantity: true,
        },
      }),

      // -----------------------------------------------------------------------
      // Low stock
      // -----------------------------------------------------------------------

      this.prisma.medicineBatch.findMany({
        where: {
          clinicId,
          isActive: true,
        },
        select: {
          quantity: true,
          reorderLevel: true,
        },
      }),

      // -----------------------------------------------------------------------
      // Expiring within 90 days
      // -----------------------------------------------------------------------

      this.prisma.medicineBatch.count({
        where: {
          clinicId,
          isActive: true,

          expiryDate: {
            gt: now,
            lte: expiringSoonDate,
          },

          quantity: {
            gt: 0,
          },
        },
      }),

      // -----------------------------------------------------------------------
      // Already expired
      // -----------------------------------------------------------------------

      this.prisma.medicineBatch.count({
        where: {
          clinicId,
          isActive: true,

          expiryDate: {
            lte: now,
          },

          quantity: {
            gt: 0,
          },
        },
      }),
    ]);

    const totalUnits = stockBatches.reduce(
      (total, batch) => total + batch.quantity,
      0,
    );

    const lowStockCount = lowStockBatches.filter(
      (batch) => batch.quantity <= batch.reorderLevel,
    ).length;

    return {
      totalMedicines,

      totalBatches,

      totalUnits,

      lowStockBatches: lowStockCount,

      expiringSoonBatches,

      expiredBatches,
    };
  }

  // ===========================================================================
  // EXPIRING STOCK
  // ===========================================================================

  async findExpiring(
    clinicId: string,
    days = 90,
  ): Promise<MedicineBatchResponseDto[]> {
    const now = new Date();

    const expiryLimit = new Date(now);

    expiryLimit.setDate(expiryLimit.getDate() + days);

    const batches = await this.prisma.medicineBatch.findMany({
      where: {
        clinicId,

        isActive: true,

        quantity: {
          gt: 0,
        },

        expiryDate: {
          gt: now,
          lte: expiryLimit,
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

      include: {
        medicine: true,
      },
    });

    return batches.map((batch) => this.mapBatch(batch));
  }

  // ===========================================================================
  // EXPIRED STOCK
  // ===========================================================================

  async findExpired(clinicId: string): Promise<MedicineBatchResponseDto[]> {
    const now = new Date();

    const batches = await this.prisma.medicineBatch.findMany({
      where: {
        clinicId,

        isActive: true,

        expiryDate: {
          lte: now,
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

      include: {
        medicine: true,
      },
    });

    return batches.map((batch) => this.mapBatch(batch));
  }

  // ===========================================================================
  // MARK BATCH AS EXPIRED
  // ===========================================================================

  async markExpired(
    clinicId: string,
    id: string,
    actorId: string,
  ): Promise<MedicineBatchResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const batch = await tx.medicineBatch.findFirst({
        where: {
          id,
          clinicId,
        },

        include: {
          medicine: true,
        },
      });

      if (!batch) {
        throw new NotFoundException('Medicine batch not found');
      }

      if (!batch.isActive) {
        throw new BadRequestException('Medicine batch is already inactive');
      }

      if (batch.expiryDate > new Date()) {
        throw new BadRequestException('Medicine batch has not expired yet');
      }

      if (batch.quantity <= 0) {
        throw new BadRequestException('Medicine batch has no remaining stock');
      }

      const previousQuantity = batch.quantity;

      // ---------------------------------------------------------------------
      // Remove expired stock from available inventory
      // ---------------------------------------------------------------------

      const updated = await tx.medicineBatch.update({
        where: {
          id: batch.id,
          clinicId,
        },

        data: {
          quantity: 0,
          isActive: false,
        },

        include: {
          medicine: true,
        },
      });

      // ---------------------------------------------------------------------
      // Audit transaction
      // ---------------------------------------------------------------------

      await tx.inventoryTransaction.create({
        data: {
          clinicId,

          medicineBatchId: batch.id,

          type: InventoryTransactionType.EXPIRED,

          quantity: previousQuantity,

          previousQuantity,

          newQuantity: 0,

          referenceId: batch.id,

          notes: `Batch ${batch.batchNumber} marked as expired`,
        },
      });

      await this.auditService.createInTransaction(tx, {
        clinicId,
        actorId,
        action: 'INVENTORY_STOCK_EXPIRED',
        entityType: 'MedicineBatch',
        entityId: batch.id,
        description: 'Expired batch removed from available inventory',
        metadata: {
          batchNumber: batch.batchNumber,
          previousQuantity,
          newQuantity: 0,
          expiryDate: batch.expiryDate.toISOString(),
        },
      });

      return this.mapBatch(updated);
    });
  }

  // ===========================================================================
  // INVENTORY TRANSACTIONS
  // ===========================================================================

  async findTransactions(
    clinicId: string,
    query: InventoryTransactionQueryDto,
  ): Promise<PaginatedResponseDto<InventoryTransactionResponseDto>> {
    const {
      page = 1,
      limit = 10,
      medicineId,
      medicineBatchId,
      type,
      fromDate,
      toDate,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
      clinicId,

      ...(medicineId && {
        medicineBatch: {
          medicineId,
        },
      }),

      ...(medicineBatchId && {
        medicineBatchId,
      }),

      ...(type && {
        type,
      }),

      ...((fromDate || toDate) && {
        createdAt: {
          ...(fromDate && {
            gte: new Date(fromDate),
          }),

          ...(toDate && {
            lte: this.endOfDay(toDate),
          }),
        },
      }),
    };

    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.inventoryTransaction.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          medicineBatch: {
            include: {
              medicine: true,
            },
          },
        },
      }),

      this.prisma.inventoryTransaction.count({
        where,
      }),
    ]);

    return {
      data: transactions.map((transaction) =>
        this.mapInventoryTransaction(transaction),
      ),

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  // BATCH TRANSACTIONS
  // ===========================================================================

  async findBatchTransactions(
    clinicId: string,
    batchId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<InventoryTransactionResponseDto>> {
    const { page = 1, limit = 10 } = query;

    const skip = (page - 1) * limit;

    // -------------------------------------------------------------------------
    // Verify batch belongs to clinic
    // -------------------------------------------------------------------------

    const batch = await this.prisma.medicineBatch.findFirst({
      where: {
        id: batchId,
        clinicId,
      },

      select: {
        id: true,
      },
    });

    if (!batch) {
      throw new NotFoundException('Medicine batch not found');
    }

    // -------------------------------------------------------------------------
    // Get transactions
    // -------------------------------------------------------------------------

    const where = {
      clinicId,
      medicineBatchId: batchId,
    };

    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.inventoryTransaction.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          medicineBatch: {
            include: {
              medicine: true,
            },
          },
        },
      }),

      this.prisma.inventoryTransaction.count({
        where,
      }),
    ]);

    return {
      data: transactions.map((transaction) =>
        this.mapInventoryTransaction(transaction),
      ),

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  // CREATE STOCK RECEIPT
  // ===========================================================================

  async createStockReceipt(
    clinicId: string,
    dto: CreateStockReceiptDto,
    actorId: string,
  ): Promise<StockReceiptResponseDto> {
    if (!dto.items.length) {
      throw new BadRequestException('At least one medicine is required');
    }

    // Receipt numbers are generated server-side. Serializable transactions plus
    // retry handling prevent two concurrent stock receipts from receiving the
    // same number.
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const receiptNumber = await this.generateReceiptNumber(
              tx,
              clinicId,
            );

            // -------------------------------------------------------------------
            // 1. Validate all medicines
            // -------------------------------------------------------------------

            const medicineIds = [
              ...new Set(dto.items.map((item) => item.medicineId)),
            ];

            const medicines = await tx.medicine.findMany({
              where: {
                clinicId,
                id: {
                  in: medicineIds,
                },
                isActive: true,
              },
              select: {
                id: true,
                name: true,
              },
            });

            const medicineMap = new Map(
              medicines.map((medicine) => [medicine.id, medicine]),
            );

            for (const item of dto.items) {
              if (!medicineMap.has(item.medicineId)) {
                throw new NotFoundException(
                  `Active medicine not found: ${item.medicineId}`,
                );
              }

              if (new Date(item.expiryDate) <= new Date()) {
                throw new BadRequestException(
                  `Medicine batch ${item.batchNumber} has an invalid expiry date`,
                );
              }

              if (item.sellingPrice < item.purchasePrice) {
                throw new BadRequestException(
                  `Selling price cannot be lower than purchase price for batch ${item.batchNumber}`,
                );
              }
            }

            // -------------------------------------------------------------------
            // 2. Create receipt
            // -------------------------------------------------------------------

            let totalAmount = new Prisma.Decimal(0);

            const receipt = await tx.stockReceipt.create({
              data: {
                clinicId,
                receiptNumber,
                supplierName: dto.supplierName,
                supplierInvoiceNumber: dto.supplierInvoiceNumber,
                notes: dto.notes,
                totalAmount,
              },
            });

            // -------------------------------------------------------------------
            // 3. Process each received item
            // -------------------------------------------------------------------

            for (const item of dto.items) {
              const purchasePrice = new Prisma.Decimal(item.purchasePrice);
              const sellingPrice = new Prisma.Decimal(item.sellingPrice);
              const amount = purchasePrice.mul(item.quantity);

              totalAmount = totalAmount.add(amount);

              const existingBatch = await tx.medicineBatch.findFirst({
                where: {
                  clinicId,
                  medicineId: item.medicineId,
                  batchNumber: item.batchNumber,
                },
              });

              let batch;

              if (existingBatch) {
                batch = await tx.medicineBatch.update({
                  where: { id: existingBatch.id, clinicId },
                  data: {
                    quantity: existingBatch.quantity + item.quantity,
                    purchasePrice,
                    sellingPrice,
                    expiryDate: new Date(item.expiryDate),
                    ...(item.reorderLevel !== undefined && {
                      reorderLevel: item.reorderLevel,
                    }),
                    isActive: true,
                  },
                });
              } else {
                batch = await tx.medicineBatch.create({
                  data: {
                    clinicId,
                    medicineId: item.medicineId,
                    batchNumber: item.batchNumber,
                    expiryDate: new Date(item.expiryDate),
                    quantity: item.quantity,
                    purchasePrice,
                    sellingPrice,
                    reorderLevel: item.reorderLevel ?? 0,
                    isActive: true,
                  },
                });
              }

              await tx.stockReceiptItem.create({
                data: {
                  receiptId: receipt.id,
                  medicineId: item.medicineId,
                  medicineBatchId: batch.id,
                  quantity: item.quantity,
                  purchasePrice,
                  sellingPrice,
                  amount,
                },
              });

              await tx.inventoryTransaction.create({
                data: {
                  clinicId,
                  medicineBatchId: batch.id,
                  type: InventoryTransactionType.PURCHASE,
                  quantity: item.quantity,
                  previousQuantity: existingBatch?.quantity ?? 0,
                  newQuantity: batch.quantity,
                  referenceId: receipt.id,
                  notes: `Stock received - ${receiptNumber}`,
                },
              });
            }

            await tx.stockReceipt.update({
              where: { id: receipt.id },
              data: { totalAmount },
            });

            const result = await tx.stockReceipt.findUnique({
              where: { id: receipt.id },
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
              throw new NotFoundException('Stock receipt not found');
            }

            await this.auditService.createInTransaction(tx, {
              clinicId,
              actorId,
              action: 'INVENTORY_STOCK_RECEIVED',
              entityType: 'StockReceipt',
              entityId: receipt.id,
              description:
                'Stock receipt created and inventory quantities updated',
              metadata: {
                receiptNumber,
                itemCount: dto.items.length,
                totalAmount: totalAmount.toString(),
                supplierInvoiceNumber: dto.supplierInvoiceNumber ?? null,
              },
            });

            return this.mapStockReceipt(result);
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        // PostgreSQL serializable transactions can abort under concurrent
        // receipt creation. Retry a few times; other errors are propagated.
        const code = (error as { code?: string }).code;
        if ((code === 'P2034' || code === 'P2002') && attempt < 3) {
          continue;
        }
        if (code === 'P2002') {
          throw new ConflictException(
            'Unable to generate a unique receipt number',
          );
        }
        throw error;
      }
    }

    throw new ConflictException('Unable to create stock receipt');
  }

  private async generateReceiptNumber(
    tx: Prisma.TransactionClient,
    clinicId: string,
  ): Promise<string> {
    const year = new Date().getFullYear();

    const latestReceipt = await tx.stockReceipt.findFirst({
      where: {
        clinicId,
        receiptNumber: {
          startsWith: `GRN-${year}-`,
        },
      },
      orderBy: { createdAt: 'desc' },
      select: { receiptNumber: true },
    });

    const match = latestReceipt?.receiptNumber.match(
      new RegExp(`^GRN-${year}-(\\d+)$`),
    );
    const nextSequence = match ? Number(match[1]) + 1 : 1;

    return `GRN-${year}-${String(nextSequence).padStart(6, '0')}`;
  }

  // ===========================================================================
  // LIST STOCK RECEIPTS
  // ===========================================================================

  async findReceipts(
    clinicId: string,
    query: StockReceiptQueryDto,
  ): Promise<PaginatedResponseDto<StockReceiptResponseDto>> {
    const {
      page = 1,
      limit = 10,
      receiptNumber,
      supplierName,
      fromDate,
      toDate,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
      clinicId,

      ...(receiptNumber && {
        receiptNumber: {
          contains: receiptNumber,
          mode: 'insensitive' as const,
        },
      }),

      ...(supplierName && {
        supplierName: {
          contains: supplierName,
          mode: 'insensitive' as const,
        },
      }),

      ...((fromDate || toDate) && {
        createdAt: {
          ...(fromDate && {
            gte: new Date(fromDate),
          }),

          ...(toDate && {
            lte: this.endOfDay(toDate),
          }),
        },
      }),
    };

    const [receipts, total] = await this.prisma.$transaction([
      this.prisma.stockReceipt.findMany({
        where,
        skip,
        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          items: {
            include: {
              medicine: true,
              medicineBatch: true,
            },
          },
        },
      }),

      this.prisma.stockReceipt.count({
        where,
      }),
    ]);

    return {
      data: receipts.map((receipt) => this.mapStockReceipt(receipt)),

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  // GET STOCK RECEIPT
  // ===========================================================================

  async findReceipt(
    clinicId: string,
    id: string,
  ): Promise<StockReceiptResponseDto> {
    const receipt = await this.prisma.stockReceipt.findFirst({
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

    if (!receipt) {
      throw new NotFoundException('Stock receipt not found');
    }

    return this.mapStockReceipt(receipt);
  }

  // ===========================================================================
  // RESPONSE MAPPER
  // ===========================================================================

  // ===========================================================================
  // TRANSACTION MAPPER
  // ===========================================================================

  private mapStockReceipt(
    receipt: Prisma.StockReceiptGetPayload<{
      include: {
        items: {
          include: {
            medicine: true;
            medicineBatch: true;
          };
        };
      };
    }>,
  ): StockReceiptResponseDto {
    return {
      id: receipt.id,

      clinicId: receipt.clinicId,

      receiptNumber: receipt.receiptNumber,

      supplierName: receipt.supplierName,

      supplierInvoiceNumber: receipt.supplierInvoiceNumber,

      notes: receipt.notes,

      totalAmount: Number(receipt.totalAmount),

      createdAt: receipt.createdAt,

      items: receipt.items.map((item) => ({
        id: item.id,

        medicineId: item.medicineId,

        medicineName: item.medicine.name,

        medicineBatchId: item.medicineBatchId,

        batchNumber: item.medicineBatch.batchNumber,

        quantity: item.quantity,

        purchasePrice: Number(item.purchasePrice),

        sellingPrice: Number(item.sellingPrice),

        amount: Number(item.amount),

        expiryDate: item.medicineBatch.expiryDate,
      })),
    };
  }

  private mapInventoryTransaction(
    transaction: Prisma.InventoryTransactionGetPayload<{
      include: {
        medicineBatch: {
          include: {
            medicine: true;
          };
        };
      };
    }>,
  ): InventoryTransactionResponseDto {
    return {
      id: transaction.id,

      clinicId: transaction.clinicId,

      medicineBatchId: transaction.medicineBatchId,

      medicineId: transaction.medicineBatch.medicineId,

      medicineName: transaction.medicineBatch.medicine.name,

      batchNumber: transaction.medicineBatch.batchNumber,

      type: transaction.type,

      quantity: transaction.quantity,

      previousQuantity: transaction.previousQuantity,

      newQuantity: transaction.newQuantity,

      referenceId: transaction.referenceId,

      notes: transaction.notes,

      createdAt: transaction.createdAt,
    };
  }

  private endOfDay(value: string): Date {
    const date = new Date(value);

    date.setHours(23, 59, 59, 999);

    return date;
  }

  private mapBatch(
    batch: Prisma.MedicineBatchGetPayload<{
      include: {
        medicine: true;
      };
    }>,
  ): MedicineBatchResponseDto {
    const now = new Date();

    return {
      id: batch.id,

      clinicId: batch.clinicId,

      medicineId: batch.medicineId,

      medicineName: batch.medicine.name,

      batchNumber: batch.batchNumber,

      expiryDate: batch.expiryDate,

      purchasePrice: Number(batch.purchasePrice),

      sellingPrice: Number(batch.sellingPrice),

      quantity: batch.quantity,

      reorderLevel: batch.reorderLevel,

      isLowStock: batch.quantity <= batch.reorderLevel,

      isExpired: batch.expiryDate <= now,

      isActive: batch.isActive,

      notes: null,

      createdAt: batch.createdAt,

      updatedAt: batch.updatedAt,
    };
  }
}
