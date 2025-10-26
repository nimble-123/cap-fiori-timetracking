import { TimeEntry, User } from '#cds-models/TrackService';
import { MonthlyGenerationStrategy } from '../../strategies/index.js';
import { TimeEntryRepository } from '../../repositories/index.js';
import { UserService } from '../../services/index.js';
import { GenerationValidator } from '../../validators/index.js';
import { DateUtils, logger } from '../../utils/index.js';

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
    logger.commandStart('GenerateMonthly');

    // 1. User auflösen und validieren
    const { userID, user } = await this.userService.resolveUserForGeneration(req);
    this.validator.validateUser(user, userID);

    logger.commandData('GenerateMonthly', 'User validated', { userID });

    // 2. Monatsdaten ermitteln (aktueller Monat)
    const monthData = DateUtils.getCurrentMonthData();
    logger.commandData('GenerateMonthly', 'Month period calculated', {
      start: monthData.monthStartStr,
      end: monthData.monthEndStr,
    });

    // 3. Existierende Einträge laden
    const existingDates = await this.repository.getExistingDatesInRange(
      userID,
      monthData.monthStartStr,
      monthData.monthEndStr,
    );

    logger.commandData('GenerateMonthly', 'Existing entries loaded', { count: existingDates.size });

    // 4. Fehlende Einträge generieren
    const newEntries = this.strategy.generateMissingEntries(userID, user, existingDates);

    logger.commandData('GenerateMonthly', 'New entries generated', { count: newEntries.length });

    // 5. Validierung der generierten Einträge
    this.validator.validateGeneratedEntries(newEntries);

    // 6. Batch-Insert (nur wenn neue Einträge vorhanden)
    if (newEntries.length > 0) {
      await this.repository.insertBatch(newEntries);
      logger.commandData('GenerateMonthly', 'Entries persisted', { count: newEntries.length });
    }

    // 7. Alle Einträge des Monats laden
    const allEntries = await this.repository.getEntriesInRange(userID, monthData.monthStartStr, monthData.monthEndStr);

    // 8. Stats zusammenstellen
    const stats = {
      generated: newEntries.length,
      existing: existingDates.size,
      total: allEntries.length,
    };

    logger.commandEnd('GenerateMonthly', stats);

    return {
      newEntries,
      allEntries,
      stats,
    };
  }
}
