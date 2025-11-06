/**
 * Integration Tests - Reference Data
 *
 * Testet CodeLists und Reference Entities (Users, Projects, ActivityTypes, etc.)
 */
import cds from '@sap/cds';
import type { AxiosResponse } from 'axios';
import { TEST_USERS, type ODataCollection } from '../helpers';
import type {
  User,
  Project,
  ActivityType,
  EntryType,
  WorkLocation,
  TravelType,
  TimeEntryStatus,
  Region,
} from '#cds-models/io/nimble';

const { GET, expect } = cds.test(__dirname + '/../..', '--in-memory');

describe('TrackService - Reference Data', () => {
  describe('Users', () => {
    it('should read users', async () => {
      const { data, status } = (await GET('/odata/v4/track/Users', TEST_USERS.max)) as AxiosResponse<
        ODataCollection<User>
      >;

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);

      data.value.forEach((user) => {
        expect(user).to.have.property('ID');
        expect(user).to.have.property('name');
      });
    });

    it('should read users with their properties', async () => {
      const { data, status } = (await GET('/odata/v4/track/Users?$top=1', TEST_USERS.max)) as AxiosResponse<
        ODataCollection<User>
      >;

      expect(status).to.equal(200);
      if (data.value.length > 0) {
        expect(data.value[0]).to.have.property('weeklyHoursDec');
        expect(data.value[0]).to.have.property('expectedDailyHoursDec');
      }
    });
  });

  describe('Projects', () => {
    it('should read projects', async () => {
      const { data, status } = (await GET('/odata/v4/track/Projects', TEST_USERS.max)) as AxiosResponse<
        ODataCollection<Project>
      >;

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');

      data.value.forEach((project) => {
        expect(project).to.have.property('ID');
        expect(project).to.have.property('name');
      });
    });

    it('should filter active projects', async () => {
      const { data, status } = (await GET(
        '/odata/v4/track/Projects?$filter=active eq true',
        TEST_USERS.max,
      )) as AxiosResponse<ODataCollection<Project>>;

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');

      data.value.forEach((project) => {
        expect(project.active).to.equal(true);
      });
    });
  });

  describe('ActivityTypes', () => {
    it('should read activity types', async () => {
      const { data, status } = (await GET('/odata/v4/track/ActivityTypes', TEST_USERS.max)) as AxiosResponse<
        ODataCollection<ActivityType>
      >;

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);

      data.value.forEach((activity) => {
        expect(activity).to.have.property('code');
        expect(activity).to.have.property('name');
      });
    });

    it('should include localized texts', async () => {
      const { data, status } = (await GET(
        '/odata/v4/track/ActivityTypes?$expand=texts&$top=1',
        TEST_USERS.max,
      )) as AxiosResponse<ODataCollection<ActivityType>>;

      expect(status).to.equal(200);
      if (data.value.length > 0 && data.value[0].texts) {
        expect(data.value[0].texts).to.be.an('array');
      }
    });
  });

  describe('EntryTypes', () => {
    it('should read entry types', async () => {
      const { data, status } = (await GET('/odata/v4/track/EntryTypes', TEST_USERS.max)) as AxiosResponse<
        ODataCollection<EntryType>
      >;

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);

      const codes = data.value.map((et) => et.code);
      expect(codes).to.include('W'); // Work
      expect(codes).to.include('V'); // Vacation
      expect(codes).to.include('S'); // Sick
      expect(codes).to.include('B'); // Business Trip
    });
  });

  describe('WorkLocations', () => {
    it('should read all work locations', async () => {
      const { data, status } = (await GET('/odata/v4/track/WorkLocations', TEST_USERS.max)) as AxiosResponse<
        ODataCollection<WorkLocation>
      >;

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);

      data.value.forEach((location) => {
        expect(location).to.have.property('code');
        expect(location).to.have.property('name');
      });

      const codes = data.value.map((wl) => wl.code);
      expect(codes).to.include('HO'); // Home Office sollte vorhanden sein
    });
  });

  describe('TravelTypes', () => {
    it('should read all travel types', async () => {
      const { data, status } = (await GET('/odata/v4/track/TravelTypes', TEST_USERS.max)) as AxiosResponse<
        ODataCollection<TravelType>
      >;

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');
      expect(data.value.length).to.be.greaterThan(0);

      data.value.forEach((travelType) => {
        expect(travelType).to.have.property('code');
        expect(travelType).to.have.property('name');
      });
    });
  });

  describe('TimeEntryStatuses', () => {
    it('should read all time entry statuses', async () => {
      const { data, status } = (await GET('/odata/v4/track/TimeEntryStatuses', TEST_USERS.max)) as AxiosResponse<
        ODataCollection<TimeEntryStatus>
      >;

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

    it('should include localized texts for statuses', async () => {
      const { data, status } = (await GET(
        '/odata/v4/track/TimeEntryStatuses?$expand=texts',
        TEST_USERS.max,
      )) as AxiosResponse<ODataCollection<TimeEntryStatus>>;

      expect(status).to.equal(200);
      data.value.forEach((statusItem) => {
        if (statusItem.texts && statusItem.texts.length > 0) {
          expect(statusItem.texts[0]).to.have.property('name');
        }
      });
    });
  });

  describe('Region (States)', () => {
    it('should read all regions', async () => {
      const { data, status } = (await GET('/odata/v4/track/Region', TEST_USERS.max)) as AxiosResponse<
        ODataCollection<Region>
      >;

      expect(status).to.equal(200);
      expect(data.value).to.be.an('array');

      if (data.value.length > 0) {
        data.value.forEach((region) => {
          expect(region).to.have.property('code');
          expect(region).to.have.property('name');
        });

        const codes = data.value.map((r) => r.code);
        expect(codes).to.include('BY'); // Bayern sollte vorhanden sein
      }
    });
  });
});
