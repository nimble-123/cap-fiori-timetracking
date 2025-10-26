import { CustomizingService } from '../services/index.js';
import { logger } from '../utils';

/**
 * Validator für Balance-Operationen
 *
 * Validiert:
 * - Jahr und Monat für Saldo-Abfragen
 * - Anzahl der Monate für Recent-Queries
 * - Plausibilität von Balance-Berechnungen
 */
export class BalanceValidator {
  constructor(private customizingService: CustomizingService) {}

  /**
   * Validiert Jahr für Saldo-Abfrage
   * @param year - Zieljahr
   * @throws Error wenn Jahr ungültig ist
   */
  validateYear(year: number): void {
    const currentYear = new Date().getFullYear();
    const balanceSettings = this.customizingService.getBalanceSettings();
    const minYear = currentYear - balanceSettings.yearPastLimit;
    const maxYear = currentYear + balanceSettings.yearFutureLimit;

    if (year < minYear || year > maxYear) {
      throw new Error(
        `Jahr ${year} liegt außerhalb des erlaubten Bereichs (${minYear}-${maxYear}). Bitte ein Jahr innerhalb der letzten 10 Jahre wählen.`,
      );
    }

    if (!Number.isInteger(year)) {
      throw new Error(`Jahr ${year} ist keine ganze Zahl.`);
    }

    logger.validationSuccess('Year', `Validated: ${year}`, { year });
  }

  /**
   * Validiert Monat (1-12)
   * @param month - Monat als Zahl
   * @throws Error wenn Monat ungültig ist
   */
  validateMonth(month: number): void {
    if (!Number.isInteger(month)) {
      throw new Error(`Monat ${month} ist keine ganze Zahl.`);
    }

    if (month < 1 || month > 12) {
      throw new Error(`Monat ${month} ist ungültig. Erlaubter Bereich: 1-12`);
    }

    logger.validationSuccess('Month', `Validated: ${month}`, { month });
  }

  /**
   * Validiert Anzahl der Monate für Recent-Queries
   * @param monthsCount - Anzahl der Monate
   * @throws Error wenn Anzahl ungültig ist
   */
  validateMonthsCount(monthsCount: number): void {
    if (!Number.isInteger(monthsCount)) {
      throw new Error(`Monats-Anzahl ${monthsCount} ist keine ganze Zahl.`);
    }

    if (monthsCount < 1) {
      throw new Error(`Monats-Anzahl ${monthsCount} muss mindestens 1 sein.`);
    }

    const balanceSettings = this.customizingService.getBalanceSettings();
    if (monthsCount > balanceSettings.maxMonths) {
      throw new Error(
        `Monats-Anzahl ${monthsCount} ist zu groß. Maximum: ${balanceSettings.maxMonths} Monate. Bitte kleineren Zeitraum wählen.`,
      );
    }

    logger.validationSuccess('MonthsCount', `Validated: ${monthsCount}`, { monthsCount });
  }

  /**
   * Validiert Jahr-Monat-Kombination
   * @param year - Jahr
   * @param month - Monat
   * @throws Error wenn Kombination ungültig ist
   */
  validateYearMonth(year: number, month: number): void {
    this.validateYear(year);
    this.validateMonth(month);

    // Zusätzliche Prüfung: Datum nicht zu weit in der Zukunft
    const targetDate = new Date(year, month - 1, 1);
    const now = new Date();
    const balanceSettings = this.customizingService.getBalanceSettings();
    const futureLimit = new Date(now.getFullYear(), now.getMonth() + balanceSettings.futureMonthBuffer, 1);

    if (targetDate > futureLimit) {
      throw new Error(
        `Datum ${year}-${String(month).padStart(2, '0')} liegt zu weit in der Zukunft. Saldo-Abfrage ist nur bis ${futureLimit.getFullYear()}-${String(futureLimit.getMonth() + 1).padStart(2, '0')} möglich.`,
      );
    }

    logger.validationSuccess('YearMonth', `Validated: ${year}-${String(month).padStart(2, '0')}`, { year, month });
  }

  /**
   * Validiert Balance-Wert auf Plausibilität
   * @param balance - Balance in Stunden
   * @param context - Kontext für Fehlermeldung (z.B. "Monatssaldo", "Gesamtsaldo")
   * @throws Error bei extremen Werten (wahrscheinlich Berechnungsfehler)
   */
  validateBalanceValue(balance: number, context: string = 'Balance'): void {
    if (!Number.isFinite(balance)) {
      throw new Error(`${context} ist keine gültige Zahl: ${balance}`);
    }

    // Plausibilitätsprüfung: Werte über 500h oder unter -500h sind unrealistisch
    const balanceSettings = this.customizingService.getBalanceSettings();
    const MAX_REALISTIC_HOURS = balanceSettings.maxHoursAbsolute;

    if (Math.abs(balance) > MAX_REALISTIC_HOURS) {
      logger.validationWarning(
        'Balance',
        `${context} is extremely high: ${balance}h. Could indicate calculation error.`,
        { balance, context },
      );
      // Kein throw, nur Warning - könnte bei langjährigen Daten vorkommen
    }

    logger.validationSuccess('Balance', `${context} validated: ${balance}h`, { balance, context });
  }

  /**
   * Validiert, ob Arbeitstage-Anzahl plausibel ist
   * @param workingDays - Anzahl Arbeitstage
   * @param context - Kontext (z.B. "Januar 2025")
   * @throws Error bei unrealistischen Werten
   */
  validateWorkingDays(workingDays: number, context: string = 'Monat'): void {
    if (!Number.isInteger(workingDays)) {
      throw new Error(`Arbeitstage-Anzahl ${workingDays} ist keine ganze Zahl.`);
    }

    if (workingDays < 0) {
      throw new Error(`Arbeitstage-Anzahl ${workingDays} darf nicht negativ sein.`);
    }

    const balanceSettings = this.customizingService.getBalanceSettings();

    if (workingDays > balanceSettings.maxWorkingDaysPerMonth) {
      logger.validationWarning(
        'WorkingDays',
        `${workingDays} working days for ${context} is unusually high. Normally max ${balanceSettings.maxWorkingDaysPerMonth}/month.`,
        { workingDays, context },
      );
    }

    logger.validationSuccess('WorkingDays', `Validated ${workingDays} for ${context}`, { workingDays, context });
  }
}
