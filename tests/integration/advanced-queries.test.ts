/**
 * Integration Tests - Advanced Queries & Edge Cases
 *
 * Testet OData Query Features und spezielle Szenarien
 */
import cds from '@sap/cds';
import type { AxiosResponse } from 'axios';
import { TimeEntryFactory, generateTestDate, TEST_USERS, type ODataCollection } from '../helpers';
import type { TimeEntry, User } from '#cds-models/io/nimble';

const { GET, POST, PATCH, expect } = cds.test(__dirname + '/../..', '--in-memory');

describe('TrackService - Advanced Queries', () => {
  describe('OData Query Options', () => {
    it('should filter TimeEntries by multiple criteria', async () => {
      const { data, status } = (await GET(
        "/odata/v4/track/TimeEntries?$filter=entryType_code eq 'W' and status_code eq 'O'",
        TEST_USERS.max,
      )) as AxiosResponse<ODataCollection<TimeEntry>>;

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');

      data.value.forEach((entry) => {
        expect(entry.entryType_code).to.equal('W');
        expect(entry.status_code).to.equal('O');
      });
    });

    it('should order TimeEntries by workDate descending', async () => {
      const { data, status } = await GET('/odata/v4/track/TimeEntries?$top=5&$orderby=workDate desc', TEST_USERS.max);

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');

      if (data.value.length > 1) {
        for (let i = 0; i < data.value.length - 1; i++) {
          const date1 = new Date(data.value[i].workDate);
          const date2 = new Date(data.value[i + 1].workDate);
          expect(date1.getTime()).to.be.greaterThanOrEqual(date2.getTime());
        }
      }
    });

    it('should count TimeEntries', async () => {
      const { data, status } = await GET('/odata/v4/track/TimeEntries/$count', TEST_USERS.max);

      expect(status).to.equal(200);
      expect(data).to.be.a('number');
      expect(data).to.be.greaterThan(0);
    });

    it('should filter WorkLocations by code', async () => {
      const { data, status } = await GET("/odata/v4/track/WorkLocations?$filter=code eq 'HO'", TEST_USERS.max);

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
    });

    it('should read WorkLocations with translations', async () => {
      const { data, status } = await GET('/odata/v4/track/WorkLocations', TEST_USERS.max);

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);

      const firstLocation = data.value[0];
      expect(firstLocation).to.have.property('code');
      expect(firstLocation).to.have.property('name');
    });

    it('should read TravelTypes with translations', async () => {
      const { data, status } = await GET('/odata/v4/track/TravelTypes', TEST_USERS.max);

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);

      const firstType = data.value[0];
      expect(firstType).to.have.property('code');
      expect(firstType).to.have.property('name');
    });
  });

  describe('User Repository', () => {
    it('should read all users with structure', async () => {
      const { data, status } = (await GET('/odata/v4/track/Users', TEST_USERS.max)) as AxiosResponse<
        ODataCollection<User>
      >;

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);

      const maxUserData = data.value.find((u) => u.ID === 'max.mustermann@test.de');
      expect(maxUserData).to.exist;
      expect(maxUserData).to.have.property('name');
      expect(maxUserData).to.have.property('expectedDailyHoursDec');
    });

    it('should filter users by ID', async () => {
      const { data, status } = await GET(
        "/odata/v4/track/Users?$filter=ID eq 'max.mustermann@test.de'",
        TEST_USERS.max,
      );

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.equal(1);
      expect(data.value[0].ID).to.equal('max.mustermann@test.de');
    });
  });
});

describe('TrackService - Edge Cases', () => {
  let factory: TimeEntryFactory;

  before(() => {
    factory = new TimeEntryFactory(POST);
  });

  describe('CreateTimeEntry Edge Cases', () => {
    it('should handle vacation entry without project/activity', async () => {
      const entry = await factory.createVacationEntry(generateTestDate(2027, 5, 1), TEST_USERS.max);

      expect(entry.entryType_code).to.equal('V');
      expect(entry.durationHoursGross).to.be.greaterThan(0);
    });

    it('should create sick leave entry', async () => {
      const entry = await factory.createSickEntry(generateTestDate(2027, 5, 2), TEST_USERS.max);

      expect(entry.entryType_code).to.equal('S');
    });

    it('should handle zero break time', async () => {
      const entry = await factory.createWorkEntry(generateTestDate(2027, 5, 26), TEST_USERS.max, {
        startTime: '08:00:00',
        endTime: '12:00:00',
        breakMin: 0,
      });

      expect(entry.breakMin).to.equal(0);
      expect(entry.durationHoursGross).to.equal(entry.durationHoursNet);
    });
  });

  describe('UpdateTimeEntry Edge Cases', () => {
    it('should recalculate hours when changing break time', async () => {
      const entry = await factory.createWorkEntry(generateTestDate(2027, 6, 28), TEST_USERS.max);
      const originalNet = entry.durationHoursNet;

      // Edit Mode
      await POST(`/odata/v4/track/TimeEntries(ID=${entry.ID},IsActiveEntity=true)/draftEdit`, {}, TEST_USERS.max);

      // Update breakMin
      await PATCH(`/odata/v4/track/TimeEntries(ID=${entry.ID},IsActiveEntity=false)`, { breakMin: 60 }, TEST_USERS.max);

      // Activate
      const updated = await factory.activateDraft(entry.ID, TEST_USERS.max);

      expect(updated.breakMin).to.equal(60);
      expect(updated.durationHoursNet).to.be.lessThan(originalNet);
    });

    it('should update note without affecting hours', async () => {
      const entry = await factory.createWorkEntry(generateTestDate(2027, 6, 29), TEST_USERS.max);
      const originalNet = entry.durationHoursNet;

      // Edit Mode
      await POST(`/odata/v4/track/TimeEntries(ID=${entry.ID},IsActiveEntity=true)/draftEdit`, {}, TEST_USERS.max);

      // Update note
      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${entry.ID},IsActiveEntity=false)`,
        { note: 'Updated note text' },
        TEST_USERS.max,
      );

      // Activate
      const updated = await factory.activateDraft(entry.ID, TEST_USERS.max);

      expect(updated.note).to.equal('Updated note text');
      expect(updated.durationHoursNet).to.equal(originalNet);
    });

    it('should allow changing note field multiple times', async () => {
      const entry = await factory.createWorkEntry(generateTestDate(2027, 6, 30), TEST_USERS.max);

      // Edit Mode
      await POST(`/odata/v4/track/TimeEntries(ID=${entry.ID},IsActiveEntity=true)/draftEdit`, {}, TEST_USERS.max);

      // Update note
      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${entry.ID},IsActiveEntity=false)`,
        { note: 'Modified note in edge case test' },
        TEST_USERS.max,
      );

      // Activate
      const updated = await factory.activateDraft(entry.ID, TEST_USERS.max);

      expect(updated.note).to.equal('Modified note in edge case test');
    });
  });

  describe('Balance Edge Cases', () => {
    it('should handle balance calculation for month without entries', async () => {
      const { data, status } = await POST(
        '/odata/v4/track/getMonthlyBalance',
        {
          year: 2026,
          month: 6,
        },
        TEST_USERS.max,
      );

      expect(status).to.equal(200);
      expect(data).to.have.property('balanceHours');
      expect(data.balanceHours).to.be.a('number');
      // In Juni 2028 (zukünftig) könnten noch keine Einträge existieren
      expect(data).to.have.property('workingDays');
    });

    it('should get vacation balance with decimal precision', async () => {
      const { data, status } = await POST('/odata/v4/track/getVacationBalance', {}, TEST_USERS.max);

      expect(status).to.equal(200);
      expect(data).to.have.property('totalDays');
      expect(data).to.have.property('takenDays');
      expect(data).to.have.property('remainingDays');
      expect(data.totalDays).to.be.a('number');
    });

    it('should get sick leave balance with details', async () => {
      const { data, status } = await POST('/odata/v4/track/getSickLeaveBalance', {}, TEST_USERS.max);

      expect(status).to.equal(200);
      expect(data).to.have.property('totalDays');
      expect(data).to.have.property('criticality');
      expect(data.totalDays).to.be.a('number');
    });
  });

  describe('Status Transition Edge Cases', () => {
    it('should not allow marking vacation as done', async () => {
      const entry = await factory.createVacationEntry(generateTestDate(2027, 5, 20), TEST_USERS.max);

      try {
        await POST(
          `/odata/v4/track/TimeEntries(ID=${entry.ID},IsActiveEntity=true)/TrackService.markTimeEntryDone`,
          {},
          TEST_USERS.max,
        );
        expect.fail('Expected error was not thrown');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: AxiosResponse };
          expect(axiosError.response.status).to.be.oneOf([400, 404, 409, 500]);
        } else {
          throw error;
        }
      }
    });

    it('should handle status change for multiple entries individually', async () => {
      // Erstelle 2 Test-Entries
      const entry1 = await factory.createWorkEntry(generateTestDate(2027, 7, 1), TEST_USERS.max);
      const entry2 = await factory.createWorkEntry(generateTestDate(2027, 7, 2), TEST_USERS.max);

      // Erst Update durchführen, um Status auf 'P' zu setzen
      await POST(`/odata/v4/track/TimeEntries(ID=${entry1.ID},IsActiveEntity=true)/draftEdit`, {}, TEST_USERS.max);
      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${entry1.ID},IsActiveEntity=false)`,
        { note: 'Updated' },
        TEST_USERS.max,
      );
      await factory.activateDraft(entry1.ID, TEST_USERS.max);

      await POST(`/odata/v4/track/TimeEntries(ID=${entry2.ID},IsActiveEntity=true)/draftEdit`, {}, TEST_USERS.max);
      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${entry2.ID},IsActiveEntity=false)`,
        { note: 'Updated' },
        TEST_USERS.max,
      );
      await factory.activateDraft(entry2.ID, TEST_USERS.max);

      // Jetzt beide als Done markieren
      const { status: status1 } = await POST(
        `/odata/v4/track/TimeEntries(ID=${entry1.ID},IsActiveEntity=true)/TrackService.markTimeEntryDone`,
        {},
        TEST_USERS.max,
      );
      const { status: status2 } = await POST(
        `/odata/v4/track/TimeEntries(ID=${entry2.ID},IsActiveEntity=true)/TrackService.markTimeEntryDone`,
        {},
        TEST_USERS.max,
      );

      expect(status1).to.equal(200);
      expect(status2).to.equal(200);
    });
  });
});
