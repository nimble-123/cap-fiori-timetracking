/**
 * Integration Tests für TrackService
 *
 * Testet OData HTTP APIs und Service-Layer mit cds.test()
 * Nutzt Mock-User aus package.json für Authentication
 */
import cds from '@sap/cds';
import path from 'path';

describe('TrackService - TimeEntries CRUD', () => {
  // cds.test() initialisiert CAP Server mit In-Memory DB
  const projectRoot = path.join(__dirname, '..');
  const { GET, POST, PATCH, DELETE, expect } = cds.test(projectRoot, '--in-memory');

  // Mock User für Authentication (aus package.json)
  const maxUser = { auth: { username: 'max.mustermann@test.de', password: 'max' } };
  const erikaUser = { auth: { username: 'erika.musterfrau@test.de', password: 'erika' } };

  describe('CREATE TimeEntry', () => {
    it('should create a new work time entry', async () => {
      const { data, status } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2025-10-14',
          entryType_code: 'W', // Work
          startTime: '08:00:00',
          endTime: '16:30:00',
          breakMin: 30,
          project_ID: '3fa85f64-5717-4562-b3fc-2c963f66afa6', // Beispiel UUID
          activity_code: 'DEV',
        },
        maxUser,
      );

      expect(status).to.equal(201);
      expect(data).to.have.property('ID');
      expect(data.user_ID).to.equal('max.mustermann@test.de');
      expect(data.entryType_code).to.equal('W');

      // Berechnete Felder prüfen
      expect(data.durationHoursGross).to.be.a('number');
      expect(data.durationHoursNet).to.be.a('number');
      expect(data.durationHoursNet).to.equal(8.0); // 8.5h - 0.5h break
    });

    it('should create vacation entry', async () => {
      const { data, status } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'erika.musterfrau@test.de',
          workDate: '2025-10-15',
          entryType_code: 'V', // Vacation
          startTime: '00:00:00',
          endTime: '00:00:00',
          breakMin: 0,
        },
        erikaUser,
      );

      expect(status).to.equal(201);
      expect(data.entryType_code).to.equal('V');
      expect(data.durationHoursNet).to.be.greaterThan(0); // Expected daily hours
    });

    it('should reject duplicate entry for same day', async () => {
      // Erster Eintrag
      await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2025-10-16',
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
        },
        maxUser,
      );

      // Zweiter Eintrag für gleichen Tag sollte fehlschlagen
      const { status } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2025-10-16',
          entryType_code: 'W',
          startTime: '09:00:00',
          endTime: '17:00:00',
          breakMin: 30,
        },
        maxUser,
      );

      expect(status).to.equal(400); // Bad Request erwartet
    });

    it('should reject invalid time range (end before start)', async () => {
      const { status } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2025-10-17',
          entryType_code: 'W',
          startTime: '16:00:00',
          endTime: '08:00:00', // End before start
          breakMin: 0,
        },
        maxUser,
      );

      expect(status).to.equal(400);
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
      data.value.forEach((entry: any) => {
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
    let entryId: string;

    beforeAll(async () => {
      // Setup: Erstelle Entry zum Updaten
      const { data } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2025-10-19',
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
        },
        maxUser,
      );
      entryId = data.ID;
    });

    it('should update endTime and recalculate hours', async () => {
      const { data, status } = await PATCH(`/odata/v4/track/TimeEntries(${entryId})`, { endTime: '18:00:00' }, maxUser);

      expect(status).to.equal(200);
      expect(data.endTime).to.equal('18:00:00');
      expect(data.durationHoursNet).to.equal(9.5); // 10h - 0.5h break
      expect(data.overtimeHours).to.be.greaterThan(0);
    });

    it('should update breakMin', async () => {
      const { data, status } = await PATCH(`/odata/v4/track/TimeEntries(${entryId})`, { breakMin: 60 }, maxUser);

      expect(status).to.equal(200);
      expect(data.breakMin).to.equal(60);
    });

    it('should update note', async () => {
      const { data, status } = await PATCH(
        `/odata/v4/track/TimeEntries(${entryId})`,
        { note: 'Updated note for testing' },
        maxUser,
      );

      expect(status).to.equal(200);
      expect(data.note).to.equal('Updated note for testing');
    });
  });

  describe('DELETE TimeEntry', () => {
    it('should delete TimeEntry', async () => {
      // Setup: Erstelle Entry zum Löschen
      const { data: created } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2025-10-20',
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
        },
        maxUser,
      );

      // Lösche Entry
      const { status } = await DELETE(`/odata/v4/track/TimeEntries(${created.ID})`, maxUser);

      expect(status).to.equal(204); // No Content

      // Verifiziere Löschung
      const { status: getStatus } = await GET(`/odata/v4/track/TimeEntries(${created.ID})`, maxUser);
      expect(getStatus).to.equal(404); // Not Found
    });
  });
});

describe('TrackService - Actions & Functions', () => {
  const { GET, POST, expect } = cds.test('../', '--in-memory');
  const maxUser = { auth: { username: 'max.mustermann@test.de', password: 'max' } };

  describe('Generation Actions', () => {
    it('should generate monthly time entries', async () => {
      const { data, status } = await POST('/odata/v4/track/generateMonthlyTimeEntries', {}, maxUser);

      expect(status).to.equal(200);
      expect(data).to.have.property('count');
      expect(data.count).to.be.a('number');
      expect(data).to.have.property('message');
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
      expect(data).to.have.property('count');
      expect(data.count).to.be.greaterThan(0);
      expect(data).to.have.property('message');
    });

    it('should get default generation parameters', async () => {
      const { data, status } = await GET('/odata/v4/track/getDefaultParams()', maxUser);

      expect(status).to.equal(200);
      expect(data).to.have.property('year');
      expect(data).to.have.property('month');
      expect(data).to.have.property('stateCode');
    });
  });

  describe('Balance Functions', () => {
    beforeAll(async () => {
      // Setup: Erstelle Entries für Balance-Berechnung
      await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2025-10-21',
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '18:00:00', // 10h - Überstunden
          breakMin: 60,
        },
        maxUser,
      );
    });

    it('should calculate monthly balance', async () => {
      const { data, status } = await GET('/odata/v4/track/getMonthlyBalance(month=10,year=2025)', maxUser);

      expect(status).to.equal(200);
      expect(data).to.have.property('month');
      expect(data).to.have.property('year');
      expect(data).to.have.property('totalHours');
      expect(data).to.have.property('balance');
      expect(data).to.have.property('criticality');
    });

    it('should get current balance', async () => {
      const { data, status } = await GET('/odata/v4/track/getCurrentBalance()', maxUser);

      expect(status).to.equal(200);
      expect(data).to.have.property('totalBalance');
      expect(data).to.have.property('overtimeTotal');
      expect(data).to.have.property('undertimeTotal');
    });

    it('should get recent balances', async () => {
      const { data, status } = await GET('/odata/v4/track/getRecentBalances(months=6)', maxUser);

      expect(status).to.equal(200);
      expect(data).to.have.property('balances');
      expect(data.balances).to.be.an('array');
    });

    it('should get vacation balance', async () => {
      const { data, status } = await GET('/odata/v4/track/getVacationBalance(year=2025)', maxUser);

      expect(status).to.equal(200);
      expect(data).to.have.property('year');
      expect(data).to.have.property('totalVacationDays');
      expect(data).to.have.property('usedVacationDays');
      expect(data).to.have.property('remainingVacationDays');
    });

    it('should get sick leave balance', async () => {
      const { data, status } = await GET('/odata/v4/track/getSickLeaveBalance(year=2025)', maxUser);

      expect(status).to.equal(200);
      expect(data).to.have.property('year');
      expect(data).to.have.property('totalSickDays');
    });
  });

  describe('Bound Actions', () => {
    let entryId: string;

    beforeAll(async () => {
      // Setup: Erstelle Entry für Bound Action
      const { data } = await POST(
        '/odata/v4/track/TimeEntries',
        {
          user_ID: 'max.mustermann@test.de',
          workDate: '2025-10-22',
          entryType_code: 'W',
          startTime: '08:00:00',
          endTime: '16:00:00',
          breakMin: 30,
        },
        maxUser,
      );
      entryId = data.ID;
    });

    it('should recalculate TimeEntry', async () => {
      const { data, status } = await POST(
        `/odata/v4/track/TimeEntries(${entryId})/TrackService.recalculate`,
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
  const { GET, expect } = cds.test('../', '--in-memory');
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
});
