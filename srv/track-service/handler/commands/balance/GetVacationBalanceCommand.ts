import { Transaction } from '@sap/cds';
import type { VacationBalance } from '#cds-models/TrackService';
import { VacationBalanceService, UserService } from '../../services/index.js';
import { logger } from '../../utils/index.js';

// Type definitions
interface VacationBalanceDependencies {
  vacationBalanceService: VacationBalanceService;
  userService: UserService;
}

/**
 * Command für das Abrufen des Urlaubssaldos
 *
 * Workflow:
 * 1. User validieren
 * 2. Aktuelles Jahr ermitteln
 * 3. Urlaubssaldo vom VacationBalanceService berechnen lassen
 * 4. Formatiertes Ergebnis zurückgeben
 */
export class GetVacationBalanceCommand {
  private vacationBalanceService: VacationBalanceService;
  private userService: UserService;

  constructor(dependencies: VacationBalanceDependencies) {
    this.vacationBalanceService = dependencies.vacationBalanceService;
    this.userService = dependencies.userService;
  }

  /**
   * Führt Urlaubssaldo-Abfrage aus
   * @param req - Request Objekt (für User-Identifikation)
   * @param tx - Transaction Objekt
   * @returns Urlaubssaldo
   */
  async execute(req: any, tx: Transaction): Promise<VacationBalance> {
    logger.commandStart('GetVacationBalance');

    // 1. User auflösen
    const { userID, user } = await this.userService.resolveUserForGeneration(req);
    logger.commandData('GetVacationBalance', 'User resolved', { userID, name: user.name });

    // 2. Aktuelles Jahr
    const currentYear = new Date().getFullYear();
    logger.commandData('GetVacationBalance', 'Using current year', { year: currentYear });

    // 3. Urlaubssaldo berechnen
    const balance = await this.vacationBalanceService.getVacationBalanceForYear(tx, userID, currentYear);

    // 4. Status-Info
    const statusEmoji = this.getStatusEmoji(balance.balanceCriticality);

    req.info(
      `${statusEmoji} Urlaubssaldo ${balance.year}: ${balance.remainingDays} von ${balance.totalDays} Tagen übrig (${balance.takenDays} genommen)`,
    );

    logger.commandEnd('GetVacationBalance', {
      year: balance.year,
      totalDays: balance.totalDays,
      takenDays: balance.takenDays,
      remainingDays: balance.remainingDays,
    });

    return balance;
  }

  /**
   * Hilfsmethode für Status-Emoji
   */
  private getStatusEmoji(criticality: number): string {
    switch (criticality) {
      case 3:
        return '✅'; // Viel übrig
      case 2:
        return '⚠️'; // Mittel
      case 1:
        return '❌'; // Wenig übrig
      default:
        return 'ℹ️';
    }
  }
}
