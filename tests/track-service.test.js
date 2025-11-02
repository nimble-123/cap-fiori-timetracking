/**
 * Integration Tests für TrackService
 *
 * Testet OData HTTP APIs und Service-Layer mit cds.test()
 * Nutzt Mock-User aus package.json für Authentication
 */
const cds = require('@sap/cds');
const { GET, POST, PATCH, DELETE, /* PUT, OPTIONS, axios, */ expect } = cds.test(__dirname + '/..', '--in-memory');

describe('TrackService - Basic Setup', () => {
  it('should serve $metadata document in v4', async () => {
    const { headers, status, data } = await GET`/odata/v4/track/$metadata`;
    expect(status).to.equal(200);
    expect(headers).to.contain({
      // 'content-type': 'application/xml', //> fails with 'application/xml;charset=utf-8', which is set by express
      'odata-version': '4.0',
    });
    expect(headers['content-type']).to.match(/application\/xml/);
    expect(data).to.contain('<EntitySet Name="TimeEntries" EntityType="TrackService.TimeEntries">');
  });
});

describe('TrackService - TimeEntries CRUD', () => {
  // Mock User für Authentication (aus package.json)
  const maxUser = { auth: { username: 'max.mustermann@test.de', password: 'max' } };
  const erikaUser = { auth: { username: 'erika.musterfrau@test.de', password: 'erika' } };

  describe('CREATE TimeEntry', () => {
    it('should create a new work time entry', async () => {
      const { data: draft, status } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2027-01-10', // Eindeutiges Datum weit in der Zukunft
          entryType_code: 'W', // Work
          startTime: '08:00:00',
          endTime: '16:30:00',
          breakMin: 30,
          project_ID: 'a1b2c3d4-e5f6-4a4a-b7b7-1234567890ab', // Beispiel UUID
          activity_code: 'BDEV', // Backend Development (existiert in DB)
          status_code: 'O',
        },
        maxUser,
      );
      expect(status).to.equal(201);
      expect(draft).to.have.property('ID');

      // Draft aktivieren
      const { data, status: activateStatus } = await POST(
        `/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`,
        {},
        maxUser,
      );

      expect(activateStatus).to.be.oneOf([200, 201]); // draftActivate kann 200 oder 201 zurückgeben
      expect(data.user_ID).to.equal('max.mustermann@test.de');
      expect(data.entryType_code).to.equal('W');
      expect(data.status_code).to.equal('O');
      // Berechnete Felder prüfen
      expect(data.durationHoursGross).to.be.a('number');
      expect(data.durationHoursNet).to.be.a('number');
      expect(data.durationHoursNet).to.equal(8.0); // 8.5h - 0.5h break
    });
    it('should create vacation entry', async () => {
      const { data: draft, status } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'erika.musterfrau@test.de',
          workDate: '2027-02-15', // Eindeutiges Datum weit in der Zukunft, anderer Monat
          entryType_code: 'V', // Vacation
          // Vacation entries benötigen Platzhalter-Zeiten (werden in Business Logic überschrieben)
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 0,
        },
        erikaUser,
      );
      expect(status).to.equal(201);

      // Draft aktivieren
      const { data, status: activateStatus } = await POST(
        `/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`,
        {},
        erikaUser,
      );

      expect(activateStatus).to.be.oneOf([200, 201]); // draftActivate kann 200 oder 201 zurückgeben
      expect(data.entryType_code).to.equal('V');
      expect(data.durationHoursNet).to.be.greaterThan(0); // Expected daily hours
      expect(data.status_code).to.equal('O');
    });

    it('should create TimeEntry with workLocation', async () => {
      const { data: draft } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2027-03-01', // Eindeutiges Datum
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
          project_ID: 'a1b2c3d4-e5f6-4a4a-b7b7-1234567890ab',
          activity_code: 'BDEV',
          workLocation_code: 'HO', // Home Office - existiert in CSV
        },
        maxUser,
      );

      const { data, status: activateStatus } = await POST(
        `/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`,
        {},
        maxUser,
      );

      expect(activateStatus).to.be.oneOf([200, 201]);
      expect(data.workLocation_code).to.equal('HO');
    });

    it('should create business trip with travelType', async () => {
      const { data: draft } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2027-03-02', // Eindeutiges Datum
          entryType_code: 'B', // Business Trip
          startTime: '08:00:00',
          endTime: '18:00:00',
          breakMin: 60,
          project_ID: 'a1b2c3d4-e5f6-4a4a-b7b7-1234567890ab',
          activity_code: 'BDEV',
          travelType_code: 'BA', // Aus CSV-Daten
        },
        maxUser,
      );

      const { data, status: activateStatus } = await POST(
        `/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`,
        {},
        maxUser,
      );

      expect(activateStatus).to.be.oneOf([200, 201]);
      expect(data.entryType_code).to.equal('B');
      expect(data.travelType_code).to.equal('BA');
    });

    it('should reject invalid workLocation_code', async () => {
      const { data: draft } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2027-03-03', // Eindeutiges Datum
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
          workLocation_code: 'INVALID',
        },
        maxUser,
      );

      try {
        await POST(`/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`, {}, maxUser);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        expect(error.response.status).to.equal(400);
      }
    });

    it('should reject invalid travelType_code', async () => {
      try {
        const { data: draft } = await POST(
          '/odata/v4/track/TimeEntries',
          {
            user_ID: 'max.mustermann@test.de',
            workDate: '2027-03-04', // Eindeutiges Datum
            entryType_code: 'B',
            startTime: '08:00:00',
            endTime: '16:00:00',
            breakMin: 30,
            project_ID: 'a1b2c3d4-e5f6-4a4a-b7b7-1234567890ab', // Project ist bei Business Trip erforderlich
            activity_code: 'BDEV',
            travelType_code: 'INVALID',
          },
          maxUser,
        );

        await POST(`/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`, {}, maxUser);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        // Validation kann 400 oder 500 werfen (abhängig davon ob POST oder draftActivate fehlschlägt)
        expect(error.response.status).to.be.oneOf([400, 500]);
      }
    });

    it('should reject duplicate entry for same day', async () => {
      const uniqueDate = '2027-01-12'; // Eindeutiges Datum weit in der Zukunft

      // Erster Eintrag erstellen und aktivieren
      const { data: draft1 } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: uniqueDate,
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
        },
        maxUser,
      );
      await POST(`/odata/v4/track/TimeEntries(ID=${draft1.ID},IsActiveEntity=false)/draftActivate`, {}, maxUser);

      // Zweiter Eintrag für gleichen Tag erstellen
      const { data: draft2 } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: uniqueDate,
          entryType_code: 'W',
          startTime: '09:00:00',
          endTime: '17:00:00',
          breakMin: 30,
        },
        maxUser,
      );

      // Draft aktivieren sollte fehlschlagen
      try {
        await POST(`/odata/v4/track/TimeEntries(ID=${draft2.ID},IsActiveEntity=false)/draftActivate`, {}, maxUser);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        // Validator wirft 409 bei duplicate entry
        expect(error.response.status).to.equal(409);
        expect(error.response.data.error.message).to.include('bereits');
      }
    });
    it('should reject invalid time range (end before start)', async () => {
      const { data: draft } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2027-01-13', // Eindeutiges Datum weit in der Zukunft
          entryType_code: 'W',
          startTime: '16:00:00',
          endTime: '08:00:00', // End before start
          breakMin: 0,
        },
        maxUser,
      );

      // Draft aktivieren sollte fehlschlagen
      try {
        await POST(`/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`, {}, maxUser);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        // Kann 400 oder 409 sein, je nach Validator-Logik
        expect(error.response.status).to.be.oneOf([400, 409]);
      }
    });
  });

  describe('READ TimeEntries', () => {
    beforeAll(async () => {
      // Setup: Erstelle Testdaten
      await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2025-10-18',
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
        },
        maxUser,
      );
    });

    it('should read all TimeEntries', async () => {
      const { data, status } = await GET('/odata/v4/track/TimeEntries', maxUser);

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);
    });

    it('should filter TimeEntries by user', async () => {
      const { data, status } = await GET(
        "/odata/v4/track/TimeEntries?$filter=user_ID eq 'max.mustermann@test.de'",
        maxUser,
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
        maxUser,
      );

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
    });

    it('should expand user association', async () => {
      const { data, status } = await GET('/odata/v4/track/TimeEntries?$expand=user&$top=1', maxUser);

      expect(status).to.equal(200);
      expect(data.value[0]).to.have.property('user');
      expect(data.value[0].user).to.have.property('name');
    });
  });

  describe('UPDATE TimeEntry', () => {
    let entryId;
    let uniqueDateOffset = 0;

    beforeEach(async () => {
      // Setup: Erstelle Entry mit eindeutigem Datum für jeden Test
      uniqueDateOffset++;
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + uniqueDateOffset);
      const workDate = testDate.toISOString().split('T')[0];

      const { data: draft } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate,
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
        },
        maxUser,
      );

      // Draft aktivieren
      const { data: activated } = await POST(
        `/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`,
        {},
        maxUser,
      );
      entryId = activated.ID;
    });

    it('should update endTime and recalculate hours', async () => {
      // Edit-Draft erstellen
      const { data: editDraft } = await POST(
        `/odata/v4/track/TimeEntries(ID=${entryId},IsActiveEntity=true)/draftEdit`,
        {},
        maxUser,
      );

      // Draft ändern
      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)`,
        { endTime: '18:00:00' },
        maxUser,
      );

      // Draft aktivieren
      const { data, status } = await POST(
        `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)/draftActivate`,
        {},
        maxUser,
      );

      expect(status).to.equal(200);
      expect(data.endTime).to.equal('18:00:00');
      expect(data.durationHoursNet).to.equal(9.5); // 10h - 0.5h break
      expect(data.overtimeHours).to.be.greaterThan(0);
    });

    it('should update breakMin', async () => {
      const { data: editDraft } = await POST(
        `/odata/v4/track/TimeEntries(ID=${entryId},IsActiveEntity=true)/draftEdit`,
        {},
        maxUser,
      );

      await PATCH(`/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)`, { breakMin: 60 }, maxUser);

      const { data, status } = await POST(
        `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)/draftActivate`,
        {},
        maxUser,
      );

      expect(status).to.equal(200);
      expect(data.breakMin).to.equal(60);
      expect(data.durationHoursNet).to.equal(7.0); // 8h - 1h break
    });

    it('should update note', async () => {
      const { data: editDraft } = await POST(
        `/odata/v4/track/TimeEntries(ID=${entryId},IsActiveEntity=true)/draftEdit`,
        {},
        maxUser,
      );

      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)`,
        { note: 'Updated note for testing' },
        maxUser,
      );

      const { data, status } = await POST(
        `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)/draftActivate`,
        {},
        maxUser,
      );

      expect(status).to.equal(200);
      expect(data.note).to.equal('Updated note for testing');
    });

    it('should automatically set status to processed on update from open', async () => {
      // Erstelle neuen Entry mit aktiviertem Draft und eindeutigem Datum
      uniqueDateOffset += 100; // Großer Offset für diesen speziellen Test
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + uniqueDateOffset);
      const workDate = testDate.toISOString().split('T')[0];

      const { data: draft } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate,
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
        },
        maxUser,
      );

      const { data: created } = await POST(
        `/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`,
        {},
        maxUser,
      );

      // Status wird von Business Logic gesetzt (initial 'O' = Open)
      expect(created.status_code).to.be.oneOf(['O', 'P']);

      // Update ohne expliziten Status-Wechsel -> automatisch 'P' (Processed)
      const { data: editDraft1 } = await POST(
        `/odata/v4/track/TimeEntries(ID=${created.ID},IsActiveEntity=true)/draftEdit`,
        {},
        maxUser,
      );

      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft1.ID},IsActiveEntity=false)`,
        { note: 'Update triggers auto status change to Processed' },
        maxUser,
      );

      const { data: processedUpdate, status: processedStatus } = await POST(
        `/odata/v4/track/TimeEntries(ID=${editDraft1.ID},IsActiveEntity=false)/draftActivate`,
        {},
        maxUser,
      );

      expect(processedStatus).to.equal(200);
      // Business-Logik setzt Status automatisch auf 'P' bei Update von 'O'
      expect(processedUpdate.status_code).to.equal('P');
    });

    it('should reject direct status change to released', async () => {
      // Erstelle Entry mit eindeutigem Datum
      uniqueDateOffset += 100; // Großer Offset für diesen speziellen Test
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + uniqueDateOffset);
      const workDate = testDate.toISOString().split('T')[0];

      const { data: draft } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate,
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
        },
        maxUser,
      );

      const { data: created } = await POST(
        `/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`,
        {},
        maxUser,
      );

      const { data: editDraft } = await POST(
        `/odata/v4/track/TimeEntries(ID=${created.ID},IsActiveEntity=true)/draftEdit`,
        {},
        maxUser,
      );

      // Versuch, Status auf Released zu setzen - PATCH erlaubt es, aber draftActivate sollte fehlschlagen
      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)`,
        { status_code: 'R' },
        maxUser,
      );

      // draftActivate sollte mit 409 fehlschlagen
      try {
        await POST(`/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)/draftActivate`, {}, maxUser);
        // Wenn kein Fehler geworfen wurde, ist der Test fehlgeschlagen
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        // Validation wirft 409 beim Aktivieren
        expect(error.response.status).to.equal(409);
        expect(error.response.data.error.message).to.include('Released');
      }
    });
  });

  describe('DELETE TimeEntry', () => {
    it('should reject deleting TimeEntry (business rule)', async () => {
      // Setup: Erstelle Entry und aktiviere Draft
      const { data: draft } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2027-01-14', // Eindeutiges Datum weit in der Zukunft
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
        },
        maxUser,
      );

      const { data: activated } = await POST(
        `/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`,
        {},
        maxUser,
      );

      // Versuch, Entry zu löschen - sollte mit 405 fehlschlagen
      try {
        await DELETE(`/odata/v4/track/TimeEntries(ID=${activated.ID},IsActiveEntity=true)`, maxUser);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        // Business Rule verbietet DELETE (CAP generiert englische Fehlermeldung)
        expect(error.response.status).to.equal(405);
        expect(error.response.data.error.message).to.include('not deletable');
      }
    });
  });
});

describe('TrackService - Actions & Functions', () => {
  const maxUser = { auth: { username: 'max.mustermann@test.de', password: 'max' } };

  describe('Generation Actions', () => {
    it('should generate monthly time entries', async () => {
      const { data, status } = await POST('/odata/v4/track/generateMonthlyTimeEntries', {}, maxUser);

      expect(status).to.equal(200);
      expect(data).to.be.an('object');
      expect(data).to.have.property('value');
      expect(data.value).to.be.an('array');

      const entries = data.value;
      expect(entries.length).to.be.greaterThan(0);
      entries.forEach((entry) => {
        expect(entry.user_ID).to.equal('max.mustermann@test.de');
        expect(entry).to.have.property('workDate');
      });
    });

    it('should generate yearly time entries', async () => {
      const { data, status } = await POST(
        '/odata/v4/track/generateYearlyTimeEntries',
        {
          year: 2025,
          stateCode: 'BY', // Bayern
        },
        maxUser,
      );

      expect(status).to.equal(200);
      expect(data).to.be.an('object');
      expect(data).to.have.property('value');
      expect(data.value).to.be.an('array');

      const entries = data.value;
      expect(entries.length).to.be.greaterThan(0);
      entries.forEach((entry) => {
        expect(entry.user_ID).to.equal('max.mustermann@test.de');
        expect(entry).to.have.property('workDate');
      });
    });

    it('should get default generation parameters', async () => {
      const { data, status } = await GET('/odata/v4/track/getDefaultParamsForGenerateYearly()', maxUser);

      expect(status).to.equal(200);
      expect(data).to.have.property('year');
      expect(data.year).to.equal(new Date().getFullYear());
      expect(data).to.have.property('stateCode');
      expect(data.stateCode).to.equal('BY');
    });
  });

  describe('Balance Functions', () => {
    const targetYear = 2025;
    const targetMonth = 10;

    beforeAll(async () => {
      // Setup: Erstelle Entries für Balance-Berechnung
      await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: `${targetYear}-${String(targetMonth).padStart(2, '0')}-21`,
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '18:00:00', // 10h - Überstunden
          breakMin: 60,
        },
        maxUser,
      );
    });

    it('should calculate monthly balance', async () => {
      const { data, status } = await POST(
        '/odata/v4/track/getMonthlyBalance',
        { year: targetYear, month: targetMonth },
        maxUser,
      );

      expect(status).to.equal(200);
      expect(data).to.have.property('month');
      expect(data.year).to.equal(targetYear);
      expect(data).to.have.property('balanceHours');
      expect(data).to.have.property('balanceCriticality');
    });

    it('should get current balance', async () => {
      const { data, status } = await POST('/odata/v4/track/getCurrentBalance', {}, maxUser);

      expect(status).to.equal(200);
      expect(data).to.have.property('value');
      expect(data.value).to.be.a('number');
    });

    it('should get recent balances', async () => {
      const { data, status } = await GET('/odata/v4/track/MonthlyBalances', maxUser);

      expect(status).to.equal(200);
      expect(data).to.have.property('value');
      expect(data.value).to.be.an('array');
    });

    it('should get vacation balance', async () => {
      const { data, status } = await POST('/odata/v4/track/getVacationBalance', {}, maxUser);

      expect(status).to.equal(200);
      expect(data).to.have.property('year');
      expect(data).to.have.property('totalDays');
      expect(data).to.have.property('takenDays');
      expect(data).to.have.property('remainingDays');
      expect(data).to.have.property('balanceCriticality');
    });

    it('should get sick leave balance', async () => {
      const { data, status } = await POST('/odata/v4/track/getSickLeaveBalance', {}, maxUser);

      expect(status).to.equal(200);
      expect(data).to.have.property('year');
      expect(data).to.have.property('totalDays');
      expect(data).to.have.property('criticality');
    });
  });

  describe('Status Actions', () => {
    let actionEntryId;
    let secondaryEntryId;
    let untouchedEntryId;

    beforeAll(async () => {
      const createAndActivateEntry = async (workDate) => {
        const { data: draft } = await POST(
          '/odata/v4/track/TimeEntries',
          {
            user_ID: 'max.mustermann@test.de',
            workDate,
            entryType_code: 'W',
            startTime: '08:00:00',
            endTime: '16:00:00',
            breakMin: 30,
          },
          maxUser,
        );

        // Draft aktivieren
        const { data: activated } = await POST(
          `/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`,
          {},
          maxUser,
        );
        return activated.ID;
      };

      // Verwende weit in der Zukunft liegende Datumswerte zur Vermeidung von Konflikten
      actionEntryId = await createAndActivateEntry('2026-06-01');
      secondaryEntryId = await createAndActivateEntry('2026-06-02');
      untouchedEntryId = await createAndActivateEntry('2026-06-03');
    });

    const basePath = (entryId) => `/odata/v4/track/TimeEntries(ID=${encodeURIComponent(entryId)},IsActiveEntity=true)`;
    const entryPath = basePath;
    const actionPath = (entryId, actionName) => `${basePath(entryId)}/TrackService.${actionName}`;

    it('should mark entries as done', async () => {
      // Erst muss der Entry in Status 'P' (Processed) gebracht werden
      // Das geschieht automatisch durch ein Update
      const updateToProcessed = async (entryId) => {
        const { data: editDraft } = await POST(
          `/odata/v4/track/TimeEntries(ID=${entryId},IsActiveEntity=true)/draftEdit`,
          {},
          maxUser,
        );
        await PATCH(
          `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)`,
          { note: 'Update' },
          maxUser,
        );
        await POST(`/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)/draftActivate`, {}, maxUser);
      };

      await updateToProcessed(actionEntryId);
      await updateToProcessed(secondaryEntryId);

      const postMarkDone = (entryId) => POST(actionPath(entryId, 'markTimeEntryDone'), {}, maxUser);

      const { data: firstResult, status: firstStatus } = await postMarkDone(actionEntryId);
      expect(firstStatus).to.equal(200);
      expect(firstResult.status_code).to.equal('D');

      const { data: secondResult, status: secondStatus } = await postMarkDone(secondaryEntryId);
      expect(secondStatus).to.equal(200);
      expect(secondResult.status_code).to.equal('D');

      const { data: refreshedFirst } = await GET(entryPath(actionEntryId), maxUser);
      const { data: refreshedSecond } = await GET(entryPath(secondaryEntryId), maxUser);
      expect(refreshedFirst.status_code).to.equal('D');
      expect(refreshedSecond.status_code).to.equal('D');
    });

    it('should reject releasing entries that are not done', async () => {
      try {
        await POST(actionPath(untouchedEntryId, 'releaseTimeEntry'), {}, maxUser);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        expect(error.response.status).to.equal(409);
      }
    });

    it('should release entries that are done', async () => {
      // actionEntryId ist jetzt im Status 'D' (Done) durch vorherigen Test
      const { data, status } = await POST(actionPath(actionEntryId, 'releaseTimeEntry'), {}, maxUser);

      expect(status).to.equal(200);
      expect(data.status_code).to.equal('R');

      const { data: refreshed } = await GET(entryPath(actionEntryId), maxUser);
      expect(refreshed.status_code).to.equal('R');
    });

    it('should reject editing released entries', async () => {
      // actionEntryId ist jetzt im Status 'R' (Released) durch vorherigen Test
      // Versuch, einen Released Entry zu bearbeiten - sollte fehlschlagen
      const { data: editDraft } = await POST(
        `/odata/v4/track/TimeEntries(ID=${actionEntryId},IsActiveEntity=true)/draftEdit`,
        {},
        maxUser,
      );

      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)`,
        { note: 'attempt to modify released entry' },
        maxUser,
      );

      try {
        await POST(`/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)/draftActivate`, {}, maxUser);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        // CAP wirft AxiosError mit response property
        if (error.response) {
          expect(error.response.status).to.equal(409);
        } else {
          // Falls direkter ServiceError
          expect(error.code || error.statusCode).to.equal(409);
        }
      }
    });

    it('should reject marking released entries as done again', async () => {
      // actionEntryId ist im Status 'R' (Released)
      try {
        await POST(actionPath(actionEntryId, 'markTimeEntryDone'), {}, maxUser);
        expect.fail('Expected validation error was not thrown');
      } catch (error) {
        // CAP wirft AxiosError mit response property
        if (error.response) {
          expect(error.response.status).to.equal(409);
        } else {
          // Falls direkter ServiceError
          expect(error.code || error.statusCode).to.equal(409);
        }
      }
    });
  });

  describe('Bound Actions', () => {
    let entryId;

    beforeAll(async () => {
      // Setup: Erstelle Entry und aktiviere Draft für Bound Action
      const { data: draft } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2026-07-15', // Weit in der Zukunft zur Vermeidung von Konflikten
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
        },
        maxUser,
      );

      // Draft aktivieren
      const { data: activated } = await POST(
        `/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`,
        {},
        maxUser,
      );
      entryId = activated.ID;
    });

    it('should recalculate TimeEntry', async () => {
      const { data, status } = await POST(
        `/odata/v4/track/TimeEntries(ID=${entryId},IsActiveEntity=true)/TrackService.recalculateTimeEntry`,
        {},
        maxUser,
      );

      expect(status).to.equal(200);
      expect(data).to.have.property('durationHoursNet');
      expect(data).to.have.property('overtimeHours');
      expect(data).to.have.property('undertimeHours');
    });
  });
});

describe('TrackService - Other Entities', () => {
  const maxUser = { auth: { username: 'max.mustermann@test.de', password: 'max' } };

  describe('Users', () => {
    it('should read users', async () => {
      const { data, status } = await GET('/odata/v4/track/Users', maxUser);

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);
    });
  });

  describe('Projects', () => {
    it('should read projects', async () => {
      const { data, status } = await GET('/odata/v4/track/Projects', maxUser);

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
    });
  });

  describe('ActivityTypes', () => {
    it('should read activity types', async () => {
      const { data, status } = await GET('/odata/v4/track/ActivityTypes', maxUser);

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
    });
  });

  describe('EntryTypes', () => {
    it('should read entry types', async () => {
      const { data, status } = await GET('/odata/v4/track/EntryTypes', maxUser);

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);
    });
  });

  describe('WorkLocations', () => {
    it('should read all work locations', async () => {
      const { data, status } = await GET('/odata/v4/track/WorkLocations', maxUser);

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);
    });
  });

  describe('TravelTypes', () => {
    it('should read all travel types', async () => {
      const { data, status } = await GET('/odata/v4/track/TravelTypes', maxUser);

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);
    });
  });

  describe('TimeEntryStatuses', () => {
    it('should read all time entry statuses', async () => {
      const { data, status } = await GET('/odata/v4/track/TimeEntryStatuses', maxUser);

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);
      // Prüfe dass alle erwarteten Status vorhanden sind
      const codes = data.value.map((s) => s.code);
      expect(codes).to.include('O'); // Open
      expect(codes).to.include('P'); // Processed
      expect(codes).to.include('D'); // Done
      expect(codes).to.include('R'); // Released
    });
  });
});
