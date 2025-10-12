import { Transaction } from '@sap/cds';
import type { MonthlyBalance } from '#cds-models/TrackService';
import { TimeBalanceService, UserService } from '../../services';
import { BalanceValidator } from '../../validators';

// Type definitions
interface BalanceDependencies {
  balanceService: TimeBalanceService;
  userService: UserService;
  validator: BalanceValidator;
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

  constructor(dependencies: BalanceDependencies) {
    this.balanceService = dependencies.balanceService;
    this.userService = dependencies.userService;
    this.validator = dependencies.validator;
  }

  /**
   * Führt Abfrage der letzten Monatssalden aus
   * @param req - Request Objekt (für User-Identifikation)
   * @param tx - Transaction Objekt
   * @param monthsCount - Anzahl der Monate (default: 6)
   * @returns Array von Monatssalden
   */
  async execute(req: any, tx: Transaction, monthsCount: number = 6): Promise<MonthlyBalance[]> {
    console.log('📊 GetRecentBalancesCommand.execute() gestartet');

    // 1. Anzahl Monate validieren
    this.validator.validateMonthsCount(monthsCount);

    console.log(`📅 Lade letzte ${monthsCount} Monate`);

    // 2. User auflösen
    const { userID } = await this.userService.resolveUserForGeneration(req);
    console.log(`👤 User: ${userID}`);

    // 3. Salden vom Service berechnen lassen
    const balances = await this.balanceService.getRecentMonthsBalance(tx, userID, monthsCount);

    console.log(`✅ ${balances.length} Monatssalden abgerufen`);

    return balances;
  }
}
