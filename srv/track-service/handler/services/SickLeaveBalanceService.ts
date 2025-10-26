import { Transaction } from '@sap/cds';
import { TimeEntryRepository } from '../repositories/index.js';
import { CustomizingService } from './CustomizingService.js';
import { logger } from '../utils/index.js';

export interface SickLeaveBalance {
  year: number;
  totalDays: number;
  criticality: number;
}

/**
 * Service für Krankheitssaldo-Berechnungen
 * Zählt Krankheitstage basierend auf TimeEntries
 */
export class SickLeaveBalanceService {
  constructor(
    private timeEntryRepo: TimeEntryRepository,
    private customizingService: CustomizingService,
  ) {}

  /**
   * Berechnet Krankheitssaldo für ein Jahr
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param year - Jahr
   * @returns SickLeaveBalance
   */
  async getSickLeaveBalanceForYear(tx: Transaction, userId: string, year: number): Promise<SickLeaveBalance> {
    logger.serviceCall('SickLeaveBalance', 'Calculating sick leave balance', { userId, year });

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Alle Krankheitstage zählen (EntryType = 'S')
    const sickEntries = await this.timeEntryRepo.findByUserAndDateRangeAndType(tx, userId, startDate, endDate, 'S');

    const totalDays = sickEntries.length;

    const sickLeaveSettings = this.customizingService.getSickLeaveSettings();

    // Criticality
    let criticality = 0; // ok
    if (totalDays > sickLeaveSettings.criticalDays) {
      criticality = 2; // sehr viel → rot
    } else if (totalDays > sickLeaveSettings.warningDays) {
      criticality = 1; // viel → gelb
    }

    const balance: SickLeaveBalance = {
      year,
      totalDays,
      criticality,
    };

    logger.calculationResult('SickLeaveBalance', 'Sick leave balance calculated', balance);
    return balance;
  }
}
