import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClinicsModule } from './clinics/clinics.module';
import { PermissionGroupsModule } from './permission-groups/permission-groups.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { PatientsModule } from './patients/patients.module';
import jwtConfig from './config/jwt.config';
import { CommonModule } from './common/common.module';
import { DepartmentsModule } from './departments/departments.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { LabTestsModule } from './lab-tests/lab-tests.module';
import { LabOrdersModule } from './lab-orders/lab-orders.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { InventoryModule } from './inventory/inventory.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MedicinesModule } from './medicines/medicines.module';
import { SpecialtyModule } from './specialty/specialty.module';
import { QualificationModule } from './qualification/qualification.module';
import { LanguageModule } from './language/language.module';
import { RegistrationCouncilModule } from './registration-council/registration-council.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, jwtConfig],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ClinicsModule,
    PermissionGroupsModule,
    PermissionsModule,
    RolesModule,
    PatientsModule,
    CommonModule,
    DepartmentsModule,
    DoctorsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    PrescriptionsModule,
    DiagnosisModule,
    InvoicesModule,
    PaymentsModule,
    LabTestsModule,
    LabOrdersModule,
    PharmacyModule,
    InventoryModule,
    DashboardModule,
    MedicinesModule,
    SpecialtyModule,
    QualificationModule,
    LanguageModule,
    RegistrationCouncilModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
