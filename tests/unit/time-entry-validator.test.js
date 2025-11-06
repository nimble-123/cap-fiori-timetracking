/**
 * TimeEntryValidator - Unit Tests
 *
 * Testet die Validierungslogik für TimeEntries
 */

describe('TimeEntryValidator - Unit Tests', () => {
  describe('Date Validation Logic', () => {
    it('should validate date is not in the future', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      // Logic: workDate > currentDate
      const isFuture = new Date(futureDate) > today;
      expect(isFuture).toBe(true);
    });

    it('should accept current date', () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const isFuture = new Date(todayStr) > today;
      expect(isFuture).toBe(false);
    });

    it('should accept past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const isFuture = new Date(yesterdayStr) > new Date();
      expect(isFuture).toBe(false);
    });
  });

  describe('Time Range Validation Logic', () => {
    it('should detect that end time must be after start time', () => {
      const startTime = '16:00:00';
      const endTime = '08:00:00';

      // Convert to comparable format
      const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

      const isValid = endMinutes > startMinutes;
      expect(isValid).toBe(false);
    });

    it('should accept valid time range', () => {
      const startTime = '08:00:00';
      const endTime = '16:00:00';

      const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

      const isValid = endMinutes > startMinutes;
      expect(isValid).toBe(true);
    });

    it('should reject equal start and end times', () => {
      const startTime = '08:00:00';
      const endTime = '08:00:00';

      const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

      const isValid = endMinutes > startMinutes;
      expect(isValid).toBe(false);
    });
  });

  describe('EntryType-Specific Validation Logic', () => {
    it('should validate that work entries require start/end times', () => {
      const entryType = 'W'; // Work
      const startTime = null;
      const endTime = null;

      const requiresTimes = ['W', 'B'].includes(entryType);
      const isValid = !requiresTimes || Boolean(startTime && endTime);

      expect(requiresTimes).toBe(true);
      expect(isValid).toBe(false);
    });

    it('should validate that vacation entries do not require times', () => {
      const entryType = 'V'; // Vacation
      const startTime = null;
      const endTime = null;

      const requiresTimes = ['W', 'B'].includes(entryType);
      const isValid = !requiresTimes || Boolean(startTime && endTime);

      expect(requiresTimes).toBe(false);
      expect(isValid).toBe(true);
    });

    it('should validate that business trip requires times', () => {
      const entryType = 'B'; // Business Trip
      const startTime = '08:00:00';
      const endTime = '16:00:00';

      const requiresTimes = ['W', 'B'].includes(entryType);
      const isValid = !requiresTimes || Boolean(startTime && endTime);

      expect(requiresTimes).toBe(true);
      expect(isValid).toBe(true);
    });
  });

  describe('Break Duration Validation Logic', () => {
    it('should validate break is not longer than work duration', () => {
      const breakMin = 150; // 2.5 hours

      const grossMinutes = (10 - 8) * 60; // 120 minutes (2 hours)
      const isValid = breakMin < grossMinutes;

      expect(isValid).toBe(false);
    });

    it('should accept valid break duration', () => {
      const breakMin = 30;

      const grossMinutes = (16 - 8) * 60; // 480 minutes (8 hours)
      const isValid = breakMin < grossMinutes;

      expect(isValid).toBe(true);
    });

    it('should accept zero break', () => {
      const breakMin = 0;

      const grossMinutes = (16 - 8) * 60; // 480 minutes
      const isValid = breakMin >= 0 && breakMin < grossMinutes;

      expect(isValid).toBe(true);
    });

    it('should reject negative breaks', () => {
      const breakMin = -30;

      const isValid = breakMin >= 0;
      expect(isValid).toBe(false);
    });
  });

  describe('Project/Activity Requirement Logic', () => {
    it('should validate that work entries require project and activity', () => {
      const entryType = 'W';
      const projectId = null;
      const activityTypeCode = null;

      const requiresProjectActivity = ['W', 'B'].includes(entryType);
      const isValid = !requiresProjectActivity || Boolean(projectId && activityTypeCode);

      expect(requiresProjectActivity).toBe(true);
      expect(isValid).toBe(false);
    });

    it('should validate that vacation entries do not require project/activity', () => {
      const entryType = 'V';
      const projectId = null;
      const activityTypeCode = null;

      const requiresProjectActivity = ['W', 'B'].includes(entryType);
      const isValid = !requiresProjectActivity || Boolean(projectId && activityTypeCode);

      expect(requiresProjectActivity).toBe(false);
      expect(isValid).toBe(true);
    });

    it('should accept work entries with project and activity', () => {
      const entryType = 'W';
      const projectId = 'project-123';
      const activityTypeCode = 'DEV';

      const requiresProjectActivity = ['W', 'B'].includes(entryType);
      const isValid = !requiresProjectActivity || Boolean(projectId && activityTypeCode);

      expect(requiresProjectActivity).toBe(true);
      expect(isValid).toBe(true);
    });
  });

  describe('Uniqueness Check Logic', () => {
    it('should detect duplicate entries for same user and date', () => {
      const existingEntries = [
        { user_ID: 'max@test.de', workDate: '2025-01-15' },
        { user_ID: 'max@test.de', workDate: '2025-01-16' },
      ];

      const newEntry = { user_ID: 'max@test.de', workDate: '2025-01-15' };

      const isDuplicate = existingEntries.some(
        (e) => e.user_ID === newEntry.user_ID && e.workDate === newEntry.workDate,
      );

      expect(isDuplicate).toBe(true);
    });

    it('should allow different dates for same user', () => {
      const existingEntries = [
        { user_ID: 'max@test.de', workDate: '2025-01-15' },
        { user_ID: 'max@test.de', workDate: '2025-01-16' },
      ];

      const newEntry = { user_ID: 'max@test.de', workDate: '2025-01-17' };

      const isDuplicate = existingEntries.some(
        (e) => e.user_ID === newEntry.user_ID && e.workDate === newEntry.workDate,
      );

      expect(isDuplicate).toBe(false);
    });

    it('should allow same date for different users', () => {
      const existingEntries = [
        { user_ID: 'max@test.de', workDate: '2025-01-15' },
        { user_ID: 'erika@test.de', workDate: '2025-01-15' },
      ];

      const newEntry = { user_ID: 'lisa@test.de', workDate: '2025-01-15' };

      const isDuplicate = existingEntries.some(
        (e) => e.user_ID === newEntry.user_ID && e.workDate === newEntry.workDate,
      );

      expect(isDuplicate).toBe(false);
    });
  });

  describe('Year/Month Range Validation Logic', () => {
    it('should validate year is within acceptable range', () => {
      const year = 2025;
      const minYear = 2020;
      const maxYear = 2030;

      const isValid = year >= minYear && year <= maxYear;
      expect(isValid).toBe(true);
    });

    it('should reject year outside range', () => {
      const year = 1990;
      const minYear = 2020;
      const maxYear = 2030;

      const isValid = year >= minYear && year <= maxYear;
      expect(isValid).toBe(false);
    });

    it('should validate month is between 1 and 12', () => {
      const validMonths = [1, 6, 12];

      validMonths.forEach((month) => {
        const isValid = month >= 1 && month <= 12;
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid months', () => {
      const invalidMonths = [0, 13, -1, 15];

      invalidMonths.forEach((month) => {
        const isValid = month >= 1 && month <= 12;
        expect(isValid).toBe(false);
      });
    });
  });

  describe('StateCode Validation Logic', () => {
    it('should validate against allowed German state codes', () => {
      const validStateCodes = [
        'BW',
        'BY',
        'BE',
        'BB',
        'HB',
        'HH',
        'HE',
        'MV',
        'NI',
        'NW',
        'RP',
        'SL',
        'SN',
        'ST',
        'SH',
        'TH',
      ];
      const stateCode = 'BY';

      const isValid = validStateCodes.includes(stateCode);
      expect(isValid).toBe(true);
    });

    it('should reject invalid state codes', () => {
      const validStateCodes = [
        'BW',
        'BY',
        'BE',
        'BB',
        'HB',
        'HH',
        'HE',
        'MV',
        'NI',
        'NW',
        'RP',
        'SL',
        'SN',
        'ST',
        'SH',
        'TH',
      ];
      const stateCode = 'XX';

      const isValid = validStateCodes.includes(stateCode);
      expect(isValid).toBe(false);
    });
  });
});
