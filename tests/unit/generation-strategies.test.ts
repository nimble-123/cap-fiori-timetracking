/**
 * Unit Tests - Generation Strategies
 *
 * Testet echte MonthlyGenerationStrategy und YearlyGenerationStrategy
 */

import { MonthlyGenerationStrategy } from '../../srv/track-service/handler/strategies/MonthlyGenerationStrategy';
import { YearlyGenerationStrategy } from '../../srv/track-service/handler/strategies/YearlyGenerationStrategy';
import { TimeEntryFactory } from '../../srv/track-service/handler/factories/TimeEntryFactory';
import { HolidayService } from '../../srv/track-service/handler/services/HolidayService';
import { CustomizingService } from '../../srv/track-service/handler/services/CustomizingService';
import type { User } from '#cds-models/TrackService';
import { DateUtils } from '../../srv/track-service/handler/utils/DateUtils';

const mockTimeEntryFactory = {
  createDefaultEntry: jest.fn(),
  createWeekendEntry: jest.fn(),
  createHolidayEntry: jest.fn(),
} as unknown as jest.Mocked<TimeEntryFactory>;

const mockHolidayService = {
  getHolidays: jest.fn(),
} as unknown as jest.Mocked<HolidayService>;

const mockCustomizingService = {
  getUserDefaults: jest.fn(),
} as unknown as jest.Mocked<CustomizingService>;

describe('Generation Strategies', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockCustomizingService.getUserDefaults.mockReturnValue({
      fallbackWeeklyHours: 40,
      fallbackWorkingDays: 5,
      fallbackAnnualVacationDays: 30,
      demoUserId: 'demo-user',
    });

    mockTimeEntryFactory.createDefaultEntry.mockImplementation((userId, date) => ({
      ID: `entry-${date.getTime()}`,
      user_ID: userId,
      workDate: DateUtils.toLocalDateString(date) as any,
      entryType_code: 'W',
      durationHoursNet: 8,
      source: 'GENERATED',
    })) as any;

    mockTimeEntryFactory.createWeekendEntry.mockImplementation((userId, date) => ({
      ID: `weekend-${date.getTime()}`,
      user_ID: userId,
      workDate: DateUtils.toLocalDateString(date) as any,
      entryType_code: 'O',
      durationHoursNet: 0,
      source: 'GENERATED',
    })) as any;

    mockTimeEntryFactory.createHolidayEntry.mockImplementation((userId, date, holidayName) => ({
      ID: `holiday-${date.getTime()}`,
      user_ID: userId,
      workDate: DateUtils.toLocalDateString(date) as any,
      entryType_code: 'H',
      note: holidayName,
      durationHoursNet: 0,
      source: 'GENERATED',
    })) as any;
  });

  describe('MonthlyGenerationStrategy', () => {
    let strategy: MonthlyGenerationStrategy;

    beforeEach(() => {
      strategy = new MonthlyGenerationStrategy(mockTimeEntryFactory, mockCustomizingService);
    });

    it('should generate entries for working days only', () => {
      const user: User = { ID: 'user-123', workingDaysPerWeek: 5 } as User;
      const existingDates = new Set<string>();

      const original = DateUtils.getCurrentMonthData;
      DateUtils.getCurrentMonthData = jest.fn().mockReturnValue({
        year: 2025,
        month: 0,
        daysInMonth: 31,
      });

      const entries = strategy.generateMissingEntries('user-123', user, existingDates);

      // Januar 2025 hat Werktage (Mo-Fr), keine Wochenenden
      expect(entries.length).toBeGreaterThan(0);
      expect(entries.length).toBeLessThanOrEqual(23); // Max 23 Werktage
      expect(mockTimeEntryFactory.createDefaultEntry).toHaveBeenCalled();
      expect(entries.every((e) => e.entryType_code === 'W')).toBe(true);

      DateUtils.getCurrentMonthData = original;
    });

    it('should skip existing dates', () => {
      const user: User = { ID: 'user-123', workingDaysPerWeek: 5 } as User;
      const existingDates = new Set(['2025-01-02', '2025-01-03']);

      const original = DateUtils.getCurrentMonthData;
      DateUtils.getCurrentMonthData = jest.fn().mockReturnValue({
        year: 2025,
        month: 0,
        daysInMonth: 31,
      });

      const entries = strategy.generateMissingEntries('user-123', user, existingDates);

      expect(entries.length).toBeLessThan(22); // Weniger als 22 wegen 2 existing
      expect(entries.find((e) => e.workDate === '2025-01-02')).toBeUndefined();

      DateUtils.getCurrentMonthData = original;
    });
  });

  describe('YearlyGenerationStrategy', () => {
    let strategy: YearlyGenerationStrategy;

    beforeEach(() => {
      strategy = new YearlyGenerationStrategy(mockHolidayService, mockTimeEntryFactory);
    });

    it('should generate entries for all days in year', async () => {
      const user: User = { ID: 'user-123' } as User;
      const existingDates = new Set<string>();

      const holidays = new Map([['2025-01-01', { date: '2025-01-01', name: 'Neujahr' }]]);
      mockHolidayService.getHolidays.mockResolvedValue(holidays as any);

      const entries = await strategy.generateMissingEntries('user-123', user, 2025, 'BY', existingDates);

      expect(entries.length).toBe(365);
      expect(mockHolidayService.getHolidays).toHaveBeenCalledWith(2025, 'BY');
    });

    it('should create holiday entries', async () => {
      const user: User = { ID: 'user-123' } as User;
      const existingDates = new Set<string>();

      const holidays = new Map([['2025-01-01', { date: '2025-01-01', name: 'Neujahr' }]]);
      mockHolidayService.getHolidays.mockResolvedValue(holidays as any);

      const entries = await strategy.generateMissingEntries('user-123', user, 2025, 'BY', existingDates);
      const neujahr = entries.find((e) => e.workDate === '2025-01-01');

      expect(neujahr?.entryType_code).toBe('H');
      expect(neujahr?.note).toBe('Neujahr');
    });

    it('should handle leap year', async () => {
      const user: User = { ID: 'user-123' } as User;
      const existingDates = new Set<string>();

      mockHolidayService.getHolidays.mockResolvedValue(new Map() as any);

      const entries = await strategy.generateMissingEntries('user-123', user, 2024, 'BY', existingDates);

      expect(entries.length).toBe(366);
      expect(entries.find((e) => e.workDate === '2024-02-29')).toBeDefined();
    });
  });
});
