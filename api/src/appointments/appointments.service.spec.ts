import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: {} },
        { provide: AuditService, useValue: {} },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('parses date-only input as a stable UTC calendar date', () => {
    const date = Reflect.get(service, 'parseDate').call(service, '2026-10-21') as Date;
    expect(date.toISOString()).toBe('2026-10-21T00:00:00.000Z');
  });

  it('rejects impossible calendar dates', () => {
    expect(() => Reflect.get(service, 'parseDate').call(service, '2026-02-30')).toThrow(
      'Invalid date: 2026-02-30',
    );
  });

  it('advances calendar dates in UTC without server timezone dependence', () => {
    const date = new Date('2026-10-31T00:00:00.000Z');
    const next = Reflect.get(service, 'nextDate').call(service, date) as Date;
    expect(next.toISOString()).toBe('2026-11-01T00:00:00.000Z');
  });

  it('converts clinic-local appointment time to UTC', () => {
    const instant = Reflect.get(service, 'clinicLocalDateTimeToUtc').call(
      service,
      '2026-10-21',
      '09:00',
      'Asia/Kolkata',
    ) as Date;
    expect(instant.toISOString()).toBe('2026-10-21T03:30:00.000Z');
  });

  it('uses the calendar date weekday consistently', () => {
    const date = new Date('2026-10-25T00:00:00.000Z'); // Sunday
    const isWorkingDay = Reflect.get(service, 'isClinicWorkingDay').call(
      service,
      { workingDays: ['SUNDAY'] },
      date,
    ) as boolean;
    expect(isWorkingDay).toBe(true);
  });
});
