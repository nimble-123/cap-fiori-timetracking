/**
 * Integration Tests - TimeEntry Status Management
 *
 * Testet Status-Transitionen und Actions (markDone, release)
 */
import cds from '@sap/cds';
import type { AxiosResponse } from 'axios';
import { TimeEntryFactory, generateTestDate, TEST_USERS } from '../helpers';
import type { TimeEntry } from '#cds-models/io/nimble';

const { POST, PATCH, DELETE, expect } = cds.test(__dirname + '/../..', '--in-memory');

describe('TrackService - TimeEntry Status Management', () => {
  let factory: TimeEntryFactory;

  before(() => {
    factory = new TimeEntryFactory(POST);
  });

  describe('Status Actions', () => {
    let processedEntry: TimeEntry;
    let doneEntry: TimeEntry;
    let releasedEntry: TimeEntry;

    before(async () => {
      // Setup: Erstelle Entries in verschiedenen Status

      // Entry 1: Auf 'Processed' bringen durch Update
      const entry1 = await factory.createWorkEntry(generateTestDate(), TEST_USERS.max);
      const { data: editDraft1 } = await POST(
        `/odata/v4/track/TimeEntries(ID=${entry1.ID},IsActiveEntity=true)/draftEdit`,
        {},
        TEST_USERS.max,
      );
      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft1.ID},IsActiveEntity=false)`,
        { note: 'Update to Processed' },
        TEST_USERS.max,
      );
      const { data: updated1 } = await POST(
        `/odata/v4/track/TimeEntries(ID=${editDraft1.ID},IsActiveEntity=false)/draftActivate`,
        {},
        TEST_USERS.max,
      );
      processedEntry = updated1;

      // Entry 2: Auf 'Done' bringen
      const entry2 = await factory.createWorkEntry(generateTestDate(), TEST_USERS.max);
      const { data: editDraft2 } = await POST(
        `/odata/v4/track/TimeEntries(ID=${entry2.ID},IsActiveEntity=true)/draftEdit`,
        {},
        TEST_USERS.max,
      );
      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft2.ID},IsActiveEntity=false)`,
        { note: 'Update to Processed' },
        TEST_USERS.max,
      );
      await POST(
        `/odata/v4/track/TimeEntries(ID=${editDraft2.ID},IsActiveEntity=false)/draftActivate`,
        {},
        TEST_USERS.max,
      );
      const { data: done } = await POST(
        `/odata/v4/track/TimeEntries(ID=${entry2.ID},IsActiveEntity=true)/TrackService.markTimeEntryDone`,
        {},
        TEST_USERS.max,
      );
      doneEntry = done;

      // Entry 3: Auf 'Released' bringen
      const entry3 = await factory.createWorkEntry(generateTestDate(), TEST_USERS.max);
      const { data: editDraft3 } = await POST(
        `/odata/v4/track/TimeEntries(ID=${entry3.ID},IsActiveEntity=true)/draftEdit`,
        {},
        TEST_USERS.max,
      );
      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft3.ID},IsActiveEntity=false)`,
        { note: 'Update' },
        TEST_USERS.max,
      );
      await POST(
        `/odata/v4/track/TimeEntries(ID=${editDraft3.ID},IsActiveEntity=false)/draftActivate`,
        {},
        TEST_USERS.max,
      );
      await POST(
        `/odata/v4/track/TimeEntries(ID=${entry3.ID},IsActiveEntity=true)/TrackService.markTimeEntryDone`,
        {},
        TEST_USERS.max,
      );
      const { data: released } = await POST(
        `/odata/v4/track/TimeEntries(ID=${entry3.ID},IsActiveEntity=true)/TrackService.releaseTimeEntry`,
        {},
        TEST_USERS.max,
      );
      releasedEntry = released;
    });
    it('should mark processed entry as done', async () => {
      const { data, status } = await POST(
        `/odata/v4/track/TimeEntries(ID=${processedEntry.ID},IsActiveEntity=true)/TrackService.markTimeEntryDone`,
        {},
        TEST_USERS.max,
      );

      expect(status).to.equal(200);
      expect(data.status_code).to.equal('D');
    });

    it('should release done entry', async () => {
      const { data, status } = await POST(
        `/odata/v4/track/TimeEntries(ID=${doneEntry.ID},IsActiveEntity=true)/TrackService.releaseTimeEntry`,
        {},
        TEST_USERS.max,
      );

      expect(status).to.equal(200);
      expect(data.status_code).to.equal('R');
    });

    it('should reject releasing entry that is not done', async () => {
      // Erstelle neuen Entry in Status 'O'
      const openEntry = await factory.createWorkEntry(generateTestDate(), TEST_USERS.max);

      try {
        await POST(
          `/odata/v4/track/TimeEntries(ID=${openEntry.ID},IsActiveEntity=true)/TrackService.releaseTimeEntry`,
          {},
          TEST_USERS.max,
        );
        expect.fail('Expected validation error was not thrown');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: AxiosResponse };
          expect(axiosError.response.status).to.equal(409);
        } else {
          throw error;
        }
      }
    });

    it('should reject editing released entries', async () => {
      const { data: editDraft } = await POST(
        `/odata/v4/track/TimeEntries(ID=${releasedEntry.ID},IsActiveEntity=true)/draftEdit`,
        {},
        TEST_USERS.max,
      );

      await PATCH(
        `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)`,
        { note: 'Attempt to modify released entry' },
        TEST_USERS.max,
      );

      try {
        await POST(
          `/odata/v4/track/TimeEntries(ID=${editDraft.ID},IsActiveEntity=false)/draftActivate`,
          {},
          TEST_USERS.max,
        );
        expect.fail('Expected validation error was not thrown');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: AxiosResponse };
          expect(axiosError.response.status).to.equal(409);
        } else {
          throw error;
        }
      }
    });

    it('should reject marking released entry as done again', async () => {
      try {
        await POST(
          `/odata/v4/track/TimeEntries(ID=${releasedEntry.ID},IsActiveEntity=true)/TrackService.markTimeEntryDone`,
          {},
          TEST_USERS.max,
        );
        expect.fail('Expected validation error was not thrown');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: AxiosResponse };
          expect(axiosError.response.status).to.equal(409);
        } else {
          throw error;
        }
      }
    });
  });

  describe('Bound Actions', () => {
    let testEntry: TimeEntry;

    before(async () => {
      testEntry = await factory.createWorkEntry(generateTestDate(), TEST_USERS.max);
    });

    it('should recalculate TimeEntry', async () => {
      const { data, status } = await POST(
        `/odata/v4/track/TimeEntries(ID=${testEntry.ID},IsActiveEntity=true)/TrackService.recalculateTimeEntry`,
        {},
        TEST_USERS.max,
      );

      expect(status).to.equal(200);
      expect(data).to.have.property('durationHoursNet');
      expect(data).to.have.property('overtimeHours');
      expect(data).to.have.property('undertimeHours');
    });
  });

  describe('DELETE Protection', () => {
    it('should reject deleting TimeEntry (business rule)', async () => {
      const entry = await factory.createWorkEntry(generateTestDate(), TEST_USERS.max);

      try {
        await DELETE(`/odata/v4/track/TimeEntries(ID=${entry.ID},IsActiveEntity=true)`, TEST_USERS.max);
        expect.fail('Expected validation error was not thrown');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as {
            response: AxiosResponse<{ error: { message: string } }>;
          };
          expect(axiosError.response.status).to.equal(405);
          expect(axiosError.response.data.error.message).to.include('not deletable');
        } else {
          throw error;
        }
      }
    });
  });
});
