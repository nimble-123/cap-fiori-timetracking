import { Request } from '@sap/cds';
import { UserService } from '../../services';
import { DateUtils, logger } from '../../utils';

/**
 * Command: Liefert Default-Parameter für generateYearlyTimeEntries Action
 *
 * Business Logic:
 * - Aktuelles Jahr als Default für 'year' (via DateUtils)
 * - stateCode wird auf null gesetzt (User muss Bundesland explizit wählen)
 *
 * Optional (zukünftig):
 * - stateCode könnte aus User-Profil geladen werden
 */
export class GetDefaultParamsCommand {
  constructor(private userService: UserService) {}

  /**
   * Führt das Command aus und liefert Default-Werte für die Action
   *
   * @param req - CAP Request-Objekt
   * @returns Promise mit year und stateCode
   */
  async execute(req: Request): Promise<{ year: number; stateCode: string | null }> {
    logger.commandStart('GetDefaultParamsCommand');

    try {
      // Aktuelles Jahr via DateUtils ermitteln
      const yearData = DateUtils.getYearData();
      const currentYear = yearData.year;

      logger.debug('Default year calculated', {
        command: 'GetDefaultParamsCommand',
        year: currentYear,
        isLeapYear: DateUtils.isLeapYear(currentYear),
        daysInYear: yearData.daysInYear,
      });

      // TODO: Optional - stateCode aus User-Profil laden
      // const userResult = await this.userService.resolveUserForGeneration(req);
      // const preferredStateCode = userResult.user.preferredState ?? null;

      const result = {
        year: currentYear,
        stateCode: null, // User muss Bundesland explizit wählen
      };

      logger.commandEnd('GetDefaultParamsCommand', result);

      return result;
    } catch (error: any) {
      logger.error('Error in GetDefaultParamsCommand', error, {
        command: 'GetDefaultParamsCommand',
      });

      // Fallback: Aktuelles Jahr ohne UserService
      const fallbackYear = new Date().getFullYear();
      logger.warn('Falling back to basic year calculation', {
        fallbackYear,
      });

      return {
        year: fallbackYear,
        stateCode: null,
      };
    }
  }
}
