import { Transaction } from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';
import { UserService } from '../../services';
import { TimeEntryValidator } from '../../validators';
import { TimeEntryRepository } from '../../repositories';
import { TimeEntryFactory } from '../../factories';
import { logger } from '../../utils';

// Type definitions
interface Dependencies {
  userService: UserService;
  validator: TimeEntryValidator;
  repository: TimeEntryRepository;
  factory: typeof TimeEntryFactory;
}

/**
 * Command für TimeEntry UPDATE Operation
 * Kapselt die gesamte Logik für das Aktualisieren von TimeEntries
 */
export class UpdateTimeEntryCommand {
  private userService: UserService;
  private validator: TimeEntryValidator;
  private repository: TimeEntryRepository;
  private factory: typeof TimeEntryFactory;

  constructor(dependencies: Dependencies) {
    this.userService = dependencies.userService;
    this.validator = dependencies.validator;
    this.repository = dependencies.repository;
    this.factory = dependencies.factory;
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

    // Eindeutigkeit bei User/Datum-Änderungen prüfen
    await this.validateUniquenessForUpdate(tx, updateData, existingEntry, entryId);

    // Referenzen validieren
    await this.validator.validateReferences(tx, updateData);

    logger.commandData('UpdateTimeEntry', 'Validations passed', { entryId });

    // Prüfen ob Neuberechnung erforderlich ist
    if (!this.validator.requiresTimeRecalculation(updateData)) {
      logger.commandEnd('UpdateTimeEntry', { recalculation: false });
      return {}; // Keine zeitrelevanten Änderungen
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

    logger.commandEnd('UpdateTimeEntry', { recalculation: true, netHours: durationData.durationHoursNet });

    return durationData;
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
}
