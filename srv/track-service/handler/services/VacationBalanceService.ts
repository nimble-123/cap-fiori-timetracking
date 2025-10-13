import { Transaction } from '@sap/cds';
import { TimeEntryRepository } from '../repositories';
import { UserRepository } from '../repositories';
import { logger } from '../utils';

export interface VacationBalance {
  year: number;
  totalDays: number;
  takenDays: number;
  remainingDays: number;
  balanceCriticality: number;
}

/**
 * Service für Urlaubssaldo-Berechnungen
 * Berechnet Urlaubstage basierend auf User-Einstellungen und TimeEntries
 */
export class VacationBalanceService {
  constructor(
    private timeEntryRepo: TimeEntryRepository,
    private userRepo: UserRepository,
  ) {}

  /**
   * Berechnet Urlaubssaldo für ein Jahr
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param year - Jahr
   * @returns VacationBalance
   */
  async getVacationBalanceForYear(tx: Transaction, userId: string, year: number): Promise<VacationBalance> {
    logger.serviceCall('VacationBalance', 'Calculating vacation balance', { userId, year });

    // 1. User holen → annualVacationDays
    const user = await this.userRepo.findById(tx, userId);
    if (!user) {
      logger.validationWarning('VacationBalance', `User ${userId} not found`);
      throw new Error(`User ${userId} not found`);
    }

    const totalDays = user.annualVacationDays || 30.0;
    logger.calculationResult('VacationBalance', 'User annual vacation days loaded', {
      userId,
      totalDays,
    });

    // 2. Alle Urlaubstage im Jahr zählen (EntryType = 'V')
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const vacationEntries = await this.timeEntryRepo.findByUserAndDateRangeAndType(tx, userId, startDate, endDate, 'V');

    // Annahme: 1 TimeEntry = 1 Urlaubstag (unabhängig von Stunden)
    const takenDays = vacationEntries.length;
    const remainingDays = totalDays - takenDays;

    // Criticality
    let criticality = 0; // neutral
    if (remainingDays < 5) {
      criticality = 1; // wenig übrig → rot
    } else if (remainingDays < 10) {
      criticality = 2; // mittel → gelb
    } else {
      criticality = 3; // viel übrig → grün
    }

    const balance: VacationBalance = {
      year,
      totalDays,
      takenDays,
      remainingDays,
      balanceCriticality: criticality,
    };

    logger.calculationResult('VacationBalance', 'Vacation balance calculated', balance);
    return balance;
  }
}
