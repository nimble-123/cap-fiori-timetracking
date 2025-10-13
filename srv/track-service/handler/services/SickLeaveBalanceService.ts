import { Transaction } from '@sap/cds';
import { TimeEntryRepository } from '../repositories';
import { logger } from '../utils';

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
  constructor(private timeEntryRepo: TimeEntryRepository) {}

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

    // Criticality
    let criticality = 0; // ok
    if (totalDays > 30) {
      criticality = 2; // sehr viel → rot
    } else if (totalDays > 10) {
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
