import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard';
import { ClinicsModule } from '../clinics/clinics.module';

@Module({
  imports: [ClinicsModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, PlatformAdminGuard],
})
export class OrganizationsModule {}
