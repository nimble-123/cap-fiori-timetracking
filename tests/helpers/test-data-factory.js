/**
 * Test Data Factory
 *
 * Stellt wiederverwendbare Hilfsfunktionen zur Erstellung von
 * TimeEntry-Testdaten bereit. Kapselt Draft-Erstellung und -Aktivierung.
 */

/**
 * Factory für konsistente TimeEntry-Erstellung mit Draft-Handling
 */
class TimeEntryFactory {
  /**
   * @param {Object} POST - cds.test POST function
   */
  constructor(POST) {
    this.POST = POST;
  }

  /**
   * Erstellt einen Draft und aktiviert ihn
   * @param {Object} entryData - Entry-Daten
   * @param {Object} user - { auth: { username, password } }
   * @returns {Promise<Object>} Aktivierter Entry
   */
  async createAndActivate(entryData, user) {
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

      return activated;
    } catch (error) {
      // Re-throw mit besserem Error-Handling
      if (error.response) {
        const axiosError = new Error(
          `Failed to activate draft: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`,
        );
        axiosError.response = error.response;
        throw axiosError;
      }
      throw error;
    }
  }

  /**
   * Erstellt einen Work-Entry (Typ 'W')
   * @param {string} workDate - Format 'YYYY-MM-DD'
   * @param {Object} user - { auth: { username, password } }
   * @param {Object} overrides - Zusätzliche/Override-Felder
   * @returns {Promise<Object>}
   */
  async createWorkEntry(workDate, user, overrides = {}) {
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
   * @param {string} workDate - Format 'YYYY-MM-DD'
   * @param {Object} user - { auth: { username, password } }
   * @param {Object} overrides - Zusätzliche/Override-Felder
   * @returns {Promise<Object>}
   */
  async createVacationEntry(workDate, user, overrides = {}) {
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
   * @param {string} workDate - Format 'YYYY-MM-DD'
   * @param {Object} user - { auth: { username, password } }
   * @param {Object} overrides - Zusätzliche/Override-Felder
   * @returns {Promise<Object>}
   */
  async createSickEntry(workDate, user, overrides = {}) {
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
   * @param {string} workDate - Format 'YYYY-MM-DD'
   * @param {Object} user - { auth: { username, password } }
   * @param {Object} overrides - Zusätzliche/Override-Felder
   * @returns {Promise<Object>}
   */
  async createBusinessTripEntry(workDate, user, overrides = {}) {
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
   * @param {Object} entryData - Entry-Daten
   * @param {Object} user - { auth: { username, password } }
   * @returns {Promise<Object>} Draft
   */
  async createDraft(entryData, user) {
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

    return data;
  }

  /**
   * Aktiviert einen bestehenden Draft
   * @param {string} draftID - ID des Drafts
   * @param {Object} user - { auth: { username, password } }
   * @returns {Promise<Object>} Aktivierter Entry
   */
  async activateDraft(draftID, user) {
    try {
      const { data, status } = await this.POST(
        `/odata/v4/track/TimeEntries(ID=${draftID},IsActiveEntity=false)/draftActivate`,
        {},
        user,
      );

      if (![200, 201].includes(status)) {
        throw new Error(`Failed to activate draft: ${status}`);
      }

      return data;
    } catch (error) {
      // Re-throw mit besserem Error-Handling
      if (error.response) {
        const axiosError = new Error(
          `Failed to activate draft: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`,
        );
        axiosError.response = error.response;
        throw axiosError;
      }
      throw error;
    }
  }
}

/**
 * Generiert ein eindeutiges zukünftiges Datum für Tests
 * @param {number} daysFromNow - Tage in der Zukunft (default: zufällig 1-365)
 * @returns {string} Format 'YYYY-MM-DD'
 */
function generateUniqueFutureDate(daysFromNow = null) {
  const days = daysFromNow || Math.floor(Math.random() * 1000) + 365; // Start bei 365+ für mehr Abstand
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Generiert ein Datum im Jahr 2027+ (weit genug in der Zukunft für Tests)
 * WICHTIG: Verwendet automatisch einen Counter um Duplikate zu vermeiden
 * @param {number} year - Jahr (default: 2027)
 * @param {number} month - Monat 1-12
 * @param {number} day - Tag 1-31
 * @returns {string} Format 'YYYY-MM-DD'
 */
let testDateCounter = 0;
function generateTestDate(year = null, month = null, day = null) {
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

module.exports = {
  TimeEntryFactory,
  generateUniqueFutureDate,
  generateTestDate,
};
