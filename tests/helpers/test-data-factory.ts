/**
 * Test Data Factory
 *
 * Stellt wiederverwendbare Hilfsfunktionen zur Erstellung von
 * TimeEntry-Testdaten bereit. Kapselt Draft-Erstellung und -Aktivierung.
 */

import type { AxiosResponse } from 'axios';
import type { TestUser } from './test-users';
import type { TimeEntry } from '#cds-models/io/nimble';

// Verwende Partial<TimeEntry> aber erlaube auch flexible String-Types für Testdaten
type TimeEntryData = Partial<Omit<TimeEntry, 'workDate' | 'startTime' | 'endTime'>> & {
  workDate?: string;
  startTime?: string;
  endTime?: string;
};

interface DraftResponse {
  ID: string;
  IsActiveEntity: boolean;
  [key: string]: unknown;
}

interface ODataError {
  error?: {
    message?: string;
  };
}

type POSTFunction = (url: string, data: unknown, user?: TestUser) => Promise<AxiosResponse>;

/**
 * Factory für konsistente TimeEntry-Erstellung mit Draft-Handling
 */
export class TimeEntryFactory {
  private POST: POSTFunction;

  constructor(POST: POSTFunction) {
    this.POST = POST;
  }

  /**
   * Erstellt einen Draft und aktiviert ihn
   */
  async createAndActivate(entryData: TimeEntryData, user: TestUser): Promise<DraftResponse> {
    // Draft erstellen
    const { data: draft, status } = await this.POST(
      '/odata/v4/track/TimeEntries',
      {
        status_code: 'O',
        ...entryData,
      },
      user,
    );

    if (status !== 201) {
      throw new Error(`Failed to create draft: ${status}`);
    }

    // Draft aktivieren
    try {
      const { data: activated, status: activateStatus } = await this.POST(
        `/odata/v4/track/TimeEntries(ID=${draft.ID},IsActiveEntity=false)/draftActivate`,
        {},
        user,
      );

      if (![200, 201].includes(activateStatus)) {
        throw new Error(`Failed to activate draft: ${activateStatus}`);
      }

      return activated as DraftResponse;
    } catch (error) {
      // Re-throw mit besserem Error-Handling
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as Error & { response?: AxiosResponse<ODataError> };
        const errorMessage =
          axiosError.response?.data?.error?.message || axiosError.response?.statusText || 'Unknown error';
        const newError = new Error(
          `Failed to activate draft: ${axiosError.response?.status} - ${errorMessage}`,
        ) as Error & { response?: AxiosResponse };
        newError.response = axiosError.response;
        throw newError;
      }
      throw error;
    }
  }

  /**
   * Erstellt einen Work-Entry (Typ 'W')
   */
  async createWorkEntry(workDate: string, user: TestUser, overrides: TimeEntryData = {}): Promise<DraftResponse> {
    return this.createAndActivate(
      {
        user_ID: user.auth.username,
        workDate,
        entryType_code: 'W',
        startTime: '08:00:00',
        endTime: '16:00:00',
        breakMin: 30,
        project_ID: 'a1b2c3d4-e5f6-4a4a-b7b7-1234567890ab', // Standard Test-Project
        activity_code: 'BDEV',
        ...overrides,
      },
      user,
    );
  }

  /**
   * Erstellt einen Vacation-Entry (Typ 'V')
   */
  async createVacationEntry(workDate: string, user: TestUser, overrides: TimeEntryData = {}): Promise<DraftResponse> {
    return this.createAndActivate(
      {
        user_ID: user.auth.username,
        workDate,
        entryType_code: 'V',
        startTime: '08:00:00',
        endTime: '16:00:00',
        breakMin: 0,
        ...overrides,
      },
      user,
    );
  }

  /**
   * Erstellt einen Sick-Entry (Typ 'S')
   */
  async createSickEntry(workDate: string, user: TestUser, overrides: TimeEntryData = {}): Promise<DraftResponse> {
    return this.createAndActivate(
      {
        user_ID: user.auth.username,
        workDate,
        entryType_code: 'S',
        startTime: '08:00:00',
        endTime: '16:00:00',
        breakMin: 0,
        ...overrides,
      },
      user,
    );
  }

  /**
   * Erstellt einen Business Trip-Entry (Typ 'B')
   */
  async createBusinessTripEntry(
    workDate: string,
    user: TestUser,
    overrides: TimeEntryData = {},
  ): Promise<DraftResponse> {
    return this.createAndActivate(
      {
        user_ID: user.auth.username,
        workDate,
        entryType_code: 'B',
        startTime: '08:00:00',
        endTime: '18:00:00',
        breakMin: 60,
        project_ID: 'a1b2c3d4-e5f6-4a4a-b7b7-1234567890ab',
        activity_code: 'BDEV',
        travelType_code: 'BA',
        ...overrides,
      },
      user,
    );
  }

  /**
   * Erstellt nur einen Draft (ohne Aktivierung)
   */
  async createDraft(entryData: TimeEntryData, user: TestUser): Promise<DraftResponse> {
    const { data, status } = await this.POST(
      '/odata/v4/track/TimeEntries',
      {
        status_code: 'O',
        ...entryData,
      },
      user,
    );

    if (status !== 201) {
      throw new Error(`Failed to create draft: ${status}`);
    }

    return data as DraftResponse;
  }

  /**
   * Aktiviert einen bestehenden Draft
   */
  async activateDraft(draftID: string, user: TestUser): Promise<DraftResponse> {
    try {
      const { data, status } = await this.POST(
        `/odata/v4/track/TimeEntries(ID=${draftID},IsActiveEntity=false)/draftActivate`,
        {},
        user,
      );

      if (![200, 201].includes(status)) {
        throw new Error(`Failed to activate draft: ${status}`);
      }

      return data as DraftResponse;
    } catch (error) {
      // Re-throw mit besserem Error-Handling
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as Error & { response?: AxiosResponse<ODataError> };
        const errorMessage =
          axiosError.response?.data?.error?.message || axiosError.response?.statusText || 'Unknown error';
        const newError = new Error(
          `Failed to activate draft: ${axiosError.response?.status} - ${errorMessage}`,
        ) as Error & { response?: AxiosResponse };
        newError.response = axiosError.response;
        throw newError;
      }
      throw error;
    }
  }
}

/**
 * Generiert ein eindeutiges zukünftiges Datum für Tests
 * @param daysFromNow - Tage in der Zukunft (default: zufällig 1-365)
 * @returns Format 'YYYY-MM-DD'
 */
export function generateUniqueFutureDate(daysFromNow: number | null = null): string {
  const days = daysFromNow || Math.floor(Math.random() * 1000) + 365; // Start bei 365+ für mehr Abstand
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Generiert ein Datum im Jahr 2027+ (weit genug in der Zukunft für Tests)
 * WICHTIG: Verwendet automatisch einen Counter um Duplikate zu vermeiden
 * @param year - Jahr (default: 2027)
 * @param month - Monat 1-12
 * @param day - Tag 1-31
 * @returns Format 'YYYY-MM-DD'
 */
let testDateCounter = 0;
export function generateTestDate(
  year: number | null = null,
  month: number | null = null,
  day: number | null = null,
): string {
  // Wenn keine Parameter gegeben, verwende Counter für Eindeutigkeit
  if (year === null) {
    testDateCounter++;
    const baseDate = new Date('2030-01-01');
    baseDate.setDate(baseDate.getDate() + testDateCounter);
    return baseDate.toISOString().split('T')[0];
  }

  const paddedMonth = String(month).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
}
