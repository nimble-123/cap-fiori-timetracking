import { Request } from '@sap/cds';
import { UserService } from '../../services';
import { DateUtils, logger } from '../../utils';

/**
 * Command: Liefert Default-Parameter für generateYearlyTimeEntries Action
 *
 * Business Logic:
 * - Aktuelles Jahr als Default für 'year' (via DateUtils)
 * - stateCode aus User-Profil (preferredState)
 * - Fallback: null wenn User kein preferredState hat
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

      // User laden mit preferredState
      const userResult = await this.userService.resolveUserForGeneration(req);
      const user = userResult.user;

      // PreferredState aus User-Profil extrahieren
      const preferredStateCode = this.extractPreferredState(user);

      logger.debug('Default params calculated', {
        command: 'GetDefaultParamsCommand',
        year: currentYear,
        stateCode: preferredStateCode,
        userId: userResult.userID,
        isLeapYear: DateUtils.isLeapYear(currentYear),
        daysInYear: yearData.daysInYear,
      });

      const result = {
        year: currentYear,
        stateCode: preferredStateCode,
      };

      logger.commandEnd('GetDefaultParamsCommand', result);

      return result;
    } catch (error: any) {
      logger.error('Error in GetDefaultParamsCommand', error, {
        command: 'GetDefaultParamsCommand',
      });

      // Fallback: Aktuelles Jahr ohne StateCode
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

  /**
   * Extrahiert preferredState Code aus User-Objekt
   * Unterstützt verschiedene Strukturen (expanded/collapsed)
   *
   * @param user - User-Objekt
   * @returns State Code oder null
   */
  private extractPreferredState(user: any): string | null {
    // Fall 1: preferredState ist expanded (mit vollständigem Objekt)
    if (user.preferredState && typeof user.preferredState === 'object') {
      return user.preferredState.code ?? null;
    }

    // Fall 2: preferredState_code ist direkt gesetzt
    if (user.preferredState_code) {
      return user.preferredState_code;
    }

    // Fall 3: Kein preferredState gesetzt
    logger.debug('No preferredState found for user', {
      userId: user.ID,
    });
    return null;
  }
}
