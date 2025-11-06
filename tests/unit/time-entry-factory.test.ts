/**
 * Unit Tests - TimeEntryFactory
 *
 * Testet echte TimeEntryFactory-Klasse mit gemockten Dependencies
 */

import { TimeEntryFactory } from '../../srv/track-service/handler/factories/TimeEntryFactory';
import { UserService } from '../../srv/track-service/handler/services/UserService';
import { CustomizingService } from '../../srv/track-service/handler/services/CustomizingService';
import type { Transaction } from '@sap/cds';
import type { User } from '#cds-models/TrackService';

// Mock für Transaction
const mockTx = {} as Transaction;

// Mock für UserService
const mockUserService = {
  getExpectedDailyHours: jest.fn(),
} as unknown as jest.Mocked<UserService>;

// Mock für CustomizingService
const mockCustomizingService = {
  getTimeEntryDefaults: jest.fn(),
  getUserDefaults: jest.fn(),
} as unknown as jest.Mocked<CustomizingService>;

describe('TimeEntryFactory - Unit Tests', () => {
  let factory: TimeEntryFactory;

  beforeEach(() => {
    // Factory mit gemockten Dependencies erstellen
    factory = new TimeEntryFactory(mockCustomizingService);

    // Reset all mocks
    jest.clearAllMocks();

    // Default mock implementations
    mockCustomizingService.getTimeEntryDefaults.mockReturnValue({
      startHour: 8,
      startMinute: 0,
      defaultBreakMinutes: 30,
      generatedSourceCode: 'GENERATED',
      manualSourceCode: 'UI',
      workEntryTypeCode: 'W',
      weekendEntryTypeCode: 'O',
      holidayEntryTypeCode: 'H',
      statusOpenCode: 'OPEN',
      statusProcessedCode: 'PROCESSED',
      statusDoneCode: 'DONE',
      statusReleasedCode: 'RELEASED',
    });

    mockCustomizingService.getUserDefaults.mockReturnValue({
      fallbackWeeklyHours: 40,
      fallbackWorkingDays: 5,
      fallbackAnnualVacationDays: 30,
      demoUserId: 'demo-user',
    });

    mockUserService.getExpectedDailyHours.mockResolvedValue(8);
  });

  describe('createWorkTimeData', () => {
    it('should calculate overtime when working more than expected', async () => {
      // Arrange
      mockUserService.getExpectedDailyHours.mockResolvedValue(8);
      const userId = 'user-123';
      const startTime = '08:00:00';
      const endTime = '17:30:00'; // 9.5h gross
      const breakMinutes = 30; // = 9h net

      // Act
      const result = await factory.createWorkTimeData(
        mockUserService,
        mockTx,
        userId,
        startTime,
        endTime,
        breakMinutes,
      );

      // Assert
      expect(mockUserService.getExpectedDailyHours).toHaveBeenCalledWith(mockTx, userId);
      expect(result.durationHoursNet).toBe(9);
      expect(result.overtimeHours).toBe(1); // 9h - 8h = 1h overtime
      expect(result.undertimeHours).toBe(0);
      expect(result.expectedDailyHoursDec).toBe(8);
      expect(result.breakMin).toBe(30);
    });

    it('should calculate undertime when working less than expected', async () => {
      // Arrange
      mockUserService.getExpectedDailyHours.mockResolvedValue(8);
      const userId = 'user-123';
      const startTime = '08:00:00';
      const endTime = '14:00:00'; // 6h gross
      const breakMinutes = 0; // = 6h net

      // Act
      const result = await factory.createWorkTimeData(
        mockUserService,
        mockTx,
        userId,
        startTime,
        endTime,
        breakMinutes,
      );

      // Assert
      expect(result.durationHoursNet).toBe(6);
      expect(result.overtimeHours).toBe(0);
      expect(result.undertimeHours).toBe(2); // 8h - 6h = 2h undertime
    });

    it('should have zero overtime/undertime when meeting expectations exactly', async () => {
      // Arrange
      mockUserService.getExpectedDailyHours.mockResolvedValue(8);
      const userId = 'user-123';
      const startTime = '08:00:00';
      const endTime = '16:30:00'; // 8.5h gross
      const breakMinutes = 30; // = 8h net

      // Act
      const result = await factory.createWorkTimeData(
        mockUserService,
        mockTx,
        userId,
        startTime,
        endTime,
        breakMinutes,
      );

      // Assert
      expect(result.durationHoursNet).toBe(8);
      expect(result.overtimeHours).toBe(0);
      expect(result.undertimeHours).toBe(0);
    });

    it('should throw error when end time is before start time', async () => {
      // Arrange
      const userId = 'user-123';
      const startTime = '16:00:00';
      const endTime = '08:00:00'; // Invalid!
      const breakMinutes = 30;

      // Act & Assert
      await expect(
        factory.createWorkTimeData(mockUserService, mockTx, userId, startTime, endTime, breakMinutes),
      ).rejects.toThrow();
    });

    it('should calculate gross hours correctly', async () => {
      // Arrange
      mockUserService.getExpectedDailyHours.mockResolvedValue(8);
      const userId = 'user-123';
      const startTime = '08:00:00';
      const endTime = '17:00:00'; // 9h gross
      const breakMinutes = 45; // = 8.25h net

      // Act
      const result = await factory.createWorkTimeData(
        mockUserService,
        mockTx,
        userId,
        startTime,
        endTime,
        breakMinutes,
      );

      // Assert
      expect(result.durationHoursGross).toBe(9);
      expect(result.durationHoursNet).toBe(8.25);
      expect(result.breakMin).toBe(45);
    });
  });

  describe('createNonWorkTimeData', () => {
    it('should create data with expected hours and zero overtime/undertime', async () => {
      // Arrange
      mockUserService.getExpectedDailyHours.mockResolvedValue(8);
      const userId = 'user-123';

      // Act
      const result = await factory.createNonWorkTimeData(mockUserService, mockTx, userId);

      // Assert
      expect(mockUserService.getExpectedDailyHours).toHaveBeenCalledWith(mockTx, userId);
      expect(result.durationHoursNet).toBe(8);
      expect(result.durationHoursGross).toBe(8);
      expect(result.overtimeHours).toBe(0);
      expect(result.undertimeHours).toBe(0);
      expect(result.breakMin).toBe(0);
      expect(result.expectedDailyHoursDec).toBe(8);
    });

    it('should handle different expected hours (7.5h)', async () => {
      // Arrange
      mockUserService.getExpectedDailyHours.mockResolvedValue(7.5);
      const userId = 'user-456';

      // Act
      const result = await factory.createNonWorkTimeData(mockUserService, mockTx, userId);

      // Assert
      expect(result.durationHoursNet).toBe(7.5);
      expect(result.expectedDailyHoursDec).toBe(7.5);
    });
  });

  describe('createDefaultEntry', () => {
    it('should create default work entry with standard configuration', () => {
      // Arrange
      const userId = 'user-123';
      const date = new Date('2025-11-06');
      const user: User = {
        ID: userId,
        workingDaysPerWeek: 5,
        weeklyHoursDec: 40,
        expectedDailyHoursDec: 8,
        defaultWorkLocation_code: 'OFFICE',
      } as User;

      // Act
      const entry = factory.createDefaultEntry(userId, date, user);

      // Assert
      expect(entry.user_ID).toBe(userId);
      expect(entry.workDate).toBe('2025-11-06');
      expect(entry.entryType_code).toBe('W');
      expect(entry.startTime).toBe('08:00:00');
      expect(entry.endTime).toBe('16:30:00'); // 8h + 30min break
      expect(entry.breakMin).toBe(30);
      expect(entry.durationHoursNet).toBe(8);
      expect(entry.overtimeHours).toBe(0);
      expect(entry.undertimeHours).toBe(0);
      expect(entry.expectedDailyHoursDec).toBe(8);
      expect(entry.source).toBe('GENERATED');
      expect(entry.status_code).toBe('OPEN');
      expect(entry.workLocation_code).toBe('OFFICE');
      expect(entry.ID).toBeDefined();
    });

    it('should use fallback values when user has no configuration', () => {
      // Arrange
      const userId = 'user-no-config';
      const date = new Date('2025-11-06');
      const user: User = {
        ID: userId,
        // No workingDaysPerWeek, weeklyHoursDec, expectedDailyHoursDec
      } as User;

      // Act
      const entry = factory.createDefaultEntry(userId, date, user);

      // Assert
      expect(entry.expectedDailyHoursDec).toBe(8); // 40h / 5 days
      expect(entry.durationHoursNet).toBe(8);
    });

    it('should calculate custom working hours (7.5h per day)', () => {
      // Arrange
      const userId = 'user-part-time';
      const date = new Date('2025-11-06');
      const user: User = {
        ID: userId,
        workingDaysPerWeek: 5,
        weeklyHoursDec: 37.5,
        expectedDailyHoursDec: 7.5,
      } as User;

      // Act
      const entry = factory.createDefaultEntry(userId, date, user);

      // Assert
      expect(entry.expectedDailyHoursDec).toBe(7.5);
      expect(entry.durationHoursNet).toBe(7.5);
      expect(entry.endTime).toBe('16:00:00'); // 8:00 + 7.5h + 30min break
    });
  });

  describe('createWeekendEntry', () => {
    it('should create weekend entry with zero hours', () => {
      // Arrange
      const userId = 'user-123';
      const date = new Date('2025-11-08'); // Saturday

      // Act
      const entry = factory.createWeekendEntry(userId, date);

      // Assert
      expect(entry.user_ID).toBe(userId);
      expect(entry.workDate).toBe('2025-11-08');
      expect(entry.entryType_code).toBe('O');
      expect(entry.startTime).toBe('00:00:00');
      expect(entry.endTime).toBe('00:00:00');
      expect(entry.breakMin).toBe(0);
      expect(entry.durationHoursNet).toBe(0);
      expect(entry.durationHoursGross).toBe(0);
      expect(entry.overtimeHours).toBe(0);
      expect(entry.undertimeHours).toBe(0);
      expect(entry.expectedDailyHoursDec).toBe(0);
      expect(entry.source).toBe('GENERATED');
      expect(entry.note).toContain('Samstag');
      expect(entry.ID).toBeDefined();
    });
  });

  describe('createHolidayEntry', () => {
    it('should create holiday entry with holiday name in note', () => {
      // Arrange
      const userId = 'user-123';
      const date = new Date('2025-12-25');
      const holidayName = '1. Weihnachtsfeiertag';

      // Act
      const entry = factory.createHolidayEntry(userId, date, holidayName);

      // Assert
      expect(entry.user_ID).toBe(userId);
      expect(entry.workDate).toBe('2025-12-25');
      expect(entry.entryType_code).toBe('H');
      expect(entry.startTime).toBe('00:00:00');
      expect(entry.endTime).toBe('00:00:00');
      expect(entry.breakMin).toBe(0);
      expect(entry.durationHoursNet).toBe(0);
      expect(entry.overtimeHours).toBe(0);
      expect(entry.undertimeHours).toBe(0);
      expect(entry.expectedDailyHoursDec).toBe(0);
      expect(entry.source).toBe('GENERATED');
      expect(entry.note).toBe(holidayName);
      expect(entry.ID).toBeDefined();
    });
  });
});
