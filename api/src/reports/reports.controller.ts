import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from '../auth/constants/permission-codes';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';

interface AuthenticatedRequest extends Request {
  user: { clinicId: string };
}

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @Permissions(PermissionCodes.REPORT_READ)
  @ApiOperation({ summary: 'Get clinic operational report' })
  getSummary(@Req() req: AuthenticatedRequest, @Query() query: ReportQueryDto) {
    return this.reportsService.getSummary(req.user.clinicId, query);
  }
}
