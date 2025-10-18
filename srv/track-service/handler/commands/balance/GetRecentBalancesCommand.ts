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

/**
 * Command für das Abrufen der letzten N Monatssalden
 *
 * Workflow:
 * 1. User validieren
 * 2. Anzahl Monate validieren
 * 3. Salden vom BalanceService berechnen lassen
 * 4. Array von Monatssalden zurückgeben
 */
export class GetRecentBalancesCommand {
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
   * Führt Abfrage der letzten Monatssalden aus
   * @param req - Request Objekt (für User-Identifikation)
   * @param tx - Transaction Objekt
   * @param monthsCount - Anzahl der Monate (default: 6)
   * @returns Array von Monatssalden
   */
  async execute(req: any, tx: Transaction, monthsCount?: number): Promise<MonthlyBalance[]> {
    const balanceSettings = this.customizingService.getBalanceSettings();
    const effectiveMonths = monthsCount ?? balanceSettings.recentMonthsDefault;

    logger.commandStart('GetRecentBalances', { monthsCount: effectiveMonths });

    // 1. Anzahl Monate validieren
    this.validator.validateMonthsCount(effectiveMonths);

    logger.commandData('GetRecentBalances', 'Months count validated', { monthsCount: effectiveMonths });

    // 2. User auflösen
    const { userID } = await this.userService.resolveUserForGeneration(req);
    logger.commandData('GetRecentBalances', 'User resolved', { userID });

    // 3. Salden vom Service berechnen lassen
    const balances = await this.balanceService.getRecentMonthsBalance(tx, userID, effectiveMonths);

    logger.commandEnd('GetRecentBalances', { count: balances.length });

    return balances;
  }
}
