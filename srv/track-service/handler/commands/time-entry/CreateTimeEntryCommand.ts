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
    logger.commandStart('CreateTimeEntry', { workDate: entryData.workDate, entryType: entryData.entryType_code });

    // Validierung der Pflichtfelder
    const entryType = this.validator.validateRequiredFieldsForCreate(entryData);
    const { user_ID, workDate, startTime, endTime, entryType_code } = entryData;

    logger.commandData('CreateTimeEntry', 'Required fields validated', { entryType });

    // Eindeutigkeit pro Tag prüfen
    await this.validator.validateUniqueEntryPerDay(tx, user_ID!, workDate!);

    // Referenzen validieren
    await this.validator.validateReferences(tx, entryData);

    logger.commandData('CreateTimeEntry', 'Validations passed', { user_ID, workDate });

    // Für generierte Einträge (Wochenenden/Feiertage): Bereits berechnete Werte übernehmen
    const isGeneratedNonWork = entryData.source === 'GENERATED' && (entryType_code === 'O' || entryType_code === 'H');

    if (isGeneratedNonWork && entryData.durationHoursGross !== undefined) {
      logger.commandEnd('CreateTimeEntry', { source: 'GENERATED', entryType: entryType_code });
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
      logger.commandData('CreateTimeEntry', 'Calculating work time', { startTime, endTime });
      durationData = await this.factory.createWorkTimeData(
        this.userService,
        tx,
        user_ID!,
        startTime,
        endTime,
        entryData.breakMin || 0,
      );
    } else {
      logger.commandData('CreateTimeEntry', 'Calculating non-work time', { entryType });
      durationData = await this.factory.createNonWorkTimeData(this.userService, tx, user_ID!);
    }

    logger.commandEnd('CreateTimeEntry', {
      source: entryData.source || 'UI',
      netHours: durationData.durationHoursNet,
    });

    return {
      ...durationData,
      source: entryData.source || 'UI',
    };
  }
}
