import { PartialType } from '@nestjs/swagger';

import { CreatePharmacyMedicineDto } from './create-medicine.dto';

export class UpdatePharmacyMedicineDto extends PartialType(
  CreatePharmacyMedicineDto,
) {}
