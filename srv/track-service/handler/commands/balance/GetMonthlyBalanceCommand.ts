import { Transaction } from '@sap/cds';
import type { MonthlyBalance } from '#cds-models/TrackService';
import { TimeBalanceService, UserService } from '../../services';
import { CustomizingService } from '../../services/CustomizingService';
import { BalanceValidator } from '../../validators';
import { logger } from '../../utils';

// Type definitions
interface BalanceDependencies {
  balanceService: TimeBalanceService;
  userService: UserService;
  validator: BalanceValidator;
  customizingService: CustomizingService;
}

interface BalanceStatusInfo {
  emoji: string;
  status: string;
  formattedBalance: string;
}

/**
 * Command für das Abrufen eines monatlichen Saldos
 *
 * Workflow:
 * 1. User validieren
 * 2. Jahr und Monat validieren
 * 3. Saldo vom BalanceService berechnen lassen
 * 4. Status ermitteln (Positiv/Negativ/Kritisch)
 * 5. Formatiertes Ergebnis zurückgeben
 */
export class GetMonthlyBalanceCommand {
  private balanceService: TimeBalanceService;
  private userService: UserService;
  private validator: BalanceValidator;
  private customizingService: CustomizingService;

  constructor(dependencies: BalanceDependencies) {
    this.balanceService = dependencies.balanceService;
    this.userService = dependencies.userService;
    this.validator = dependencies.validator;
    this.customizingService = dependencies.customizingService;
  }

  /**
   * Führt Monatssaldo-Abfrage aus
   * @param req - Request Objekt (für User-Identifikation)
   * @param tx - Transaction Objekt
   * @param year - Zieljahr (optional, default: aktuelles Jahr)
   * @param month - Zielmonat (optional, default: aktueller Monat)
   * @returns Monatssaldo mit Criticality
   */
  async execute(req: any, tx: Transaction, year?: number, month?: number): Promise<MonthlyBalance> {
    logger.commandStart('GetMonthlyBalance');

    // 1. Jahr und Monat mit Defaults
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;

    // 2. Validierung
    this.validator.validateYear(targetYear);
    this.validator.validateMonth(targetMonth);

    logger.commandData('GetMonthlyBalance', 'Period validated', {
      year: targetYear,
      month: targetMonth,
    });

    // 3. User auflösen
    const { userID } = await this.userService.resolveUserForGeneration(req);
    logger.commandData('GetMonthlyBalance', 'User resolved', { userID });

    // 4. Saldo vom Service berechnen lassen
    const balance = await this.balanceService.getMonthBalance(tx, userID, targetYear, targetMonth);

    // 5. Status ermitteln
    const balanceValue = balance.balanceHours ?? 0;
    const statusInfo = this.getBalanceStatus(balanceValue);

    // 6. Info-Message für User
    req.info(
      `${statusInfo.emoji} Monatssaldo ${targetYear}-${String(targetMonth).padStart(2, '0')}: ${statusInfo.formattedBalance} bei ${balance.workingDays ?? 0} Arbeitstagen (Status: ${statusInfo.status})`,
    );

    logger.commandEnd('GetMonthlyBalance', {
      balance: balance.balanceHours,
      workingDays: balance.workingDays,
      status: statusInfo.status,
    });

    return balance;
  }

  /**
   * Ermittelt Status und Emoji basierend auf Balance-Wert
   * @param balanceValue - Saldo in Stunden (positiv = Überstunden, negativ = Unterstunden)
   * @returns Status-Informationen mit Emoji und formatiertem Text
   */
  private getBalanceStatus(balanceValue: number): BalanceStatusInfo {
    const { undertimeCriticalHours } = this.customizingService.getBalanceSettings();
    const undertimeLimit = -Math.abs(undertimeCriticalHours);

    let emoji = '🔵';
    let status = 'Neutral';

    if (balanceValue > 0) {
      emoji = '💚';
      status = 'Positiv';
    } else if (balanceValue < undertimeLimit) {
      emoji = '🔴';
      status = 'Kritisch';
    } else if (balanceValue < 0) {
      emoji = '🟡';
      status = 'Negativ';
    }

    const formattedBalance = balanceValue > 0 ? `+${balanceValue}h` : `${balanceValue}h`;

    return { emoji, status, formattedBalance };
  }
}
