/**
 * Integration Tests - Generation Actions
 *
 * Testet Monthly/Yearly Generation von TimeEntries
 */
import cds from '@sap/cds';
import type { AxiosResponse } from 'axios';
import { TEST_USERS } from '../helpers';
import type { TimeEntry } from '#cds-models/io/nimble';

const { GET, POST, expect } = cds.test(__dirname + '/../..', '--in-memory');

interface GenerationResponse {
  value: TimeEntry[];
}

describe('TrackService - Generation Actions', () => {
  describe('Monthly Generation', () => {
    it('should generate monthly time entries', async () => {
      const { data, status } = (await POST(
        '/odata/v4/track/generateMonthlyTimeEntries',
        {},
        TEST_USERS.max,
      )) as AxiosResponse<GenerationResponse>;

      expect(status).to.equal(200);
      expect(data).to.be.an('object');
      expect(data).to.have.property('value');
      expect(data.value).to.be.an('array');

      const entries = data.value;
      expect(entries.length).to.be.greaterThan(0);

      entries.forEach((entry) => {
        expect(entry.user_ID).to.equal('max.mustermann@test.de');
        expect(entry).to.have.property('workDate');
        expect(entry).to.have.property('entryType_code');
      });
    });

    it('should handle generateMonthly idempotently', async () => {
      // Erste Generierung
      const { status: firstStatus } = await POST('/odata/v4/track/generateMonthlyTimeEntries', {}, TEST_USERS.max);
      expect(firstStatus).to.equal(200);

      // Zweite Generierung sollte nicht fehlschlagen
      const { status: secondStatus } = await POST('/odata/v4/track/generateMonthlyTimeEntries', {}, TEST_USERS.max);
      expect(secondStatus).to.equal(200);
    });
  });

  describe('Yearly Generation', () => {
    it('should generate yearly time entries', async () => {
      const { data, status } = (await POST(
        '/odata/v4/track/generateYearlyTimeEntries',
        {
          year: 2025,
          stateCode: 'BY', // Bayern
        },
        TEST_USERS.max,
      )) as AxiosResponse<GenerationResponse>;

      expect(status).to.equal(200);
      expect(data).to.be.an('object');
      expect(data).to.have.property('value');
      expect(data.value).to.be.an('array');

      const entries = data.value;
      expect(entries.length).to.be.greaterThan(0);

      entries.forEach((entry) => {
        expect(entry.user_ID).to.equal('max.mustermann@test.de');
        expect(entry).to.have.property('workDate');
        expect(entry.workDate).to.match(/^2025-/); // Jahr sollte 2025 sein
      });
    });

    it('should reject generateYearly with invalid state code', async () => {
      try {
        await POST('/odata/v4/track/generateYearlyTimeEntries', { year: 2025, stateCode: 'INVALID' }, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: AxiosResponse };
          expect(axiosError.response.status).to.be.oneOf([400, 500]);
        } else {
          throw error;
        }
      }
    });
  });

  describe('Default Parameters', () => {
    it('should get default generation parameters', async () => {
      const { data, status } = await GET('/odata/v4/track/getDefaultParamsForGenerateYearly()', TEST_USERS.max);

      expect(status).to.equal(200);
      expect(data).to.have.property('year');
      expect(data.year).to.equal(new Date().getFullYear());
      expect(data).to.have.property('stateCode');
      expect(data.stateCode).to.equal('BY');
    });
  });

  describe('Generation Validation', () => {
    it('should detect overlapping entries gracefully', async () => {
      // Generiere Entries für aktuellen Monat
      const { status: firstGen } = await POST('/odata/v4/track/generateMonthlyTimeEntries', {}, TEST_USERS.max);
      expect(firstGen).to.equal(200);

      // Zweite Generierung sollte Duplikate erkennen oder idempotent sein
      const { status: secondGen } = await POST('/odata/v4/track/generateMonthlyTimeEntries', {}, TEST_USERS.max);
      expect(secondGen).to.equal(200);
    });

    it('should validate state codes for holidays', async () => {
      try {
        await POST('/odata/v4/track/generateYearlyTimeEntries', { year: 2025, stateCode: 'XX' }, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: AxiosResponse };
          expect(axiosError.response.status).to.be.oneOf([400, 500]);
        } else {
          throw error;
        }
      }
    });
  });
});
