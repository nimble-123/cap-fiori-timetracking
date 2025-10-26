import { TimeEntry, User } from '#cds-models/TrackService';
import { YearlyGenerationStrategy } from '../../strategies/index.js';
import { TimeEntryRepository } from '../../repositories/index.js';
import { UserService } from '../../services/index.js';
import { GenerationValidator } from '../../validators/index.js';
import { DateUtils, logger } from '../../utils/index.js';
import { CustomizingService } from '../../services/index.js';

// Type definitions
interface GenerationDependencies {
  userService: UserService;
  validator: GenerationValidator;
  repository: TimeEntryRepository;
  monthlyStrategy: any; // Not used in this command
  yearlyStrategy: YearlyGenerationStrategy;
  customizingService: CustomizingService;
}

export interface YearlyGenerationResult {
  newEntries: TimeEntry[];
  allEntries: TimeEntry[];
  stats: {
    generated: number;
    existing: number;
    total: number;
    workdays: number;
    weekends: number;
    holidays: number;
  };
}

/**
 * Command für die Generierung von jährlichen TimeEntries
 *
 * Workflow:
 * 1. User validieren und laden
 * 2. Jahr und Bundesland validieren
 * 3. Jahresdaten ermitteln (Start/End Datum)
 * 4. Existierende Einträge prüfen
 * 5. Fehlende Einträge generieren (inkl. Feiertage)
 * 6. Batch-Insert durchführen
 * 7. Alle Einträge des Jahres zurückgeben
 */
export class GenerateYearlyCommand {
  private userService: UserService;
  private validator: GenerationValidator;
  private repository: TimeEntryRepository;
  private strategy: YearlyGenerationStrategy;
  private customizingService: CustomizingService;

  constructor(dependencies: GenerationDependencies) {
    this.userService = dependencies.userService;
    this.validator = dependencies.validator;
    this.repository = dependencies.repository;
    this.strategy = dependencies.yearlyStrategy;
    this.customizingService = dependencies.customizingService;
  }

  /**
   * Führt jährliche Generierung aus
   * @param req - Request Objekt (für User-Identifikation)
   * @param year - Zieljahr
   * @param stateCode - Bundesland-Code (z.B. "BY")
   * @returns Generierungsergebnis mit detaillierten Stats
   */
  async execute(req: any, year?: number, stateCode?: string): Promise<YearlyGenerationResult> {
    logger.commandStart('GenerateYearly');

    // 1. Parameter validieren und defaults setzen
    const targetYear = year || new Date().getFullYear();
    const validatedStateCode = this.validator.validateStateCode(stateCode);

    logger.commandData('GenerateYearly', 'Parameters validated', { year: targetYear, state: validatedStateCode });

    // 2. User auflösen und validieren
    const { userID, user } = await this.userService.resolveUserForGeneration(req);
    this.validator.validateUser(user, userID);

    logger.commandData('GenerateYearly', 'User validated', { userID });

    // 3. Jahresdaten ermitteln
    const yearData = DateUtils.getYearData(targetYear);
    logger.commandData('GenerateYearly', 'Year period calculated', {
      start: yearData.yearStartStr,
      end: yearData.yearEndStr,
    });

    // 4. Existierende Einträge laden
    const existingDates = await this.repository.getExistingDatesInRange(
      userID,
      yearData.yearStartStr,
      yearData.yearEndStr,
    );

    logger.commandData('GenerateYearly', 'Existing entries loaded', { count: existingDates.size });

    // 5. Fehlende Einträge generieren (inkl. Feiertags-API-Call)
    // Strategy nutzt jetzt intern DateUtils und bekommt nur year statt yearData
    const newEntries = await this.strategy.generateMissingEntries(
      userID,
      user,
      targetYear,
      validatedStateCode,
      existingDates,
    );

    logger.commandData('GenerateYearly', 'New entries generated', { count: newEntries.length });

    // 6. Validierung der generierten Einträge
    this.validator.validateGeneratedEntries(newEntries);

    // 7. Stats vorab berechnen (für detaillierte Ausgabe)
    const stats = this.calculateYearlyStats(newEntries, existingDates.size);
    logger.stats('YearlyGeneration', 'Statistics calculated', stats);

    // 8. Batch-Insert (nur wenn neue Einträge vorhanden)
    if (newEntries.length > 0) {
      await this.repository.insertBatch(newEntries);
      logger.commandData('GenerateYearly', 'Entries persisted', { count: newEntries.length });
    }

    // 9. Alle Einträge des Jahres laden
    const allEntries = await this.repository.getEntriesInRange(userID, yearData.yearStartStr, yearData.yearEndStr);

    logger.commandEnd('GenerateYearly', { total: allEntries.length, generated: newEntries.length });

    return {
      newEntries,
      allEntries,
      stats,
    };
  }

  /**
   * Berechnet detaillierte Stats für Jahresgenerierung
   * @param entries - Generierte Einträge
   * @param existingCount - Anzahl bereits existierender Einträge
   * @returns Stats mit Workdays, Weekends, Holidays
   */
  private calculateYearlyStats(entries: TimeEntry[], existingCount: number): YearlyGenerationResult['stats'] {
    const defaults = this.customizingService.getTimeEntryDefaults();
    let workdays = 0;
    let weekends = 0;
    let holidays = 0;

    for (const entry of entries) {
      switch (entry.entryType_code) {
        case defaults.workEntryTypeCode:
          workdays++;
          break;
        case defaults.weekendEntryTypeCode:
          weekends++;
          break;
        case defaults.holidayEntryTypeCode:
          holidays++;
          break;
      }
    }

    return {
      generated: entries.length,
      existing: existingCount,
      total: entries.length + existingCount,
      workdays,
      weekends,
      holidays,
    };
  }
}
