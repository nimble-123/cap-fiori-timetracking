import { TimeEntry, User } from '#cds-models/TrackService';
import { MonthlyGenerationStrategy } from '../../strategies';
import { TimeEntryRepository } from '../../repositories';
import { UserService } from '../../services';
import { GenerationValidator } from '../../validators';
import { DateUtils } from '../../utils';

// Type definitions
interface GenerationDependencies {
  userService: UserService;
  validator: GenerationValidator;
  repository: TimeEntryRepository;
  monthlyStrategy: MonthlyGenerationStrategy;
  yearlyStrategy: any; // Not used in this command
}

export interface MonthlyGenerationResult {
  newEntries: TimeEntry[];
  allEntries: TimeEntry[];
  stats: {
    generated: number;
    existing: number;
    total: number;
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
    const monthData = DateUtils.getCurrentMonthData();
    console.log(`📅 Monat: ${monthData.monthStartStr} bis ${monthData.monthEndStr}`);

    // 3. Existierende Einträge laden
    const existingDates = await this.repository.getExistingDatesInRange(
      userID,
      monthData.monthStartStr,
      monthData.monthEndStr,
    );

    console.log(`📊 ${existingDates.size} existierende Einträge gefunden`);

    // 4. Fehlende Einträge generieren
    const newEntries = this.strategy.generateMissingEntries(userID, user, existingDates);

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
