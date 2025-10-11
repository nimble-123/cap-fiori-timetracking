import { Transaction } from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';
import { UserService } from '../services/UserService';
import { TimeEntryValidator } from '../validators/TimeEntryValidator';
import { TimeEntryRepository } from '../repositories/TimeEntryRepository';
import { TimeEntryFactory } from '../factories/TimeEntryFactory';

// Type definitions
interface Dependencies {
  userService: UserService;
  validator: TimeEntryValidator;
  repository: TimeEntryRepository;
  factory: typeof TimeEntryFactory;
}

/**
 * Command für TimeEntry CREATE Operation
 * Kapselt die gesamte Logik für das Erstellen neuer TimeEntries
 */
export class CreateTimeEntryCommand {
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
   * Führt CREATE Operation aus
   * @param tx - Transaction Objekt
   * @param entryData - TimeEntry Daten
   * @returns Berechnete Daten für den Entry
   */
  async execute(tx: Transaction, entryData: Partial<TimeEntry>): Promise<any> {
    // Validierung der Pflichtfelder
    const entryType = this.validator.validateRequiredFieldsForCreate(entryData);
    const { user_ID, workDate, startTime, endTime, entryType_code } = entryData;

    // Eindeutigkeit pro Tag prüfen
    await this.repository.validateUniqueEntryPerDay(tx, user_ID!, workDate!);

    // Referenzen validieren
    await this.validator.validateReferences(tx, entryData);

    // Für generierte Einträge (Wochenenden/Feiertage): Bereits berechnete Werte übernehmen
    const isGeneratedNonWork = entryData.source === 'GENERATED' && (entryType_code === 'O' || entryType_code === 'H');

    if (isGeneratedNonWork && entryData.durationHoursGross !== undefined) {
      // Bereits berechnete Werte aus der Strategie übernehmen
      return {
        breakMin: entryData.breakMin,
        durationHoursGross: entryData.durationHoursGross,
        durationHoursNet: entryData.durationHoursNet,
        overtimeHours: entryData.overtimeHours,
        undertimeHours: entryData.undertimeHours,
        source: entryData.source,
      };
    }

    // Zeitdaten berechnen
    let durationData;
    if (entryType === 'WORK' && startTime && endTime) {
      durationData = await this.factory.createWorkTimeData(
        this.userService,
        tx,
        user_ID!,
        startTime,
        endTime,
        entryData.breakMin || 0,
      );
    } else {
      durationData = await this.factory.createNonWorkTimeData(this.userService, tx, user_ID!);
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

    await this.repository.validateUniqueEntryPerDay(tx, userId!, workDate!, entryId);
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
