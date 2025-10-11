/**
 * Validator für TimeEntry Operationen
 * Verwaltet alle Validierungslogik für TimeEntries
 */
class TimeEntryValidator {
  constructor(entities) {
    this.Project = entities.Project;
    this.ActivityTypes = entities.ActivityTypes;
  }

  /**
   * Validiert Pflichtfelder für TimeEntry CREATE
   * @param {Object} entryData - TimeEntry Daten
   * @returns {string} Entry Type
   */
  validateRequiredFieldsForCreate(entryData) {
    const { user_ID, workDate, startTime, endTime, entryType } = entryData;

    if (!user_ID) {
      throw new Error('user ist erforderlich.');
    }

    if (!workDate) {
      throw new Error('workDate ist erforderlich.');
    }

    const type = entryType || 'WORK';

    // Bei Arbeitszeit sind Start-/Endzeit erforderlich
    if (type === 'WORK' && (!startTime || !endTime)) {
      throw new Error('startTime und endTime sind bei Arbeitszeit erforderlich.');
    }

    return type;
  }

  /**
   * Validiert Felder für TimeEntry UPDATE
   * @param {Object} entryData - TimeEntry Daten
   * @param {Object} existingEntry - Bestehender TimeEntry
   */
  validateFieldsForUpdate(entryData, existingEntry) {
    const startTime = entryData.startTime ?? existingEntry.startTime;
    const endTime = entryData.endTime ?? existingEntry.endTime;
    const entryType = entryData.entryType ?? existingEntry.entryType ?? 'WORK';

    // Bei Arbeitszeit sind Start-/Endzeit erforderlich
    if (entryType === 'WORK' && (!startTime || !endTime)) {
      throw new Error('startTime und endTime sind bei Arbeitszeit erforderlich.');
    }
  }

  /**
   * Validiert Referenzen zu Projekt und Activity
   * @param {Object} tx - Transaction Objekt
   * @param {Object} entryData - TimeEntry Daten
   */
  async validateReferences(tx, entryData) {
    // Projekt-Validierung (nur aktive Projekte)
    if (entryData.project_ID) {
      const project = await tx.run(
        SELECT.one.from(this.Project).where({
          ID: entryData.project_ID,
          active: true,
        }),
      );

      if (!project) {
        throw new Error('Projekt ist ungültig oder inaktiv.');
      }
    }

    // Activity-Validierung
    if (entryData.activity_code) {
      const activity = await tx.run(
        SELECT.one.from(this.ActivityTypes).where({
          code: entryData.activity_code,
        }),
      );

      if (!activity) {
        throw new Error('Ungültiger Activity Code.');
      }
    }
  }

  /**
   * Prüft ob zeitrelevante Felder geändert wurden
   * @param {Object} updateData - Update-Daten
   * @returns {boolean} True wenn Neuberechnung erforderlich
   */
  requiresTimeRecalculation(updateData) {
    const timeRelevantFields = ['startTime', 'endTime', 'breakMin', 'user_ID', 'entryType'];

    return timeRelevantFields.some((field) => field in updateData);
  }
}

module.exports = TimeEntryValidator;
