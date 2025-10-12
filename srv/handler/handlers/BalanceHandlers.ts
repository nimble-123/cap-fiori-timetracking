import cds from '@sap/cds';
import {
  GetMonthlyBalanceCommand,
  GetCurrentBalanceCommand,
  GetRecentBalancesCommand,
} from '../commands/BalanceCommands';

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
      const year = req.data.year;
      const month = req.data.month;
      const tx = cds.transaction(req) as any;

      const balance = await this.getMonthlyBalanceCommand.execute(req, tx, year, month);

      return balance;
    } catch (error: any) {
      console.error('❌ Fehler in getMonthlyBalance:', error);
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
      const tx = cds.transaction(req) as any;

      const balance = await this.getCurrentBalanceCommand.execute(req, tx);

      return balance;
    } catch (error: any) {
      console.error('❌ Fehler in getCurrentBalance:', error);
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
      const tx = cds.transaction(req) as any;

      // Letzte 6 Monate abrufen
      const balances = await this.getRecentBalancesCommand.execute(req, tx, 6);

      return balances;
    } catch (error: any) {
      console.error('❌ Fehler in handleReadMonthlyBalances:', error);
      req.reject(500, `Fehler: ${error.message}`);
      return [];
    }
  }
}
