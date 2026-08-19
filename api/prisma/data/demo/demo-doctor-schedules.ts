export interface DemoDoctorScheduleSeed {
  doctorNumber: string;

  slotDuration: number;
  bufferTime: number;

  slots: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable?: boolean;
  }[];
}

export const demoDoctorSchedules: DemoDoctorScheduleSeed[] = [
  {
    doctorNumber: 'DOC-0001',
    slotDuration: 15,
    bufferTime: 5,
    slots: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '12:00' },
    ],
  },

  {
    doctorNumber: 'DOC-0002',
    slotDuration: 20,
    bufferTime: 5,
    slots: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '14:00' },
      { dayOfWeek: 2, startTime: '10:00', endTime: '14:00' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '14:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '14:00' },
      { dayOfWeek: 5, startTime: '10:00', endTime: '14:00' },
    ],
  },

  {
    doctorNumber: 'DOC-0003',
    slotDuration: 15,
    bufferTime: 5,
    slots: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 3, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '13:00' },
    ],
  },

  {
    doctorNumber: 'DOC-0004',
    slotDuration: 20,
    bufferTime: 5,
    slots: [
      { dayOfWeek: 1, startTime: '09:30', endTime: '13:30' },
      { dayOfWeek: 3, startTime: '09:30', endTime: '13:30' },
      { dayOfWeek: 5, startTime: '09:30', endTime: '13:30' },
    ],
  },

  {
    doctorNumber: 'DOC-0005',
    slotDuration: 15,
    bufferTime: 10,
    slots: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 4, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '13:00' },
    ],
  },

  {
    doctorNumber: 'DOC-0006',
    slotDuration: 20,
    bufferTime: 5,
    slots: [
      { dayOfWeek: 2, startTime: '10:00', endTime: '14:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '14:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    ],
  },

  {
    doctorNumber: 'DOC-0007',
    slotDuration: 15,
    bufferTime: 5,
    slots: [
      { dayOfWeek: 1, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '14:00', endTime: '18:00' },
    ],
  },

  {
    doctorNumber: 'DOC-0008',
    slotDuration: 15,
    bufferTime: 5,
    slots: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '13:00' },
    ],
  },

  {
    doctorNumber: 'DOC-0009',
    slotDuration: 20,
    bufferTime: 5,
    slots: [
      { dayOfWeek: 2, startTime: '10:00', endTime: '14:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '14:00' },
      { dayOfWeek: 6, startTime: '10:00', endTime: '13:00' },
    ],
  },

  {
    doctorNumber: 'DOC-0010',
    slotDuration: 15,
    bufferTime: 5,
    slots: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 4, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '13:00' },
    ],
  },
];
