/**
 * Integration Tests - TimeEntries CRUD Operations
 *
 * Testet CREATE, READ, UPDATE Operationen für TimeEntries
 */
const cds = require('@sap/cds');
const { GET, POST, PATCH, expect } = cds.test(__dirname + '/../..', '--in-memory');
const { TimeEntryFactory, generateTestDate, TEST_USERS } = require('../helpers');

describe('TrackService - TimeEntries CRUD', () => {
  let factory;

  before(() => {
    factory = new TimeEntryFactory(POST);
  });

  describe('CREATE TimeEntry', () => {
    it('should create a new work time entry', async () => {
      const entry = await factory.createWorkEntry(generateTestDate(2027, 1, 10), TEST_USERS.max);

      expect(entry).to.have.property('ID');
      expect(entry.user_ID).to.equal('max.mustermann@test.de');
      expect(entry.entryType_code).to.equal('W');
      expect(entry.status_code).to.equal('O');
      expect(entry.durationHoursNet).to.equal(7.5); // 8h - 0.5h break
      expect(entry.durationHoursGross).to.be.a('number');
    });

    it('should create vacation entry', async () => {
      const entry = await factory.createVacationEntry(generateTestDate(2027, 2, 15), TEST_USERS.erika);

      expect(entry.entryType_code).to.equal('V');
      expect(entry.durationHoursNet).to.be.greaterThan(0);
      expect(entry.status_code).to.equal('O');
    });

    it('should create sick entry', async () => {
      const entry = await factory.createSickEntry(generateTestDate(2027, 2, 16), TEST_USERS.max);

      expect(entry.entryType_code).to.equal('S');
      expect(entry.status_code).to.equal('O');
    });

    it('should create TimeEntry with workLocation', async () => {
      const entry = await factory.createWorkEntry(generateTestDate(2027, 3, 1), TEST_USERS.max, {
        workLocation_code: 'HO', // Home Office
      });

      expect(entry.workLocation_code).to.equal('HO');
    });

    it('should create business trip with travelType', async () => {
      const entry = await factory.createBusinessTripEntry(generateTestDate(2027, 3, 2), TEST_USERS.max);

      expect(entry.entryType_code).to.equal('B');
      expect(entry.travelType_code).to.equal('BA');
    });

    it('should reject invalid workLocation_code', async () => {
      const draft = await factory.createDraft(
        {
          user_ID: 'max.mustermann@test.de',
          workDate: generateTestDate(2027, 3, 3),
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
          workLocation_code: 'INVALID',
        },
        TEST_USERS.max,
      );

      try {
        await factory.activateDraft(draft.ID, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        expect(error.message).to.include('Failed to activate draft');
      }
    });

    it('should reject invalid travelType_code', async () => {
      try {
        const draft = await factory.createDraft(
          {
            user_ID: 'max.mustermann@test.de',
            workDate: generateTestDate(2027, 3, 4),
            entryType_code: 'B',
            startTime: '08:00:00',
            endTime: '16:00:00',
            breakMin: 30,
            project_ID: 'a1b2c3d4-e5f6-4a4a-b7b7-1234567890ab',
            activity_code: 'BDEV',
            travelType_code: 'INVALID',
          },
          TEST_USERS.max,
        );

        await factory.activateDraft(draft.ID, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        // Validation kann beim Draft-Erstellen oder beim Aktivieren fehlschlagen
        expect(error.message).to.match(/Failed to (create|activate) draft|500/);
      }
    });

    it('should reject duplicate entry for same day', async () => {
      const uniqueDate = generateTestDate(2027, 12, 12);

      // Erster Eintrag erstellen
      await factory.createWorkEntry(uniqueDate, TEST_USERS.max);

      // Zweiter Eintrag für gleichen Tag erstellen
      const draft2 = await factory.createDraft(
        {
          user_ID: 'max.mustermann@test.de',
          workDate: uniqueDate,
          entryType_code: 'W',
          startTime: '09:00:00',
          endTime: '17:00:00',
          breakMin: 30,
        },
        TEST_USERS.max,
      );

      // Draft aktivieren sollte fehlschlagen
      try {
        await factory.activateDraft(draft2.ID, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        // Prüfe HTTP Response Status oder Error Message
        if (error.response) {
          expect(error.response.status).to.equal(409);
        } else {
          expect(error.message).to.match(/(409|duplicate|bereits)/i);
        }
      }
    });

    it('should reject invalid time range (end before start)', async () => {
      const draft = await factory.createDraft(
        {
          user_ID: 'max.mustermann@test.de',
          workDate: generateTestDate(2027, 1, 13),
          entryType_code: 'W',
          startTime: '16:00:00',
          endTime: '08:00:00', // End before start
          breakMin: 0,
        },
        TEST_USERS.max,
      );

      try {
        await factory.activateDraft(draft.ID, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        expect(error.message).to.match(/Failed to activate draft: (400|409)/);
      }
    });
  });

  describe('READ TimeEntries', () => {
    before(async () => {
      // Setup: Erstelle Testdaten mit eindeutigem Datum
      await factory.createWorkEntry(generateTestDate(2028, 10, 18), TEST_USERS.max);
    });

    it('should read all TimeEntries', async () => {
      const { data, status } = await GET('/odata/v4/track/TimeEntries', TEST_USERS.max);

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);
    });

    it('should filter TimeEntries by user', async () => {
      const { data, status } = await GET(
        "/odata/v4/track/TimeEntries?$filter=user_ID eq 'max.mustermann@test.de'",
        TEST_USERS.max,
      );

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      data.value.forEach((entry) => {
        expect(entry.user_ID).to.equal('max.mustermann@test.de');
      });
    });

    it('should filter TimeEntries by date range', async () => {
      const { data, status } = await GET(
        '/odata/v4/track/TimeEntries?$filter=workDate ge 2025-10-01 and workDate le 2025-10-31',
        TEST_USERS.max,
      );

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
    });

    it('should expand user association', async () => {
      const { data, status } = await GET('/odata/v4/track/TimeEntries?$expand=user&$top=1', TEST_USERS.max);

      expect(status).to.equal(200);
      if (data.value.length > 0) {
        expect(data.value[0]).to.have.property('user');
        expect(data.value[0].user).to.have.property('name');
      }
    });

    it('should expand project association', async () => {
      const { data, status } = await GET('/odata/v4/track/TimeEntries?$expand=project&$top=1', TEST_USERS.max);

      expect(status).to.equal(200);
      if (data.value.length > 0 && data.value[0].project_ID) {
        expect(data.value[0]).to.have.property('project');
      }
    });
  });

  describe('UPDATE TimeEntry', () => {
    let testEntry;

    beforeEach(async () => {
      // Setup: Erstelle Entry für jeden Test mit eindeutigem Datum
      testEntry = await factory.createWorkEntry(generateTestDate(), TEST_USERS.max);
    });

    it('should update endTime and recalculate hours', async () => {
      // Edit-Draft erstellen
      const { data: editDraft } = await POST(
        `/odata/v4/track/TimeEntries(ID=${testEntry.ID},IsActiveEntity=true)/draftEdit`,
        {},
        TEST_USERS.max,
      );

      // Draft ändern
      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)`,
        { endTime: '18:00:00' },
        TEST_USERS.max,
      );

      // Draft aktivieren
      const updated = await factory.activateDraft(editDraft.ID, TEST_USERS.max);

      expect(updated.endTime).to.equal('18:00:00');
      expect(updated.durationHoursNet).to.equal(9.5); // 10h - 0.5h break
      expect(updated.overtimeHours).to.be.greaterThan(0);
    });

    it('should update breakMin', async () => {
      const { data: editDraft } = await POST(
        `/odata/v4/track/TimeEntries(ID=${testEntry.ID},IsActiveEntity=true)/draftEdit`,
        {},
        TEST_USERS.max,
      );

      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)`,
        { breakMin: 60 },
        TEST_USERS.max,
      );

      const updated = await factory.activateDraft(editDraft.ID, TEST_USERS.max);

      expect(updated.breakMin).to.equal(60);
      expect(updated.durationHoursNet).to.equal(7.0); // 8h - 1h break
    });

    it('should update note', async () => {
      const { data: editDraft } = await POST(
        `/odata/v4/track/TimeEntries(ID=${testEntry.ID},IsActiveEntity=true)/draftEdit`,
        {},
        TEST_USERS.max,
      );

      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)`,
        { note: 'Updated note for testing' },
        TEST_USERS.max,
      );

      const updated = await factory.activateDraft(editDraft.ID, TEST_USERS.max);

      expect(updated.note).to.equal('Updated note for testing');
    });

    it('should automatically set status to processed on update from open', async () => {
      // Entry wurde mit Status 'O' erstellt
      expect(testEntry.status_code).to.be.oneOf(['O', 'P']);

      // Update ohne expliziten Status-Wechsel
      const { data: editDraft } = await POST(
        `/odata/v4/track/TimeEntries(ID=${testEntry.ID},IsActiveEntity=true)/draftEdit`,
        {},
        TEST_USERS.max,
      );

      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)`,
        { note: 'Update triggers auto status change to Processed' },
        TEST_USERS.max,
      );

      const updated = await factory.activateDraft(editDraft.ID, TEST_USERS.max);

      // Business-Logik setzt Status automatisch auf 'P' bei Update von 'O'
      expect(updated.status_code).to.equal('P');
    });

    it('should reject direct status change to released', async () => {
      const { data: editDraft } = await POST(
        `/odata/v4/track/TimeEntries(ID=${testEntry.ID},IsActiveEntity=true)/draftEdit`,
        {},
        TEST_USERS.max,
      );

      // Versuch, Status auf Released zu setzen
      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)`,
        { status_code: 'R' },
        TEST_USERS.max,
      );

      // draftActivate sollte fehlschlagen
      try {
        await factory.activateDraft(editDraft.ID, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        // Prüfe HTTP Response Status
        if (error.response) {
          expect(error.response.status).to.equal(409);
        } else {
          // Oder error message
          expect(error.message).to.match(/(409|Released)/);
        }
      }
    });
  });
});
