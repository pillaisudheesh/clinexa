import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from '../auth/constants/permission-codes';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { AuditService } from './audit.service';

class AuditQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
  @IsOptional() @IsString() action?: string;
  @IsOptional() @IsString() entityType?: string;
  @IsOptional() @IsString() entityId?: string;
  @IsOptional() @IsString() actorId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(PermissionCodes.AUDIT_LOG_READ)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findMany(@Req() req: AuthenticatedRequest, @Query() query: AuditQueryDto) {
    return this.auditService.findMany(
      {
        clinicId: req.user.clinicId,
        isPlatformAdmin: req.user.isPlatformAdmin === true,
      },
      query,
    );
  }
}
