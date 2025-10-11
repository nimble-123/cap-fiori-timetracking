/**
 * Command für TimeEntry CREATE Operation
 * Kapselt die gesamte Logik für das Erstellen neuer TimeEntries
 */
class CreateTimeEntryCommand {
  constructor(dependencies) {
    this.userService = dependencies.userService;
    this.validator = dependencies.validator;
    this.repository = dependencies.repository;
    this.factory = dependencies.factory;
  }

  /**
   * Führt CREATE Operation aus
   * @param {Object} tx - Transaction Objekt
   * @param {Object} entryData - TimeEntry Daten
   * @returns {Promise<Object>} Berechnete Daten für den Entry
   */
  async execute(tx, entryData) {
    // Validierung der Pflichtfelder
    const entryType = this.validator.validateRequiredFieldsForCreate(entryData);
    const { user_ID, workDate, startTime, endTime } = entryData;

    // Eindeutigkeit pro Tag prüfen
    await this.repository.validateUniqueEntryPerDay(tx, user_ID, workDate);

    // Referenzen validieren
    await this.validator.validateReferences(tx, entryData);

    // Zeitdaten berechnen
    let durationData;
    if (entryType === 'WORK' && startTime && endTime) {
      durationData = await this.factory.createWorkTimeData(
        this.userService,
        tx,
        user_ID,
        startTime,
        endTime,
        entryData.breakMin,
      );
    } else {
      durationData = await this.factory.createNonWorkTimeData(this.userService, tx, user_ID);
    }

    return {
      ...durationData,
      source: entryData.source || 'UI',
    };
  }
}

/**
 * Command für TimeEntry UPDATE Operation
 * Kapselt die gesamte Logik für das Aktualisieren von TimeEntries
 */
class UpdateTimeEntryCommand {
  constructor(dependencies) {
    this.userService = dependencies.userService;
    this.validator = dependencies.validator;
    this.repository = dependencies.repository;
    this.factory = dependencies.factory;
  }

  /**
   * Führt UPDATE Operation aus
   * @param {Object} tx - Transaction Objekt
   * @param {string} entryId - TimeEntry ID
   * @param {Object} updateData - Update-Daten
   * @returns {Promise<Object>} Berechnete Daten oder leeres Objekt
   */
  async execute(tx, entryId, updateData) {
    // Existierenden Entry laden
    const existingEntry = await this.repository.getById(tx, entryId);

    // Eindeutigkeit bei User/Datum-Änderungen prüfen
    await this.validateUniquenessForUpdate(tx, updateData, existingEntry, entryId);

    // Referenzen validieren
    await this.validator.validateReferences(tx, updateData);

    // Prüfen ob Neuberechnung erforderlich ist
    if (!this.validator.requiresTimeRecalculation(updateData)) {
      return {}; // Keine zeitrelevanten Änderungen
    }

    // Zusammengeführte Daten für Berechnung erstellen
    const mergedData = this.mergeEntryData(updateData, existingEntry);

    // Felder validieren
    this.validator.validateFieldsForUpdate(updateData, existingEntry);

    // Zeitdaten neu berechnen
    let durationData;
    if (mergedData.entryType === 'WORK') {
      durationData = await this.factory.createWorkTimeData(
        this.userService,
        tx,
        mergedData.user_ID,
        mergedData.startTime,
        mergedData.endTime,
        mergedData.breakMin,
      );
    } else {
      durationData = await this.factory.createNonWorkTimeData(this.userService, tx, mergedData.user_ID);
    }

    return durationData;
  }

  /**
   * Validiert Eindeutigkeit bei User/Datum-Änderungen
   * @param {Object} tx - Transaction Objekt
   * @param {Object} updateData - Update-Daten
   * @param {Object} existingEntry - Bestehender Entry
   * @param {string} entryId - Entry ID
   */
  async validateUniquenessForUpdate(tx, updateData, existingEntry, entryId) {
    // Nur prüfen wenn User oder Datum geändert werden
    if (!updateData.user_ID && !updateData.workDate) {
      return;
    }

    const userId = updateData.user_ID ?? existingEntry.user_ID;
    const workDate = updateData.workDate ?? existingEntry.workDate;

    await this.repository.validateUniqueEntryPerDay(tx, userId, workDate, entryId);
  }

  /**
   * Erstellt zusammengeführte Entry-Daten für Update-Berechnung
   * @param {Object} updateData - Update-Daten
   * @param {Object} existingEntry - Bestehender Entry
   * @returns {Object} Zusammengeführte Daten
   */
  mergeEntryData(updateData, existingEntry) {
    return {
      startTime: updateData.startTime ?? existingEntry.startTime,
      endTime: updateData.endTime ?? existingEntry.endTime,
      breakMin: updateData.breakMin !== undefined ? updateData.breakMin : existingEntry.breakMin,
      entryType: updateData.entryType ?? existingEntry.entryType ?? 'WORK',
      user_ID: updateData.user_ID ?? existingEntry.user_ID,
    };
  }
}

module.exports = { CreateTimeEntryCommand, UpdateTimeEntryCommand };
