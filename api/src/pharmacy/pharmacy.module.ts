import { Module } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';

import { DispensingController } from './dispensing.controller';
import { DispensingService } from './dispensing.service';

@Module({
  controllers: [PharmacyController, DispensingController],
  providers: [PharmacyService, DispensingService],
  exports: [PharmacyService, DispensingService],
})
export class PharmacyModule {}
