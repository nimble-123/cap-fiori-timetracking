/**
 * Repository für TimeEntry Datenzugriff
 * Kapselt alle Datenbankoperationen für TimeEntries
 */
class TimeEntryRepository {
  constructor(entities) {
    this.TimeEntry = entities.TimeEntry;
  }

  /**
   * Prüft Eindeutigkeit pro User/Tag
   * @param {Object} tx - Transaction Objekt
   * @param {string} userId - User ID
   * @param {string} workDate - Arbeitsdatum
   * @param {string} excludeId - Optional: ID die ausgeschlossen werden soll
   */
  async validateUniqueEntryPerDay(tx, userId, workDate, excludeId = null) {
    const whereClause = { user_ID: userId, workDate };

    if (excludeId) {
      whereClause.ID = { '!=': excludeId };
    }

    const existingEntry = await tx.run(SELECT.one.from(this.TimeEntry).where(whereClause));

    if (existingEntry) {
      const error = new Error('Es existiert bereits ein Eintrag für diesen Tag.');
      error.code = 409;
      throw error;
    }
  }

  /**
   * Lädt TimeEntry by ID
   * @param {Object} tx - Transaction Objekt
   * @param {string} entryId - TimeEntry ID
   * @returns {Promise<Object>} TimeEntry oder null
   */
  async getById(tx, entryId) {
    const entry = await tx.run(SELECT.one.from(this.TimeEntry).where({ ID: entryId }));

    if (!entry) {
      throw new Error('TimeEntry nicht gefunden.');
    }

    return entry;
  }

  /**
   * Lädt existierende Entries für User im Zeitraum (nur Daten)
   * @param {string} userID - User ID
   * @param {string} startDate - Startdatum
   * @param {string} endDate - Enddatum
   * @returns {Promise<Set<string>>} Set der existierenden Daten
   */
  async getExistingDatesInRange(userID, startDate, endDate) {
    console.log(`📅 Suche existierende Einträge von ${startDate} bis ${endDate}`);

    const existingEntries = await SELECT.from('io.nimble.TimeEntry').where({
      user_ID: userID,
    });

    const existingInRange = existingEntries.filter((entry) => entry.workDate >= startDate && entry.workDate <= endDate);

    console.log(`📝 ${existingInRange.length} existierende Einträge im Zeitraum gefunden`);

    return new Set(existingInRange.map((entry) => entry.workDate));
  }

  /**
   * Lädt alle TimeEntries für User im Zeitraum
   * @param {string} userID - User ID
   * @param {string} startDate - Startdatum
   * @param {string} endDate - Enddatum
   * @returns {Promise<Array<Object>>} TimeEntries im Zeitraum
   */
  async getEntriesInRange(userID, startDate, endDate) {
    const allUserEntries = await SELECT.from('io.nimble.TimeEntry').where({ user_ID: userID }).orderBy('workDate');

    return allUserEntries.filter((entry) => entry.workDate >= startDate && entry.workDate <= endDate);
  }

  /**
   * Batch Insert von TimeEntries
   * @param {Array<Object>} entries - Zu speichernde Einträge
   * @returns {Promise<void>}
   */
  async insertBatch(entries) {
    if (entries.length === 0) {
      console.log(`ℹ️ Keine neuen Einträge zu erstellen`);
      return;
    }

    console.log(`💾 Persistiere ${entries.length} neue TimeEntries in DB...`);
    await INSERT.into('io.nimble.TimeEntry').entries(entries);
    console.log(`✅ ${entries.length} TimeEntries erfolgreich gespeichert`);
  }
}

module.exports = TimeEntryRepository;
