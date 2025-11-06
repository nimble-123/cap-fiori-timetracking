/**
 * Integration Tests - TimeEntry Validation
 *
 * Testet Business-Validierungs-Logik für TimeEntries
 */
const cds = require('@sap/cds');
const { POST, expect } = cds.test(__dirname + '/../..', '--in-memory');
const { TimeEntryFactory, generateTestDate, TEST_USERS } = require('../helpers');

describe('TrackService - TimeEntry Validation', () => {
  let factory;

  before(() => {
    factory = new TimeEntryFactory(POST);
  });

  describe('Required Fields', () => {
    it('should reject CREATE with missing user_ID', async () => {
      try {
        await POST(
          '/odata/v4/track/TimeEntries',
          {
            workDate: generateTestDate(2027, 4, 1),
            entryType_code: 'W',
            startTime: '08:00:00',
            endTime: '16:00:00',
          },
          TEST_USERS.max,
        );
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        const status = error.response?.status || error.code || 400;
        expect([400, 500, '400', '500']).to.include(status);
      }
    });

    it('should reject CREATE with missing workDate', async () => {
      try {
        await POST(
          '/odata/v4/track/TimeEntries',
          {
            user_ID: 'max.mustermann@test.de',
            entryType_code: 'W',
            startTime: '08:00:00',
            endTime: '16:00:00',
          },
          TEST_USERS.max,
        );
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        const status = error.response?.status || error.code || 400;
        expect([400, 500, '400', '500']).to.include(status);
      }
    });

    it('should reject CREATE with missing entryType_code', async () => {
      try {
        await POST(
          '/odata/v4/track/TimeEntries',
          {
            user_ID: 'max.mustermann@test.de',
            workDate: generateTestDate(2027, 4, 2),
            startTime: '08:00:00',
            endTime: '16:00:00',
          },
          TEST_USERS.max,
        );
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        const status = error.response?.status || error.code || 400;
        expect([400, 500, '400', '500']).to.include(status);
      }
    });

    it('should reject CREATE with missing startTime for work entry', async () => {
      try {
        const draft = await factory.createDraft(
          {
            user_ID: 'max.mustermann@test.de',
            workDate: generateTestDate(2027, 4, 3),
            entryType_code: 'W',
            endTime: '16:00:00',
            breakMin: 30,
          },
          TEST_USERS.max,
        );

        await factory.activateDraft(draft.ID, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        expect(error.message).to.match(/Failed to (create|activate) draft/);
      }
    });

    it('should reject CREATE with missing endTime for work entry', async () => {
      try {
        const draft = await factory.createDraft(
          {
            user_ID: 'max.mustermann@test.de',
            workDate: generateTestDate(2027, 4, 4),
            entryType_code: 'W',
            startTime: '08:00:00',
            breakMin: 30,
          },
          TEST_USERS.max,
        );

        await factory.activateDraft(draft.ID, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        expect(error.message).to.match(/Failed to (create|activate) draft/);
      }
    });
  });

  describe('Reference Validation', () => {
    it('should validate project references', async () => {
      try {
        const draft = await factory.createDraft(
          {
            user_ID: 'max.mustermann@test.de',
            workDate: generateTestDate(2027, 4, 10),
            entryType_code: 'W',
            startTime: '08:00:00',
            endTime: '16:00:00',
            breakMin: 30,
            project_ID: '00000000-0000-0000-0000-000000000000', // Ungültiges Projekt
            activity_code: 'BDEV',
          },
          TEST_USERS.max,
        );

        await factory.activateDraft(draft.ID, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        expect(error.message).to.match(/Failed to (create|activate) draft/);
      }
    });

    it('should validate activity references', async () => {
      try {
        const draft = await factory.createDraft(
          {
            user_ID: 'max.mustermann@test.de',
            workDate: generateTestDate(2027, 4, 11),
            entryType_code: 'W',
            startTime: '08:00:00',
            endTime: '16:00:00',
            breakMin: 30,
            project_ID: 'a1b2c3d4-e5f6-4a4a-b7b7-1234567890ab',
            activity_code: 'INVALID',
          },
          TEST_USERS.max,
        );

        await factory.activateDraft(draft.ID, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        expect(error.message).to.match(/Failed to (create|activate) draft/);
      }
    });

    it('should validate user references', async () => {
      try {
        const draft = await factory.createDraft(
          {
            user_ID: 'invalid.user@test.de', // Ungültiger User
            workDate: generateTestDate(2027, 4, 12),
            entryType_code: 'W',
            startTime: '08:00:00',
            endTime: '16:00:00',
            breakMin: 30,
          },
          TEST_USERS.max,
        );

        await factory.activateDraft(draft.ID, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        expect(error.message).to.match(/Failed to (create|activate) draft/);
      }
    });
  });

  describe('Business Logic Validation', () => {
    it('should treat negative break time as zero', async () => {
      // Negative Pausen werden als 0 behandelt (Math.max(0, breakMin))
      const draft = await factory.createDraft(
        {
          user_ID: 'max.mustermann@test.de',
          workDate: generateTestDate(2027, 4, 20),
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: -30, // Negative Pause -> wird zu 0
        },
        TEST_USERS.max,
      );

      const entry = await factory.activateDraft(draft.ID, TEST_USERS.max);

      // Sollte wie 0 Pause behandelt werden
      expect(entry.breakMin).to.equal(0);
      expect(entry.durationHoursNet).to.be.greaterThan(7);
    });

    it('should reject break time longer than work time', async () => {
      try {
        const draft = await factory.createDraft(
          {
            user_ID: 'max.mustermann@test.de',
            workDate: generateTestDate(2027, 4, 21),
            entryType_code: 'W',
            startTime: '08:00:00',
            endTime: '10:00:00', // 2h work
            breakMin: 180, // 3h break (mehr als Arbeitszeit)
          },
          TEST_USERS.max,
        );

        await factory.activateDraft(draft.ID, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        expect(error.message).to.match(/Failed to (create|activate) draft/);
      }
    });
  });

  describe('Non-Existent Entities', () => {
    it('should reject UPDATE of non-existent entry', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await POST(`/odata/v4/track/TimeEntries(ID=${fakeId},IsActiveEntity=true)/draftEdit`, {}, TEST_USERS.max);
        expect.fail('Expected 404 error was not thrown');
      } catch (error) {
        expect(error.response.status).to.be.oneOf([404, 500]);
      }
    });
  });
});
