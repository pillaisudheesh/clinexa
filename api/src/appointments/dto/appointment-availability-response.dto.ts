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
  manualTimeEntry?: boolean;
  workingHours?: { startTime: string; endTime: string };

  slots!: AppointmentAvailabilitySlotDto[];
}
