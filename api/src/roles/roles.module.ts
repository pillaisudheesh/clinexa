import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
