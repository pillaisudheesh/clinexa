import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuditLog } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogInput {
  clinicId?: string | null;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuditQuery {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  from?: string;
  to?: string;
}

export interface AuditLogListItem {
  id: string;
  clinicId: string | null;
  userId: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: Prisma.JsonValue | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface AuditLogListResult {
  items: AuditLogListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAuditLogInput): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: this.toAuditLogData(input),
    });
  }

  /** Writes the audit entry in the caller's transaction. */
  async createInTransaction(
    tx: Prisma.TransactionClient,
    input: CreateAuditLogInput,
  ): Promise<AuditLog> {
    return tx.auditLog.create({
      data: this.toAuditLogData(input),
    });
  }

  private toAuditLogData(
    input: CreateAuditLogInput,
  ): Prisma.AuditLogUncheckedCreateInput {
    const details: Prisma.InputJsonObject | undefined =
      input.description !== undefined || input.metadata !== undefined
        ? {
            ...(input.description !== undefined
              ? { description: input.description }
              : {}),
            ...(input.metadata !== undefined
              ? { metadata: input.metadata }
              : {}),
          }
        : undefined;

    return {
      clinicId: input.clinicId ?? null,
      userId: input.actorId ?? null,
      action: input.action,
      entity: input.entityType,
      entityId: input.entityId ?? null,
      ...(details !== undefined ? { details } : {}),
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    };
  }

  async findMany(
    scope: { clinicId: string; isPlatformAdmin: boolean },
    query: AuditQuery,
  ): Promise<AuditLogListResult> {
    const page = Math.max(1, Math.floor(Number(query.page) || 1));
    const limit = Math.min(
      100,
      Math.max(1, Math.floor(Number(query.limit) || 20)),
    );

    const where: Prisma.AuditLogWhereInput = {};

    if (!scope.isPlatformAdmin) {
      where.clinicId = scope.clinicId;
    }
    if (query.action) where.action = query.action;
    if (query.entityType) where.entity = query.entityType;
    if (query.entityId) where.entityId = query.entityId;
    if (query.actorId) where.userId = query.actorId;

    const fromDate =
      query.from && !Number.isNaN(Date.parse(query.from))
        ? new Date(query.from)
        : undefined;
    const toDate =
      query.to && !Number.isNaN(Date.parse(query.to))
        ? new Date(query.to)
        : undefined;

    if (fromDate || toDate) {
      where.createdAt = {
        ...(fromDate ? { gte: fromDate } : {}),
        ...(toDate ? { lte: toDate } : {}),
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          clinicId: true,
          userId: true,
          action: true,
          entity: true,
          entityId: true,
          details: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
