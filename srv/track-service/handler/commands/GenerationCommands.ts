import { TimeEntry, User } from '#cds-models/TrackService';
import { MonthlyGenerationStrategy } from '../strategies/MonthlyGenerationStrategy';
import { YearlyGenerationStrategy } from '../strategies/YearlyGenerationStrategy';
import { TimeEntryRepository } from '../repositories/TimeEntryRepository';
import { UserService } from '../services/UserService';
import { GenerationValidator } from '../validators/GenerationValidator';

// Type definitions
interface GenerationDependencies {
  userService: UserService;
  validator: GenerationValidator;
  repository: TimeEntryRepository;
  monthlyStrategy: MonthlyGenerationStrategy;
  yearlyStrategy: YearlyGenerationStrategy;
}

interface MonthlyGenerationResult {
  newEntries: TimeEntry[];
  allEntries: TimeEntry[];
  stats: {
    generated: number;
    existing: number;
    total: number;
  };
}

interface YearlyGenerationResult {
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
 * Command für die Generierung von monatlichen TimeEntries
 *
 * Workflow:
 * 1. User validieren und laden
 * 2. Monatsdaten ermitteln (Start/End Datum)
 * 3. Existierende Einträge prüfen
 * 4. Fehlende Einträge generieren
 * 5. Batch-Insert durchführen
 * 6. Alle Einträge des Monats zurückgeben
 */
export class GenerateMonthlyCommand {
  private userService: UserService;
  private validator: GenerationValidator;
  private repository: TimeEntryRepository;
  private strategy: MonthlyGenerationStrategy;

  constructor(dependencies: GenerationDependencies) {
    this.userService = dependencies.userService;
    this.validator = dependencies.validator;
    this.repository = dependencies.repository;
    this.strategy = dependencies.monthlyStrategy;
  }

  /**
   * Führt monatliche Generierung aus
   * @param req - Request Objekt (für User-Identifikation)
   * @returns Generierungsergebnis mit Stats
   */
  async execute(req: any): Promise<MonthlyGenerationResult> {
    console.log('🚀 GenerateMonthlyCommand.execute() gestartet');

    // 1. User auflösen und validieren
    const { userID, user } = await this.userService.resolveUserForGeneration(req);
    this.validator.validateUser(user, userID);

    console.log(`👤 User validiert: ${userID}`);

    // 2. Monatsdaten ermitteln (aktueller Monat)
    const monthData = this.strategy.getCurrentMonthData();
    console.log(`📅 Monat: ${monthData.monthStartStr} bis ${monthData.monthEndStr}`);

    // 3. Existierende Einträge laden
    const existingDates = await this.repository.getExistingDatesInRange(
      userID,
      monthData.monthStartStr,
      monthData.monthEndStr,
    );

    console.log(`📊 ${existingDates.size} existierende Einträge gefunden`);

    // 4. Fehlende Einträge generieren
    const newEntries = this.strategy.generateMissingEntries(userID, user, monthData, existingDates);

    console.log(`✨ ${newEntries.length} neue Einträge zu generieren`);

    // 5. Validierung der generierten Einträge
    this.validator.validateGeneratedEntries(newEntries);

    // 6. Batch-Insert (nur wenn neue Einträge vorhanden)
    if (newEntries.length > 0) {
      await this.repository.insertBatch(newEntries);
      console.log(`💾 ${newEntries.length} Einträge erfolgreich gespeichert`);
    }

    // 7. Alle Einträge des Monats laden
    const allEntries = await this.repository.getEntriesInRange(userID, monthData.monthStartStr, monthData.monthEndStr);

    // 8. Stats zusammenstellen
    const stats = {
      generated: newEntries.length,
      existing: existingDates.size,
      total: allEntries.length,
    };

    console.log(`✅ GenerateMonthlyCommand abgeschlossen:`, stats);

    return {
      newEntries,
      allEntries,
      stats,
    };
  }
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

  constructor(dependencies: GenerationDependencies) {
    this.userService = dependencies.userService;
    this.validator = dependencies.validator;
    this.repository = dependencies.repository;
    this.strategy = dependencies.yearlyStrategy;
  }

  /**
   * Führt jährliche Generierung aus
   * @param req - Request Objekt (für User-Identifikation)
   * @param year - Zieljahr
   * @param stateCode - Bundesland-Code (z.B. "BY")
   * @returns Generierungsergebnis mit detaillierten Stats
   */
  async execute(req: any, year?: number, stateCode?: string): Promise<YearlyGenerationResult> {
    console.log('🚀 GenerateYearlyCommand.execute() gestartet');

    // 1. Parameter validieren und defaults setzen
    const targetYear = year || new Date().getFullYear();
    const validatedStateCode = this.validator.validateStateCode(stateCode);

    console.log(`📅 Jahr: ${targetYear}, Bundesland: ${validatedStateCode}`);

    // 2. User auflösen und validieren
    const { userID, user } = await this.userService.resolveUserForGeneration(req);
    this.validator.validateUser(user, userID);

    console.log(`👤 User validiert: ${userID}`);

    // 3. Jahresdaten ermitteln
    const yearData = this.strategy.getYearData(targetYear);
    console.log(`📅 Zeitraum: ${yearData.yearStartStr} bis ${yearData.yearEndStr}`);

    // 4. Existierende Einträge laden
    const existingDates = await this.repository.getExistingDatesInRange(
      userID,
      yearData.yearStartStr,
      yearData.yearEndStr,
    );

    console.log(`📊 ${existingDates.size} existierende Einträge gefunden`);

    // 5. Fehlende Einträge generieren (inkl. Feiertags-API-Call)
    const newEntries = await this.strategy.generateMissingEntries(
      userID,
      user,
      yearData,
      validatedStateCode,
      existingDates,
    );

    console.log(`✨ ${newEntries.length} neue Einträge zu generieren`);

    // 6. Validierung der generierten Einträge
    this.validator.validateGeneratedEntries(newEntries);

    // 7. Stats vorab berechnen (für detaillierte Ausgabe)
    const stats = this.calculateYearlyStats(newEntries, existingDates.size);
    console.log(`📈 Stats:`, stats);

    // 8. Batch-Insert (nur wenn neue Einträge vorhanden)
    if (newEntries.length > 0) {
      await this.repository.insertBatch(newEntries);
      console.log(`💾 ${newEntries.length} Einträge erfolgreich gespeichert`);
    }

    // 9. Alle Einträge des Jahres laden
    const allEntries = await this.repository.getEntriesInRange(userID, yearData.yearStartStr, yearData.yearEndStr);

    console.log(`✅ GenerateYearlyCommand abgeschlossen`);

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
    let workdays = 0;
    let weekends = 0;
    let holidays = 0;

    for (const entry of entries) {
      switch (entry.entryType_code) {
        case 'W': // Work
          workdays++;
          break;
        case 'O': // Off (Weekend)
          weekends++;
          break;
        case 'H': // Holiday
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
