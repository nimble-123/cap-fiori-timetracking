import { Transaction } from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';
import { UserService, CustomizingService } from '../../services';
import { TimeEntryValidator } from '../../validators';
import { TimeEntryRepository } from '../../repositories';
import { TimeEntryFactory } from '../../factories';
import { logger } from '../../utils';

// Type definitions
interface Dependencies {
  userService: UserService;
  validator: TimeEntryValidator;
  repository: TimeEntryRepository;
  factory: TimeEntryFactory;
  customizingService: CustomizingService;
}

/**
 * Command für TimeEntry UPDATE Operation
 * Kapselt die gesamte Logik für das Aktualisieren von TimeEntries
 */
export class UpdateTimeEntryCommand {
  private userService: UserService;
  private validator: TimeEntryValidator;
  private repository: TimeEntryRepository;
  private factory: TimeEntryFactory;
  private customizingService: CustomizingService;

  constructor(dependencies: Dependencies) {
    this.userService = dependencies.userService;
    this.validator = dependencies.validator;
    this.repository = dependencies.repository;
    this.factory = dependencies.factory;
    this.customizingService = dependencies.customizingService;
  }

  /**
   * Führt UPDATE Operation aus
   * @param tx - Transaction Objekt
   * @param entryId - TimeEntry ID
   * @param updateData - Update-Daten
   * @returns Berechnete Daten oder leeres Objekt
   */
  async execute(tx: Transaction, entryId: string, updateData: Partial<TimeEntry>): Promise<any> {
    logger.commandStart('UpdateTimeEntry', { entryId, fields: Object.keys(updateData) });

    // Existierenden Entry laden
    const existingEntry = await this.repository.getById(tx, entryId);
    logger.commandData('UpdateTimeEntry', 'Existing entry loaded', { workDate: existingEntry.workDate });

    const statusDefaults = this.customizingService.getTimeEntryDefaults();
    this.validator.ensureStatusMutable(existingEntry.status_code, statusDefaults.statusReleasedCode);

    // Eindeutigkeit bei User/Datum-Änderungen prüfen
    await this.validateUniquenessForUpdate(tx, updateData, existingEntry, entryId);

    // Referenzen validieren
    await this.validator.validateReferences(tx, updateData);

    logger.commandData('UpdateTimeEntry', 'Validations passed', { entryId });

    // Prüfen ob Neuberechnung erforderlich ist
    const statusChanges = this.determineStatusChanges(updateData, existingEntry, statusDefaults);

    if (!this.validator.requiresTimeRecalculation(updateData)) {
      logger.commandEnd('UpdateTimeEntry', { recalculation: false, statusChanged: 'status_code' in statusChanges });
      return statusChanges; // Keine zeitrelevanten Änderungen
    }

    // Zusammengeführte Daten für Berechnung erstellen
    const mergedData = this.mergeEntryData(updateData, existingEntry);

    // Felder validieren
    this.validator.validateFieldsForUpdate(updateData, existingEntry);

    logger.commandData('UpdateTimeEntry', 'Recalculating time data', { entryType: mergedData.entryType });

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

    // expectedDailyHours aktualisieren falls User-Profil geändert wurde
    const updatedExpected = await this.checkAndUpdateExpectedHours(
      tx,
      mergedData.user_ID,
      existingEntry.expectedDailyHoursDec ?? undefined,
    );

    if (updatedExpected !== undefined) {
      durationData.expectedDailyHoursDec = updatedExpected;
    }

    logger.commandEnd('UpdateTimeEntry', {
      recalculation: true,
      netHours: durationData.durationHoursNet,
      statusChanged: 'status_code' in statusChanges,
    });

    return {
      ...durationData,
      ...statusChanges,
    };
  }

  /**
   * Prüft ob expectedDailyHours aktualisiert werden müssen
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param currentExpected - Aktueller Wert im TimeEntry
   * @returns Neuer Wert oder undefined wenn keine Änderung
   */
  private async checkAndUpdateExpectedHours(
    tx: Transaction,
    userId: string,
    currentExpected?: number,
  ): Promise<number | undefined> {
    const userExpected = await this.userService.getExpectedDailyHours(tx, userId);

    // Nur aktualisieren wenn sich der Wert geändert hat
    if (currentExpected !== undefined && Math.abs(currentExpected - userExpected) < 0.01) {
      return undefined; // Keine Änderung
    }

    logger.commandData('UpdateTimeEntry', 'Expected hours updated from user profile', {
      old: currentExpected,
      new: userExpected,
    });

    return userExpected;
  }

  /**
   * Validiert Eindeutigkeit bei User/Datum-Änderungen
   * @param tx - Transaction Objekt
   * @param updateData - Update-Daten
   * @param existingEntry - Bestehender Entry
   * @param entryId - Entry ID
   */
  private async validateUniquenessForUpdate(
    tx: Transaction,
    updateData: Partial<TimeEntry>,
    existingEntry: TimeEntry,
    entryId: string,
  ): Promise<void> {
    // Nur prüfen wenn User oder Datum geändert werden
    if (!updateData.user_ID && !updateData.workDate) {
      return;
    }

    const userId = updateData.user_ID ?? existingEntry.user_ID;
    const workDate = updateData.workDate ?? existingEntry.workDate;

    await this.validator.validateUniqueEntryPerDay(tx, userId!, workDate!, entryId);
  }

  /**
   * Erstellt zusammengeführte Entry-Daten für Update-Berechnung
   * @param updateData - Update-Daten
   * @param existingEntry - Bestehender Entry
   * @returns Zusammengeführte Daten
   */
  private mergeEntryData(updateData: Partial<TimeEntry>, existingEntry: TimeEntry): any {
    return {
      startTime: updateData.startTime ?? existingEntry.startTime,
      endTime: updateData.endTime ?? existingEntry.endTime,
      breakMin: updateData.breakMin !== undefined ? updateData.breakMin : existingEntry.breakMin,
      entryType: updateData.entryType ?? existingEntry.entryType ?? 'WORK',
      user_ID: updateData.user_ID ?? existingEntry.user_ID,
    };
  }

  /**
   * Ermittelt Status-Änderungen basierend auf Update-Daten
   */
  private determineStatusChanges(
    updateData: Partial<TimeEntry>,
    existingEntry: TimeEntry,
    statusDefaults: ReturnType<CustomizingService['getTimeEntryDefaults']>,
  ): Record<string, any> {
    const changes: Record<string, any> = {};
    const requestedStatus = updateData.status_code;

    if (requestedStatus) {
      this.validator.validateStatusChange(existingEntry.status_code, requestedStatus, statusDefaults);
      changes.status_code = requestedStatus;
      return changes;
    }

    // Ohne Status-Update: automatisch auf "Processed" setzen, sofern nicht bereits final
    const { statusProcessedCode, statusReleasedCode } = statusDefaults;
    if (existingEntry.status_code === statusReleasedCode) {
      return changes;
    }

    if (existingEntry.status_code !== statusProcessedCode) {
      changes.status_code = statusDefaults.statusProcessedCode;
    }

    return changes;
  }
}
