import { TimeEntry } from '#cds-models/TrackService';
import { GenerateMonthlyCommand, GenerateYearlyCommand } from '../commands';
import { logger } from '../utils';

/**
 * Handler für TimeEntry-Generierung
 *
 * Verwaltet die Bulk-Generierung von TimeEntries für Monate und Jahre.
 */
export class GenerationHandlers {
  constructor(
    private generateMonthlyCommand: GenerateMonthlyCommand,
    private generateYearlyCommand: GenerateYearlyCommand,
  ) {}

  /**
   * Handler: Monatliche TimeEntries generieren (Action)
   *
   * Generiert automatisch TimeEntries für einen kompletten Monat
   * basierend auf Arbeitstagen und Wochenenden.
   */
  async handleGenerateMonthly(req: any): Promise<TimeEntry[]> {
    try {
      logger.handlerInvoked('Generation', 'generateMonthly', req.data);

      const result = await this.generateMonthlyCommand.execute(req);

      req.info(
        `✅ ${result.stats.generated} neue Einträge generiert. ` + `Gesamt: ${result.stats.total} Einträge im Monat.`,
      );

      return result.allEntries;
    } catch (error: any) {
      logger.error('Error in generateMonthly handler', error, { action: 'generateMonthly' });
      req.reject(500, `Fehler: ${error.message}`);
      return [];
    }
  }

  /**
   * Handler: Jährliche TimeEntries generieren (Action)
   *
   * Generiert automatisch TimeEntries für ein komplettes Jahr
   * inkl. Feiertage und bundeslandspezifischer Regelungen.
   */
  async handleGenerateYearly(req: any): Promise<TimeEntry[]> {
    try {
      logger.handlerInvoked('Generation', 'generateYearly', req.data);

      // Parameter aus Request extrahieren
      const year = req.data.year;
      const stateCode = req.data.stateCode;

      const result = await this.generateYearlyCommand.execute(req, year, stateCode);

      req.info(
        `✅ ${result.stats.generated} neue Einträge generiert ` +
          `(${result.stats.workdays} Arbeitstage, ` +
          `${result.stats.weekends} Wochenenden, ` +
          `${result.stats.holidays} Feiertage). ` +
          `Gesamt: ${result.stats.total} Einträge.`,
      );

      return result.allEntries;
    } catch (error: any) {
      logger.error('Error in generateYearly handler', error, { action: 'generateYearly', data: req.data });
      req.reject(500, `Fehler: ${error.message}`);
      return [];
    }
  }
}
