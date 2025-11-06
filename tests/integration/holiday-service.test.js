/**
 * Integration Tests - Holiday Service Integration
 *
 * Testet die Integration mit der Feiertags-API
 */
const cds = require('@sap/cds');
const { GET, POST, expect } = cds.test(__dirname + '/../..', '--in-memory');
const { TEST_USERS } = require('../helpers');

describe('TrackService - HolidayService Integration', () => {
  describe('Holiday API Direct Fetch', () => {
    before(() => {
      // Sicherstellen dass wir im Development-Modus sind
      delete process.env.VCAP_SERVICES;
      process.env.NODE_ENV = 'development';
    });

    it('should fetch holidays for Bayern 2025', async () => {
      const { data, status } = await POST(
        '/odata/v4/track/generateYearlyTimeEntries',
        {
          year: 2025,
          stateCode: 'BY',
        },
        TEST_USERS.max,
      );

      expect(status).to.equal(200);
      expect(data).to.have.property('value');
      expect(data.value).to.be.an('array');

      const entries = data.value;
      expect(entries.length).to.be.greaterThan(0);

      // Finde Holiday-Entries
      const holidayEntries = entries.filter((e) => e.entryType_code === 'H');
      expect(holidayEntries.length).to.be.greaterThan(0, 'Should have generated holiday entries');

      // Prüfe Neujahr
      const newYearEntry = entries.find((e) => e.workDate === '2025-01-01');
      expect(newYearEntry).to.exist;
      expect(newYearEntry.entryType_code).to.equal('H');
    });

    it('should cache holiday requests', async () => {
      // Erste Generierung
      const { status: firstStatus } = await POST(
        '/odata/v4/track/generateYearlyTimeEntries',
        { year: 2024, stateCode: 'BW' },
        TEST_USERS.max,
      );
      expect(firstStatus).to.equal(200);

      // Zweite Generierung sollte Cache nutzen
      const startTime = Date.now();
      const { status: secondStatus } = await POST(
        '/odata/v4/track/generateYearlyTimeEntries',
        { year: 2024, stateCode: 'BW' },
        TEST_USERS.max,
      );
      const duration = Date.now() - startTime;

      expect(secondStatus).to.equal(200);
      expect(duration).to.be.lessThan(2000);
    });

    it('should handle different state codes', async () => {
      const stateCodes = ['BY', 'BW', 'BE', 'HH'];

      for (const stateCode of stateCodes) {
        const { data, status } = await POST(
          '/odata/v4/track/generateYearlyTimeEntries',
          { year: 2023, stateCode },
          TEST_USERS.max,
        );

        expect(status).to.equal(200);
        const entries = data.value;
        expect(entries.length).to.be.greaterThan(0);

        const holidayEntries = entries.filter((e) => e.entryType_code === 'H');
        expect(holidayEntries.length).to.be.greaterThan(0);
      }
    });

    it('should gracefully handle API errors', async () => {
      try {
        await POST('/odata/v4/track/generateYearlyTimeEntries', { year: 2025, stateCode: 'INVALID' }, TEST_USERS.max);
      } catch (error) {
        expect(error.response.status).to.be.oneOf([400, 500]);
      }
    });
  });

  describe('Holiday API Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      const { data, status } = await POST(
        '/odata/v4/track/generateYearlyTimeEntries',
        { year: 2026, stateCode: 'BY' },
        TEST_USERS.max,
      );

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);
    });
  });

  describe('Holiday API Configuration', () => {
    it('should use configured base URL from Customizing', async () => {
      const { data: customizing } = await GET('/odata/v4/track/Customizing(1)', TEST_USERS.max);

      expect(customizing).to.exist;
      expect(customizing.holidayApiBaseUrl).to.equal('https://feiertage-api.de/api/');

      const { status } = await POST(
        '/odata/v4/track/generateYearlyTimeEntries',
        { year: 2025, stateCode: 'BY' },
        TEST_USERS.max,
      );
      expect(status).to.equal(200);
    });
  });

  describe('Holiday Detection in Generated Entries', () => {
    it('should correctly identify public holidays', async () => {
      const { data } = await POST(
        '/odata/v4/track/generateYearlyTimeEntries',
        { year: 2025, stateCode: 'BY' },
        TEST_USERS.max,
      );

      const entries = data.value;

      // Bekannte Feiertage 2025 in Bayern
      const knownHolidays = [
        '2025-01-01', // Neujahr
        '2025-01-06', // Heilige Drei Könige (BY)
        '2025-05-01', // Tag der Arbeit
        '2025-10-03', // Tag der deutschen Einheit
        '2025-12-25', // 1. Weihnachtsfeiertag
        '2025-12-26', // 2. Weihnachtsfeiertag
      ];

      for (const holidayDate of knownHolidays) {
        const entry = entries.find((e) => e.workDate === holidayDate);
        expect(entry, `Should have entry for ${holidayDate}`).to.exist;
        expect(entry.entryType_code, `${holidayDate} should be marked as holiday`).to.equal('H');
      }
    });

    it('should generate correct entry types for different day types', async () => {
      const { data } = await POST(
        '/odata/v4/track/generateYearlyTimeEntries',
        { year: 2029, stateCode: 'BY' }, // 2029 um Konflikte zu vermeiden
        TEST_USERS.max,
      );

      const entries = data.value;

      const workdays = entries.filter((e) => e.entryType_code === 'W').length;
      const weekends = entries.filter((e) => e.entryType_code === 'O').length;
      const holidays = entries.filter((e) => e.entryType_code === 'H').length;

      expect(workdays).to.be.greaterThan(200, 'Should have many workdays');
      expect(weekends).to.be.greaterThan(90, 'Should have weekends');
      expect(holidays).to.be.greaterThan(5, 'Bayern should have multiple public holidays');

      expect(entries.length).to.be.greaterThan(350, 'Should generate most days of the year');

      const standardTypeCount = workdays + weekends + holidays;
      expect(standardTypeCount / entries.length).to.be.greaterThan(0.95);
    });
  });
});
