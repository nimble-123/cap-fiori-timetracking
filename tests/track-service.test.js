/**
 * Integration Tests für TrackService
 *
 * Testet OData HTTP APIs und Service-Layer mit cds.test()
 * Nutzt Mock-User aus package.json für Authentication
 */
const cds = require('@sap/cds');
const { GET, POST, PATCH, axios, expect } = cds.test(__dirname + '/..', '--in-memory');

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
  //const erikaUser = { auth: { username: 'erika.musterfrau@test.de', password: 'erika' } };

  describe('CREATE TimeEntry', () => {
    // it('should create a new work time entry', async () => {
    //   const { data, status } = await POST(
    //     '/odata/v4/track/TimeEntries',
    //     {
    //       user_ID: 'max.mustermann@test.de',
    //       workDate: '2025-12-14',
    //       entryType_code: 'W', // Work
    //       startTime: '08:00:00',
    //       endTime: '16:30:00',
    //       breakMin: 30,
    //       project_ID: 'a1b2c3d4-e5f6-4a4a-b7b7-1234567890ab', // Beispiel UUID
    //       activity_code: 'DEV',
    //       status_code: 'O',
    //     },
    //     maxUser,
    //   );
    //   expect(status).to.equal(201);
    //   expect(data).to.have.property('ID');
    //   expect(data.user_ID).to.equal('max.mustermann@test.de');
    //   expect(data.entryType_code).to.equal('W');
    //   expect(data.status_code).to.equal('O');
    //   // Berechnete Felder prüfen
    //   expect(data.durationHoursGross).to.be.a('number');
    //   expect(data.durationHoursNet).to.be.a('number');
    //   expect(data.durationHoursNet).to.equal(8.0); // 8.5h - 0.5h break
    // });
    // it('should create vacation entry', async () => {
    //   const { data, status } = await POST(
    //     '/odata/v4/track/TimeEntries',
    //     {
    //       user_ID: 'erika.musterfrau@test.de',
    //       workDate: '2025-10-15',
    //       entryType_code: 'V', // Vacation
    //       startTime: '00:00:00',
    //       endTime: '00:00:00',
    //       breakMin: 0,
    //     },
    //     erikaUser,
    //   );
    //   expect(status).to.equal(201);
    //   expect(data.entryType_code).to.equal('V');
    //   expect(data.durationHoursNet).to.be.greaterThan(0); // Expected daily hours
    //   expect(data.status_code).to.equal('O');
    // });
    // it('should reject duplicate entry for same day', async () => {
    //   // Erster Eintrag
    //   await POST(
    //     '/odata/v4/track/TimeEntries',
    //     {
    //       user_ID: 'max.mustermann@test.de',
    //       workDate: '2025-10-16',
    //       entryType_code: 'W',
    //       startTime: '08:00:00',
    //       endTime: '16:00:00',
    //       breakMin: 30,
    //     },
    //     maxUser,
    //   );
    //   // Zweiter Eintrag für gleichen Tag sollte fehlschlagen
    //   const { status } = await POST(
    //     '/odata/v4/track/TimeEntries',
    //     {
    //       user_ID: 'max.mustermann@test.de',
    //       workDate: '2025-10-16',
    //       entryType_code: 'W',
    //       startTime: '09:00:00',
    //       endTime: '17:00:00',
    //       breakMin: 30,
    //     },
    //     maxUser,
    //   );
    //   expect(status).to.equal(400); // Bad Request erwartet
    // });
    // it('should reject invalid time range (end before start)', async () => {
    //   const { status } = await POST(
    //     '/odata/v4/track/TimeEntries',
    //     {
    //       user_ID: 'max.mustermann@test.de',
    //       workDate: '2025-10-17',
    //       entryType_code: 'W',
    //       startTime: '16:00:00',
    //       endTime: '08:00:00', // End before start
    //       breakMin: 0,
    //     },
    //     maxUser,
    //   );
    //   expect(status).to.equal(400);
    // });
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

  // describe('UPDATE TimeEntry', () => {
  //   let entryId;

  //   beforeAll(async () => {
  //     // Setup: Erstelle Entry zum Updaten
  //     const { data } = await POST(
  //       '/odata/v4/track/TimeEntries',
  //       {
  //         user_ID: 'max.mustermann@test.de',
  //         workDate: '2025-10-19',
  //         entryType_code: 'W',
  //         startTime: '08:00:00',
  //         endTime: '16:00:00',
  //         breakMin: 30,
  //       },
  //       maxUser,
  //     );
  //     entryId = data.ID;
  //   });

  //   it('should update endTime and recalculate hours', async () => {
  //     const { data, status } = await PATCH(`/odata/v4/track/TimeEntries(${entryId})`, { endTime: '18:00:00' }, maxUser);

  //     expect(status).to.equal(200);
  //     expect(data.endTime).to.equal('18:00:00');
  //     expect(data.durationHoursNet).to.equal(9.5); // 10h - 0.5h break
  //     expect(data.overtimeHours).to.be.greaterThan(0);
  //     expect(data.status_code).to.equal('P');
  //   });

  //   it('should update breakMin', async () => {
  //     const { data, status } = await PATCH(`/odata/v4/track/TimeEntries(${entryId})`, { breakMin: 60 }, maxUser);

  //     expect(status).to.equal(200);
  //     expect(data.breakMin).to.equal(60);
  //     expect(data.status_code).to.equal('P');
  //   });

  //   it('should update note', async () => {
  //     const { data, status } = await PATCH(
  //       `/odata/v4/track/TimeEntries(${entryId})`,
  //       { note: 'Updated note for testing' },
  //       maxUser,
  //     );

  //     expect(status).to.equal(200);
  //     expect(data.note).to.equal('Updated note for testing');
  //     expect(data.status_code).to.equal('P');
  //   });

  //   it('should allow switching status between open, processed and done', async () => {
  //     const { data: created } = await POST(
  //       '/odata/v4/track/TimeEntries',
  //       {
  //         user_ID: 'max.mustermann@test.de',
  //         workDate: '2025-10-25',
  //         entryType_code: 'W',
  //         startTime: '08:00:00',
  //         endTime: '16:00:00',
  //         breakMin: 30,
  //       },
  //       maxUser,
  //     );

  //     expect(created.status_code).to.equal('O');

  //     const { data: doneUpdate, status: doneStatus } = await PATCH(
  //       `/odata/v4/track/TimeEntries(${created.ID})`,
  //       { status_code: 'D' },
  //       maxUser,
  //     );
  //     expect(doneStatus).to.equal(200);
  //     expect(doneUpdate.status_code).to.equal('D');

  //     const { data: reopenUpdate, status: reopenStatus } = await PATCH(
  //       `/odata/v4/track/TimeEntries(${created.ID})`,
  //       { status_code: 'O' },
  //       maxUser,
  //     );
  //     expect(reopenStatus).to.equal(200);
  //     expect(reopenUpdate.status_code).to.equal('O');
  //   });

  //   it('should reject direct status change to released', async () => {
  //     const { data: created } = await POST(
  //       '/odata/v4/track/TimeEntries',
  //       {
  //         user_ID: 'max.mustermann@test.de',
  //         workDate: '2025-10-26',
  //         entryType_code: 'W',
  //         startTime: '08:00:00',
  //         endTime: '16:00:00',
  //         breakMin: 30,
  //       },
  //       maxUser,
  //     );

  //     const { status: releaseStatus } = await PATCH(
  //       `/odata/v4/track/TimeEntries(${created.ID})`,
  //       { status_code: 'R' },
  //       maxUser,
  //     );

  //     expect(releaseStatus).to.equal(409);
  //   });
  // });

  // describe('DELETE TimeEntry', () => {
  //   it('should delete TimeEntry', async () => {
  //     // Setup: Erstelle Entry zum Löschen
  //     const { data: created } = await POST(
  //       '/odata/v4/track/TimeEntries',
  //       {
  //         user_ID: 'max.mustermann@test.de',
  //         workDate: '2025-10-20',
  //         entryType_code: 'W',
  //         startTime: '08:00:00',
  //         endTime: '16:00:00',
  //         breakMin: 30,
  //       },
  //       maxUser,
  //     );

  //     // Lösche Entry
  //     const { status } = await DELETE(`/odata/v4/track/TimeEntries(${created.ID})`, maxUser);

  //     expect(status).to.equal(204); // No Content

  //     // Verifiziere Löschung
  //     const { status: getStatus } = await GET(`/odata/v4/track/TimeEntries(${created.ID})`, maxUser);
  //     expect(getStatus).to.equal(404); // Not Found
  //   });
  // });
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

  // describe('Status Actions', () => {
  //   let actionEntryId;
  //   let secondaryEntryId;
  //   let untouchedEntryId;

  //   beforeAll(async () => {
  //     const createEntry = async (workDate) => {
  //       const { data } = await POST(
  //         '/odata/v4/track/TimeEntries',
  //         {
  //           user_ID: 'max.mustermann@test.de',
  //           workDate,
  //           entryType_code: 'W',
  //           startTime: '08:00:00',
  //           endTime: '16:00:00',
  //           breakMin: 30,
  //         },
  //         maxUser,
  //       );
  //       return data.ID;
  //     };

  //     actionEntryId = await createEntry('2025-11-01');
  //     secondaryEntryId = await createEntry('2025-11-02');
  //     untouchedEntryId = await createEntry('2025-11-03');
  //   });

  //   const basePath = (entryId) => `/odata/v4/track/TimeEntries(ID=${encodeURIComponent(entryId)},IsActiveEntity=true)`;
  //   const entryPath = basePath;
  //   const actionPath = (entryId, actionName) => `${basePath(entryId)}/TrackService.${actionName}`;

  //   it('should mark entries as done', async () => {
  //     const postMarkDone = (entryId) => POST(actionPath(entryId, 'markTimeEntryDone'), {}, maxUser);

  //     const { data: firstResult, status: firstStatus } = await postMarkDone(actionEntryId);
  //     expect(firstStatus).to.equal(200);
  //     expect(firstResult.status_code).to.equal('D');

  //     const { data: secondResult, status: secondStatus } = await postMarkDone(secondaryEntryId);
  //     expect(secondStatus).to.equal(200);
  //     expect(secondResult.status_code).to.equal('D');

  //     const { data: refreshedFirst } = await GET(entryPath(actionEntryId), maxUser);
  //     const { data: refreshedSecond } = await GET(entryPath(secondaryEntryId), maxUser);
  //     expect(refreshedFirst.status_code).to.equal('D');
  //     expect(refreshedSecond.status_code).to.equal('D');
  //   });

  //   it('should reject releasing entries that are not done', async () => {
  //     const { status } = await POST(actionPath(untouchedEntryId, 'releaseTimeEntry'), {}, maxUser);

  //     expect(status).to.equal(409);
  //   });

  //   it('should release entries that are done', async () => {
  //     const { data, status } = await POST(actionPath(actionEntryId, 'releaseTimeEntry'), {}, maxUser);

  //     expect(status).to.equal(200);
  //     expect(data.status_code).to.equal('R');

  //     const { data: refreshed } = await GET(entryPath(actionEntryId), maxUser);
  //     expect(refreshed.status_code).to.equal('R');
  //   });

  //   it('should reject editing released entries', async () => {
  //     const { status } = await PATCH(entryPath(actionEntryId), { note: 'attempt to modify released entry' }, maxUser);

  //     expect(status).to.equal(409);
  //   });

  //   it('should reject marking released entries as done again', async () => {
  //     const { status } = await POST(actionPath(actionEntryId, 'markTimeEntryDone'), {}, maxUser);

  //     expect(status).to.equal(409);
  //   });
  // });

  // describe('Bound Actions', () => {
  //   let entryId;

  //   beforeAll(async () => {
  //     // Setup: Erstelle Entry für Bound Action
  //     const { data } = await POST(
  //       '/odata/v4/track/TimeEntries',
  //       {
  //         user_ID: 'max.mustermann@test.de',
  //         workDate: '2025-10-22',
  //         entryType_code: 'W',
  //         startTime: '08:00:00',
  //         endTime: '16:00:00',
  //         breakMin: 30,
  //       },
  //       maxUser,
  //     );
  //     entryId = data.ID;
  //   });

  //   it('should recalculate TimeEntry', async () => {
  //     const { data, status } = await POST(
  //       `/odata/v4/track/TimeEntries(${entryId})/TrackService.recalculate`,
  //       {},
  //       maxUser,
  //     );

  //     expect(status).to.equal(200);
  //     expect(data).to.have.property('durationHoursNet');
  //     expect(data).to.have.property('overtimeHours');
  //     expect(data).to.have.property('undertimeHours');
  //   });
  // });
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
});
