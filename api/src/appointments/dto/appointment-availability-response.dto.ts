export class AppointmentAvailabilitySlotDto {
  startTime!: string;
  endTime!: string;
  available!: boolean;
}

export class AppointmentAvailabilityResponseDto {
  doctorId!: string;
  date!: string;

  slotDuration!: number;
  bufferTime!: number;

  slots!: AppointmentAvailabilitySlotDto[];
}
