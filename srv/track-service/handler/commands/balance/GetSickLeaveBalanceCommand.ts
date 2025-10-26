import { Transaction } from '@sap/cds';
import type { SickLeaveBalance } from '#cds-models/TrackService';
import { SickLeaveBalanceService, UserService } from '../../services/index.js';
import { logger } from '../../utils/index.js';

// Type definitions
interface SickLeaveBalanceDependencies {
  sickLeaveBalanceService: SickLeaveBalanceService;
  userService: UserService;
}

/**
 * Command für das Abrufen des Krankheitssaldos
 *
 * Workflow:
 * 1. User validieren
 * 2. Aktuelles Jahr ermitteln
 * 3. Krankheitssaldo vom SickLeaveBalanceService berechnen lassen
 * 4. Formatiertes Ergebnis zurückgeben
 */
export class GetSickLeaveBalanceCommand {
  private sickLeaveBalanceService: SickLeaveBalanceService;
  private userService: UserService;

  constructor(dependencies: SickLeaveBalanceDependencies) {
    this.sickLeaveBalanceService = dependencies.sickLeaveBalanceService;
    this.userService = dependencies.userService;
  }

  /**
   * Führt Krankheitssaldo-Abfrage aus
   * @param req - Request Objekt (für User-Identifikation)
   * @param tx - Transaction Objekt
   * @returns Krankheitssaldo
   */
  async execute(req: any, tx: Transaction): Promise<SickLeaveBalance> {
    logger.commandStart('GetSickLeaveBalance');

    // 1. User auflösen
    const { userID, user } = await this.userService.resolveUserForGeneration(req);
    logger.commandData('GetSickLeaveBalance', 'User resolved', { userID, name: user.name });

    // 2. Aktuelles Jahr
    const currentYear = new Date().getFullYear();
    logger.commandData('GetSickLeaveBalance', 'Using current year', { year: currentYear });

    // 3. Krankheitssaldo berechnen
    const balance = await this.sickLeaveBalanceService.getSickLeaveBalanceForYear(tx, userID, currentYear);

    // 4. Status-Info
    const statusEmoji = this.getStatusEmoji(balance.criticality);

    req.info(`${statusEmoji} Krankheitssaldo ${balance.year}: ${balance.totalDays} Tage`);

    logger.commandEnd('GetSickLeaveBalance', {
      year: balance.year,
      totalDays: balance.totalDays,
      criticality: balance.criticality,
    });

    return balance;
  }

  /**
   * Hilfsmethode für Status-Emoji
   */
  private getStatusEmoji(criticality: number): string {
    switch (criticality) {
      case 0:
        return '✅'; // OK
      case 1:
        return '⚠️'; // Viel
      case 2:
        return '❌'; // Sehr viel
      default:
        return 'ℹ️';
    }
  }
}
