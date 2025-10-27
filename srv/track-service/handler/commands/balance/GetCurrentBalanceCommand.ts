import { Transaction } from '@sap/cds';
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
 * Command für das Abrufen des aktuellen kumulierten Gesamtsaldos
 *
 * Workflow:
 * 1. User validieren
 * 2. Kumulierten Saldo vom BalanceService berechnen lassen
 * 3. Status ermitteln
 * 4. Formatiertes Ergebnis zurückgeben
 */
export class GetCurrentBalanceCommand {
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
   * Führt Gesamtsaldo-Abfrage aus
   * @param req - Request Objekt (für User-Identifikation)
   * @param tx - Transaction Objekt
   * @returns Kumulierter Gesamtsaldo in Stunden
   */
  async execute(req: any, tx: Transaction): Promise<number> {
    logger.commandStart('GetCurrentBalance');

    // 1. User auflösen
    const { userID } = await this.userService.resolveUserForGeneration(req);
    logger.commandData('GetCurrentBalance', 'User resolved', { userID });

    // 2. Kumulierten Saldo berechnen
    const balance = await this.balanceService.getCurrentCumulativeBalance(tx, userID);

    // 3. Status ermitteln
    const statusInfo = this.getBalanceStatus(balance);

    // 4. Info-Message für User
    req.info(
      `${statusInfo.emoji} Ihr aktueller Gesamtsaldo beträgt ${statusInfo.formattedBalance} (Status: ${statusInfo.status})`,
    );

    logger.commandEnd('GetCurrentBalance', { balance, status: statusInfo.status });

    return balance;
  }

  /**
   * Ermittelt Status und Emoji basierend auf Balance-Wert
   * @param balanceValue - Saldo in Stunden
   * @returns Status-Informationen
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
