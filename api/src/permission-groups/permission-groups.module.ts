import { Module } from '@nestjs/common';
import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionGroupsController } from './permission-groups.controller';
import { PermissionGroupsService } from './permission-groups.service';

@Module({
  imports: [PrismaModule],
  controllers: [PermissionGroupsController],
  providers: [PermissionGroupsService, PlatformAdminGuard],
})
export class PermissionGroupsModule {}
