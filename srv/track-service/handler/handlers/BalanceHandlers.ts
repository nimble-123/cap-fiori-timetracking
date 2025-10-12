import cds from '@sap/cds';
import { GetMonthlyBalanceCommand, GetCurrentBalanceCommand, GetRecentBalancesCommand } from '../commands';
import { logger } from '../utils';

/**
 * Handler für Zeitkonto-Balance-Operationen
 *
 * Verwaltet Abfragen und Berechnungen von Zeitkonto-Salden.
 */
export class BalanceHandlers {
  constructor(
    private getMonthlyBalanceCommand: GetMonthlyBalanceCommand,
    private getCurrentBalanceCommand: GetCurrentBalanceCommand,
    private getRecentBalancesCommand: GetRecentBalancesCommand,
  ) {}

  /**
   * Handler: Monatliche Balance abrufen (Action)
   *
   * Berechnet den Zeitkonto-Saldo für einen bestimmten Monat.
   */
  async handleGetMonthlyBalance(req: any): Promise<any> {
    try {
      logger.handlerInvoked('Balance', 'getMonthlyBalance', req.data);

      const year = req.data.year;
      const month = req.data.month;
      const tx = cds.transaction(req) as any;

      const balance = await this.getMonthlyBalanceCommand.execute(req, tx, year, month);

      logger.handlerCompleted('Balance', 'getMonthlyBalance', { year, month, balanceHours: balance.balanceHours });
      return balance;
    } catch (error: any) {
      logger.error('Error in getMonthlyBalance handler', error, { action: 'getMonthlyBalance', data: req.data });
      req.reject(500, `Fehler: ${error.message}`);
      return null;
    }
  }

  /**
   * Handler: Aktuelle Balance abrufen (Action)
   *
   * Berechnet den aktuellen Zeitkonto-Saldo (Stand heute).
   */
  async handleGetCurrentBalance(req: any): Promise<number> {
    try {
      logger.handlerInvoked('Balance', 'getCurrentBalance', {});

      const tx = cds.transaction(req) as any;

      const balance = await this.getCurrentBalanceCommand.execute(req, tx);

      logger.handlerCompleted('Balance', 'getCurrentBalance', { balance });
      return balance;
    } catch (error: any) {
      logger.error('Error in getCurrentBalance handler', error, { action: 'getCurrentBalance' });
      req.reject(500, `Fehler: ${error.message}`);
      return 0;
    }
  }

  /**
   * Handler: Letzte Monats-Balances abrufen (READ MonthlyBalances)
   *
   * Liefert die Zeitkonto-Salden der letzten 6 Monate.
   */
  async handleReadMonthlyBalances(req: any): Promise<any[]> {
    try {
      logger.handlerInvoked('Balance', 'readMonthlyBalances', { monthsCount: 6 });

      const tx = cds.transaction(req) as any;

      // Letzte 6 Monate abrufen
      const balances = await this.getRecentBalancesCommand.execute(req, tx, 6);

      logger.handlerCompleted('Balance', 'readMonthlyBalances', { balancesCount: balances.length });
      return balances;
    } catch (error: any) {
      logger.error('Error in handleReadMonthlyBalances handler', error, { action: 'readMonthlyBalances' });
      req.reject(500, `Fehler: ${error.message}`);
      return [];
    }
  }
}
