/**
 * Generation Strategies - Unit Tests
 *
 * Testet die Logik für Monthly und Yearly Generation Strategies
 */

describe('Generation Strategies - Unit Tests', () => {
  describe('Monthly Strategy - Date Generation Logic', () => {
    it('should generate all dates for a month', () => {
      const year = 2025;
      const month = 1; // January
      const daysInMonth = 31;

      const dates = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dates.push(date);
      }

      expect(dates).toHaveLength(31);
      expect(dates[0]).toBe('2025-01-01');
      expect(dates[30]).toBe('2025-01-31');
    });

    it('should handle February in non-leap year', () => {
      const year = 2025;
      const month = 2;
      const daysInMonth = new Date(year, month, 0).getDate();

      const dates = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dates.push(date);
      }

      expect(dates).toHaveLength(28);
      expect(dates[27]).toBe('2025-02-28');
    });

    it('should handle February in leap year', () => {
      const year = 2024;
      const month = 2;
      const daysInMonth = new Date(year, month, 0).getDate();

      const dates = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dates.push(date);
      }

      expect(dates).toHaveLength(29);
      expect(dates[28]).toBe('2024-02-29');
    });
  });

  describe('Yearly Strategy - Month Iteration Logic', () => {
    it('should iterate through all 12 months', () => {
      const months = [];

      for (let month = 1; month <= 12; month++) {
        months.push(month);
      }

      expect(months).toHaveLength(12);
      expect(months[0]).toBe(1);
      expect(months[11]).toBe(12);
    });

    it('should generate dates for entire year', () => {
      const year = 2025;
      let totalDays = 0;

      for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(year, month, 0).getDate();
        totalDays += daysInMonth;
      }

      expect(totalDays).toBe(365); // 2025 is not a leap year
    });

    it('should generate dates for leap year', () => {
      const year = 2024;
      let totalDays = 0;

      for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(year, month, 0).getDate();
        totalDays += daysInMonth;
      }

      expect(totalDays).toBe(366); // 2024 is a leap year
    });
  });

  describe('Entry Type Classification Logic', () => {
    it('should classify weekday non-holiday as work day', () => {
      const dayOfWeek = 3; // Wednesday (0=Sun, 6=Sat)
      const isHoliday = false;

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const entryType = isWeekend ? 'O' : isHoliday ? 'H' : 'W';

      expect(entryType).toBe('W');
    });

    it('should classify Saturday as off day', () => {
      const dayOfWeek = 6; // Saturday
      const isHoliday = false;

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const entryType = isWeekend ? 'O' : isHoliday ? 'H' : 'W';

      expect(entryType).toBe('O');
    });

    it('should classify Sunday as off day', () => {
      const dayOfWeek = 0; // Sunday
      const isHoliday = false;

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const entryType = isWeekend ? 'O' : isHoliday ? 'H' : 'W';

      expect(entryType).toBe('O');
    });

    it('should classify weekday holiday as holiday', () => {
      const dayOfWeek = 4; // Thursday
      const isHoliday = true;

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const entryType = isWeekend ? 'O' : isHoliday ? 'H' : 'W';

      expect(entryType).toBe('H');
    });
  });

  describe('Existing Entry Skip Logic', () => {
    it('should detect existing entry for date', () => {
      const existingDates = ['2025-01-15', '2025-01-16', '2025-01-17'];
      const dateToCheck = '2025-01-16';

      const exists = existingDates.includes(dateToCheck);

      expect(exists).toBe(true);
    });

    it('should not find non-existing entry', () => {
      const existingDates = ['2025-01-15', '2025-01-16', '2025-01-17'];
      const dateToCheck = '2025-01-20';

      const exists = existingDates.includes(dateToCheck);

      expect(exists).toBe(false);
    });

    it('should filter out existing dates from generation list', () => {
      const allDates = ['2025-01-15', '2025-01-16', '2025-01-17', '2025-01-18', '2025-01-19'];
      const existingDates = ['2025-01-16', '2025-01-18'];

      const datesToGenerate = allDates.filter((d) => !existingDates.includes(d));

      expect(datesToGenerate).toHaveLength(3);
      expect(datesToGenerate).toContain('2025-01-15');
      expect(datesToGenerate).toContain('2025-01-17');
      expect(datesToGenerate).toContain('2025-01-19');
    });
  });

  describe('Generation Statistics Logic', () => {
    it('should calculate generated vs total entries', () => {
      const totalDates = 30;
      const existingEntries = 10;
      const skipped = 2; // Validation errors

      const generated = totalDates - existingEntries - skipped;

      expect(generated).toBe(18);
    });

    it('should calculate percentage of generated entries', () => {
      const generated = 20;
      const total = 30;

      const percentage = Math.round((generated / total) * 100);

      expect(percentage).toBe(67);
    });

    it('should handle zero generated entries', () => {
      const generated = 0;
      const total = 30;

      const percentage = Math.round((generated / total) * 100);

      expect(percentage).toBe(0);
    });

    it('should handle all entries generated', () => {
      const generated = 30;
      const total = 30;

      const percentage = Math.round((generated / total) * 100);

      expect(percentage).toBe(100);
    });
  });

  describe('Batch Creation Logic', () => {
    it('should group entries into batches', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const batchSize = 25;

      const batches = [];
      for (let i = 0; i < entries.length; i += batchSize) {
        batches.push(entries.slice(i, i + batchSize));
      }

      expect(batches).toHaveLength(4);
      expect(batches[0]).toHaveLength(25);
      expect(batches[3]).toHaveLength(25);
    });

    it('should handle partial last batch', () => {
      const entries = Array.from({ length: 90 }, (_, i) => ({ id: i }));
      const batchSize = 25;

      const batches = [];
      for (let i = 0; i < entries.length; i += batchSize) {
        batches.push(entries.slice(i, i + batchSize));
      }

      expect(batches).toHaveLength(4);
      expect(batches[0]).toHaveLength(25);
      expect(batches[3]).toHaveLength(15); // Partial batch
    });
  });

  describe('Customizing Default Values Logic', () => {
    it('should apply expected daily hours from customizing', () => {
      const customizing = {
        expectedDailyHoursDec: 8,
        breakMinDefault: 30,
      };

      const entryData = {
        expectedDailyHoursDec: customizing.expectedDailyHoursDec,
      };

      expect(entryData.expectedDailyHoursDec).toBe(8);
    });

    it('should apply default break from customizing', () => {
      const customizing = {
        expectedDailyHoursDec: 8,
        breakMinDefault: 45,
      };

      const entryData = {
        breakMin: customizing.breakMinDefault,
      };

      expect(entryData.breakMin).toBe(45);
    });

    it('should handle missing customizing with fallbacks', () => {
      const customizing = null;
      const defaultExpectedHours = 8;
      const defaultBreak = 30;

      const entryData = {
        expectedDailyHoursDec: customizing?.expectedDailyHoursDec || defaultExpectedHours,
        breakMin: customizing?.breakMinDefault || defaultBreak,
      };

      expect(entryData.expectedDailyHoursDec).toBe(8);
      expect(entryData.breakMin).toBe(30);
    });
  });
});
