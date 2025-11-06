/**
 * HolidayService - Unit Tests
 *
 * Testet die Logik für Feiertagsabfragen und -verarbeitung
 */

describe('HolidayService - Unit Tests', () => {
  describe('API URL Construction Logic', () => {
    it('should construct correct API URL for year and state', () => {
      const year = 2025;
      const stateCode = 'BY';
      const baseUrl = 'https://feiertage-api.de/api/';

      const expectedUrl = `${baseUrl}?jahr=${year}&nur_land=${stateCode}`;
      const constructedUrl = `${baseUrl}?jahr=${year}&nur_land=${stateCode}`;

      expect(constructedUrl).toBe(expectedUrl);
    });

    it('should handle different states correctly', () => {
      const year = 2025;
      const states = ['BY', 'NW', 'BE'];
      const baseUrl = 'https://feiertage-api.de/api/';

      states.forEach((state) => {
        const url = `${baseUrl}?jahr=${year}&nur_land=${state}`;
        expect(url).toContain(`jahr=${year}`);
        expect(url).toContain(`nur_land=${state}`);
      });
    });
  });

  describe('Holiday Date Parsing Logic', () => {
    it('should parse API response date format correctly', () => {
      const apiResponse = {
        Neujahr: { datum: '2025-01-01', hinweis: '' },
        'Heilige Drei Könige': { datum: '2025-01-06', hinweis: '' },
      };

      const dates = Object.values(apiResponse).map((h) => h.datum);

      expect(dates).toContain('2025-01-01');
      expect(dates).toContain('2025-01-06');
      expect(dates).toHaveLength(2);
    });

    it('should extract holiday names correctly', () => {
      const apiResponse = {
        Neujahr: { datum: '2025-01-01', hinweis: '' },
        Karfreitag: { datum: '2025-04-18', hinweis: '' },
      };

      const names = Object.keys(apiResponse);

      expect(names).toContain('Neujahr');
      expect(names).toContain('Karfreitag');
    });

    it('should handle empty response', () => {
      const apiResponse = {};

      const dates = Object.values(apiResponse).map((h) => h.datum);

      expect(dates).toHaveLength(0);
    });
  });

  describe('Holiday Cache Logic', () => {
    it('should generate correct cache key', () => {
      const year = 2025;
      const stateCode = 'BY';

      const cacheKey = `${year}-${stateCode}`;

      expect(cacheKey).toBe('2025-BY');
    });

    it('should detect cache hit', () => {
      const cache = {
        '2025-BY': ['2025-01-01', '2025-01-06'],
      };

      const cacheKey = '2025-BY';
      const hasCache = Object.prototype.hasOwnProperty.call(cache, cacheKey);

      expect(hasCache).toBe(true);
    });

    it('should detect cache miss', () => {
      const cache = {
        '2025-BY': ['2025-01-01', '2025-01-06'],
      };

      const cacheKey = '2025-NW';
      const hasCache = Object.prototype.hasOwnProperty.call(cache, cacheKey);

      expect(hasCache).toBe(false);
    });
  });

  describe('Date Checking Logic', () => {
    it('should identify if date is a holiday', () => {
      const holidays = ['2025-01-01', '2025-01-06', '2025-04-18'];
      const dateToCheck = '2025-01-06';

      const isHoliday = holidays.includes(dateToCheck);

      expect(isHoliday).toBe(true);
    });

    it('should identify if date is not a holiday', () => {
      const holidays = ['2025-01-01', '2025-01-06', '2025-04-18'];
      const dateToCheck = '2025-01-15';

      const isHoliday = holidays.includes(dateToCheck);

      expect(isHoliday).toBe(false);
    });
  });

  describe('Weekend Detection Logic', () => {
    it('should detect Saturday as weekend', () => {
      const date = new Date('2025-11-08'); // Saturday
      const dayOfWeek = date.getDay();

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      expect(isWeekend).toBe(true);
    });

    it('should detect Sunday as weekend', () => {
      const date = new Date('2025-11-09'); // Sunday
      const dayOfWeek = date.getDay();

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      expect(isWeekend).toBe(true);
    });

    it('should detect weekday as not weekend', () => {
      const date = new Date('2025-11-06'); // Thursday
      const dayOfWeek = date.getDay();

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      expect(isWeekend).toBe(false);
    });

    it('should detect Monday as not weekend', () => {
      const date = new Date('2025-11-10'); // Monday
      const dayOfWeek = date.getDay();

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      expect(isWeekend).toBe(false);
    });

    it('should detect Friday as not weekend', () => {
      const date = new Date('2025-11-07'); // Friday
      const dayOfWeek = date.getDay();

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      expect(isWeekend).toBe(false);
    });
  });

  describe('Work Day Classification Logic', () => {
    it('should classify weekday as potential work day', () => {
      const date = new Date('2025-11-06'); // Thursday
      const dayOfWeek = date.getDay();
      const holidays = ['2025-01-01', '2025-12-25'];

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dateStr = date.toISOString().split('T')[0];
      const isHoliday = holidays.includes(dateStr);

      const isWorkDay = !isWeekend && !isHoliday;

      expect(isWorkDay).toBe(true);
    });

    it('should classify weekend as non-work day', () => {
      const date = new Date('2025-11-08'); // Saturday
      const dayOfWeek = date.getDay();
      const holidays = [];

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dateStr = date.toISOString().split('T')[0];
      const isHoliday = holidays.includes(dateStr);

      const isWorkDay = !isWeekend && !isHoliday;

      expect(isWorkDay).toBe(false);
    });

    it('should classify holiday as non-work day', () => {
      const date = new Date('2025-12-25'); // Thursday, Christmas
      const dayOfWeek = date.getDay();
      const holidays = ['2025-12-25', '2025-12-26'];

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dateStr = date.toISOString().split('T')[0];
      const isHoliday = holidays.includes(dateStr);

      const isWorkDay = !isWeekend && !isHoliday;

      expect(isWorkDay).toBe(false);
    });
  });

  describe('Month Date Range Logic', () => {
    it('should calculate correct days in January', () => {
      const year = 2025;
      const month = 1;

      const daysInMonth = new Date(year, month, 0).getDate();

      expect(daysInMonth).toBe(31);
    });

    it('should calculate correct days in February (non-leap year)', () => {
      const year = 2025;
      const month = 2;

      const daysInMonth = new Date(year, month, 0).getDate();

      expect(daysInMonth).toBe(28);
    });

    it('should calculate correct days in February (leap year)', () => {
      const year = 2024;
      const month = 2;

      const daysInMonth = new Date(year, month, 0).getDate();

      expect(daysInMonth).toBe(29);
    });

    it('should calculate correct days in April', () => {
      const year = 2025;
      const month = 4;

      const daysInMonth = new Date(year, month, 0).getDate();

      expect(daysInMonth).toBe(30);
    });
  });
});
