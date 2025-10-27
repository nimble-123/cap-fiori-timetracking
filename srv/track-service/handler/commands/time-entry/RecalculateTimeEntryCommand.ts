import { Transaction } from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';
import { UserService } from '../../services';
import { TimeEntryRepository } from '../../repositories';
import { TimeEntryFactory } from '../../factories';
import { logger } from '../../utils';
import { CustomizingService } from '../../services/CustomizingService';

// Type definitions
interface Dependencies {
  userService: UserService;
  repository: TimeEntryRepository;
  factory: TimeEntryFactory;
  customizingService: CustomizingService;
}

/**
 * Command für TimeEntry Neuberechnung
 * Berechnet alle Zeitwerte basierend auf aktuellen Start-/Endzeiten und User-Sollstunden
 */
export class RecalculateTimeEntryCommand {
  private userService: UserService;
  private repository: TimeEntryRepository;
  private factory: TimeEntryFactory;
  private customizingService: CustomizingService;

  constructor(dependencies: Dependencies) {
    this.userService = dependencies.userService;
    this.repository = dependencies.repository;
    this.factory = dependencies.factory;
    this.customizingService = dependencies.customizingService;
  }

  /**
   * Führt Neuberechnung aus
   * @param tx - Transaction Objekt
   * @param entryId - TimeEntry ID
   * @returns Aktualisierter TimeEntry
   */
  async execute(tx: Transaction, entryId: string): Promise<TimeEntry> {
    logger.commandStart('RecalculateTimeEntry', { entryId });

    // 1. Entry laden
    const existingEntry = await this.repository.getById(tx, entryId);
    logger.commandData('RecalculateTimeEntry', 'Entry loaded', {
      workDate: existingEntry.workDate,
      entryType: existingEntry.entryType_code,
    });

    const defaults = this.customizingService.getTimeEntryDefaults();
    if (existingEntry.status_code === defaults.statusReleasedCode) {
      const error = new Error('Freigegebene TimeEntries können nicht neu berechnet werden.') as any;
      error.code = 409;
      throw error;
    }

    // 2. Zeitdaten neu berechnen
    let calculatedData;
    const entryType = existingEntry.entryType_code || defaults.workEntryTypeCode;
    const breakMinutes = existingEntry.breakMin ?? defaults.defaultBreakMinutes;

    if (entryType === defaults.workEntryTypeCode || entryType === 'B') {
      // Work/Business Trip: Berechnung mit Start-/Endzeit
      calculatedData = await this.factory.createWorkTimeData(
        this.userService,
        tx,
        existingEntry.user_ID!,
        existingEntry.startTime!,
        existingEntry.endTime!,
        breakMinutes,
      );
    } else {
      // Non-Work (Urlaub, Krankheit, etc.): Sollstunden ohne Über-/Unterzeit
      calculatedData = await this.factory.createNonWorkTimeData(this.userService, tx, existingEntry.user_ID!);
    }

    logger.commandData('RecalculateTimeEntry', 'Values recalculated', {
      net: calculatedData.durationHoursNet,
      expected: calculatedData.expectedDailyHoursDec,
      overtime: calculatedData.overtimeHours,
    });

    // 3. Entry aktualisieren
    const statusUpdateNeeded =
      existingEntry.status_code !== defaults.statusReleasedCode &&
      existingEntry.status_code !== defaults.statusProcessedCode;

    await tx.update('TrackService.TimeEntries', entryId).set({
      durationHoursGross: calculatedData.durationHoursGross,
      durationHoursNet: calculatedData.durationHoursNet,
      expectedDailyHoursDec: calculatedData.expectedDailyHoursDec,
      overtimeHours: calculatedData.overtimeHours,
      undertimeHours: calculatedData.undertimeHours,
      ...(statusUpdateNeeded ? { status_code: defaults.statusProcessedCode } : {}),
    });

    // 4. Aktualisierten Entry laden und zurückgeben
    const updatedEntry = await this.repository.getById(tx, entryId);

    logger.commandEnd('RecalculateTimeEntry', { entryId, success: true });

    return updatedEntry;
  }
}
