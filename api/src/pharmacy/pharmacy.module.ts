import { Module } from '@nestjs/common';

import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import { DispensingController } from './dispensing.controller';
import { DispensingService } from './dispensing.service';
import { PharmacyPrescriptionController } from './pharmacy-prescription.controller';
import { PharmacyPrescriptionService } from './pharmacy-prescription.service';

@Module({
  controllers: [
    PharmacyController,
    DispensingController,
    PharmacyPrescriptionController,
  ],
  providers: [PharmacyService, DispensingService, PharmacyPrescriptionService],
  exports: [PharmacyService, DispensingService, PharmacyPrescriptionService],
})
export class PharmacyModule {}
