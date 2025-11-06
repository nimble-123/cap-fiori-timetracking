/**
 * Integration Tests - Balance Functions
 *
 * Testet Balance-Berechnungen (Monthly, Current, Vacation, Sick Leave)
 */
import cds from '@sap/cds';
import type { AxiosResponse } from 'axios';
import { TimeEntryFactory, TEST_USERS, type ODataCollection } from '../helpers';
import type { MonthlyBalance, VacationBalance, SickLeaveBalance } from '#cds-models/TrackService';

const { GET, POST, expect } = cds.test(__dirname + '/../..', '--in-memory');

interface CurrentBalanceResponse {
  value: number;
}

describe('TrackService - Balance Functions', () => {
  let factory: TimeEntryFactory;
  const targetYear = 2025;
  const targetMonth = 11; // November (aktueller Monat)

  before(async () => {
    factory = new TimeEntryFactory(POST);

    // Setup: Erstelle Entry falls noch nicht vorhanden
    try {
      const testDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-21`;
      await factory.createWorkEntry(testDate, TEST_USERS.max, {
        endTime: '18:00:00', // 10h - Überstunden
        breakMin: 60,
      });
    } catch (error) {
      // Entry existiert bereits - das ist OK
      if (error instanceof Error && !error.message.includes('409')) {
        throw error;
      }
    }
  });

  describe('Monthly Balance', () => {
    it('should calculate monthly balance', async () => {
      const { data, status } = (await POST(
        '/odata/v4/track/getMonthlyBalance',
        { year: targetYear, month: targetMonth },
        TEST_USERS.max,
      )) as AxiosResponse<MonthlyBalance>;

      expect(status).to.equal(200);
      expect(data).to.have.property('month');
      expect(data.year).to.equal(targetYear);
      expect(data.monthNumber).to.equal(targetMonth); // monthNumber ist die Zahl
      expect(data.month).to.equal(`${targetYear}-11`); // month ist der String
      expect(data).to.have.property('balanceHours');
      expect(data.balanceHours).to.be.a('number');
      expect(data).to.have.property('balanceCriticality');
      expect(data.balanceCriticality).to.be.oneOf([0, 1, 2, 3]);
    });

    it('should handle getMonthlyBalance with invalid year', async () => {
      try {
        await POST('/odata/v4/track/getMonthlyBalance', { year: 1999, month: 1 }, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        if (error instanceof Error && 'response' in error) {
          const axiosError = error as Error & { response: AxiosResponse };
          expect(axiosError.response.status).to.be.oneOf([400, 500]);
        } else {
          throw error;
        }
      }
    });

    it('should handle getMonthlyBalance with invalid month', async () => {
      try {
        await POST('/odata/v4/track/getMonthlyBalance', { year: 2025, month: 13 }, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        if (error instanceof Error && 'response' in error) {
          const axiosError = error as Error & { response: AxiosResponse };
          expect(axiosError.response.status).to.be.oneOf([400, 500]);
        } else {
          throw error;
        }
      }
    });

    it('should validate year boundaries - too old', async () => {
      try {
        await POST('/odata/v4/track/getMonthlyBalance', { year: 2010, month: 1 }, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        if (error instanceof Error && 'response' in error) {
          const axiosError = error as Error & { response: AxiosResponse };
          expect(axiosError.response.status).to.be.oneOf([400, 500]);
        } else {
          throw error;
        }
      }
    });

    it('should validate year boundaries - too new', async () => {
      try {
        await POST('/odata/v4/track/getMonthlyBalance', { year: 2030, month: 1 }, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        if (error instanceof Error && 'response' in error) {
          const axiosError = error as Error & { response: AxiosResponse };
          expect(axiosError.response.status).to.be.oneOf([400, 500]);
        } else {
          throw error;
        }
      }
    });
  });

  describe('Current Balance', () => {
    it('should get current balance', async () => {
      const { data, status } = (await POST(
        '/odata/v4/track/getCurrentBalance',
        {},
        TEST_USERS.max,
      )) as AxiosResponse<CurrentBalanceResponse>;

      expect(status).to.equal(200);
      expect(data).to.have.property('value');
      expect(data.value).to.be.a('number');
    });

    it('should handle getCurrentBalance when no entries exist for user', async () => {
      const { data, status } = (await POST(
        '/odata/v4/track/getCurrentBalance',
        {},
        TEST_USERS.erika,
      )) as AxiosResponse<CurrentBalanceResponse>;

      expect(status).to.equal(200);
      expect(data).to.have.property('value');
      expect(data.value).to.be.a('number');
    });
  });

  describe('Recent Balances', () => {
    it('should get recent balances', async () => {
      const { data, status } = (await GET('/odata/v4/track/MonthlyBalances', TEST_USERS.max)) as AxiosResponse<
        ODataCollection<MonthlyBalance>
      >;

      expect(status).to.equal(200);
      expect(data).to.have.property('value');
      expect(data.value).to.be.an('array');

      if (data.value.length > 0) {
        data.value.forEach((balance) => {
          expect(balance).to.have.property('year');
          expect(balance).to.have.property('month');
          expect(balance).to.have.property('balanceHours');
        });
      }
    });
  });

  describe('Vacation Balance', () => {
    it('should get vacation balance', async () => {
      const { data, status } = (await POST(
        '/odata/v4/track/getVacationBalance',
        {},
        TEST_USERS.max,
      )) as AxiosResponse<VacationBalance>;

      expect(status).to.equal(200);
      expect(data).to.have.property('year');
      expect(data).to.have.property('totalDays');
      expect(data).to.have.property('takenDays');
      expect(data).to.have.property('remainingDays');
      expect(data).to.have.property('balanceCriticality');

      expect(data.totalDays).to.be.a('number');
      expect(data.takenDays).to.be.a('number');
      expect(data.remainingDays).to.be.a('number');
    });
  });

  describe('Sick Leave Balance', () => {
    it('should get sick leave balance', async () => {
      const { data, status } = (await POST(
        '/odata/v4/track/getSickLeaveBalance',
        {},
        TEST_USERS.max,
      )) as AxiosResponse<SickLeaveBalance>;

      expect(status).to.equal(200);
      expect(data).to.have.property('year');
      expect(data).to.have.property('totalDays');
      expect(data).to.have.property('criticality');

      expect(data.totalDays).to.be.a('number');
    });
  });
});
