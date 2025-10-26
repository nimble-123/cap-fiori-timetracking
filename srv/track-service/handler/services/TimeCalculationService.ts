import { logger } from '../utils/index.js';

/**
 * Service für Zeitberechnungen
 * Alle zeitbezogenen Berechnungen und Konvertierungen
 */

interface WorkingHoursResult {
  grossMinutes?: number;
  breakMinutes?: number;
  netMinutes?: number;
  netHours?: number;
  error?: string;
}

interface OvertimeUndertimeResult {
  overtime: number;
  undertime: number;
}

export class TimeCalculationService {
  /**
   * Konvertiert Zeitstring (HH:MM:SS) in Minuten
   * @param timeString - Zeit im Format "HH:MM:SS" oder "HH:MM"
   * @returns Minuten als Zahl
   */
  static timeToMinutes(timeString: string | null | undefined): number {
    if (!timeString) return 0;
    const [hours, minutes, seconds = '0'] = String(timeString).split(':');
    return Number(hours) * 60 + Number(minutes) + Math.floor(Number(seconds) / 60);
  }

  /**
   * Rundet auf 2 Dezimalstellen
   * @param value - Zu rundender Wert
   * @returns Gerundeter Wert
   */
  static roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Berechnet Arbeitszeiten basierend auf Start-/Endzeit und Pause
   * @param startTime - Startzeit
   * @param endTime - Endzeit
   * @param breakMinutes - Pausenzeit in Minuten
   * @returns Berechnungsergebnis mit Zeiten oder Fehler
   */
  static calculateWorkingHours(startTime: string, endTime: string, breakMinutes: number = 0): WorkingHoursResult {
    const grossMinutes = this.timeToMinutes(endTime) - this.timeToMinutes(startTime);

    if (grossMinutes <= 0) {
      logger.calculationResult('WorkingHours', 'Invalid time range (end before start)', { startTime, endTime });
      return {
        error: 'Endzeit muss nach Startzeit liegen (gleicher Tag).',
      };
    }

    const breakMin = Math.max(0, Number(breakMinutes));

    if (breakMin > grossMinutes) {
      logger.calculationResult('WorkingHours', 'Break longer than gross time', { breakMin, grossMinutes });
      return {
        error: 'Pause darf nicht länger als Bruttozeit sein.',
      };
    }

    const netMinutes = grossMinutes - breakMin;
    const netHours = this.roundToTwoDecimals(netMinutes / 60);

    logger.calculationResult('WorkingHours', 'Working hours calculated', {
      startTime,
      endTime,
      breakMin,
      netHours,
    });

    return {
      grossMinutes,
      breakMinutes: breakMin,
      netMinutes,
      netHours,
    };
  }

  /**
   * Berechnet Über- und Unterstunden basierend auf Ist- und Soll-Arbeitszeit
   * @param actualHours - Tatsächlich gearbeitete Stunden
   * @param expectedHours - Erwartete Arbeitszeit
   * @returns Über- und Unterstunden
   */
  static calculateOvertimeAndUndertime(actualHours: number, expectedHours: number): OvertimeUndertimeResult {
    const overtime = Math.max(0, this.roundToTwoDecimals(actualHours - expectedHours));
    const undertime = Math.max(0, this.roundToTwoDecimals(expectedHours - actualHours));

    return { overtime, undertime };
  }
}

export default TimeCalculationService;
