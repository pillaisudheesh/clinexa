import { Module } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { ClinicsController } from './clinics.controller';
import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard';

@Module({
  controllers: [ClinicsController],
  providers: [ClinicsService, PlatformAdminGuard],
  exports: [ClinicsService],
})
export class ClinicsModule {}
