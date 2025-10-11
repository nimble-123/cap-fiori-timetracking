/**
 * Service für Zeitberechnungen
 * Alle zeitbezogenen Berechnungen und Konvertierungen
 */
class TimeCalculationService {
  /**
   * Konvertiert Zeitstring (HH:MM:SS) in Minuten
   * @param {string} timeString - Zeit im Format "HH:MM:SS" oder "HH:MM"
   * @returns {number} Minuten als Zahl
   */
  static timeToMinutes(timeString) {
    if (!timeString) return 0;
    const [hours, minutes, seconds = '0'] = String(timeString).split(':');
    return Number(hours) * 60 + Number(minutes) + Math.floor(Number(seconds) / 60);
  }

  /**
   * Rundet auf 2 Dezimalstellen
   * @param {number} value - Zu rundender Wert
   * @returns {number} Gerundeter Wert
   */
  static roundToTwoDecimals(value) {
    return Math.round(value * 100) / 100;
  }

  /**
   * Berechnet Arbeitszeiten basierend auf Start-/Endzeit und Pause
   * @param {string} startTime - Startzeit
   * @param {string} endTime - Endzeit
   * @param {number} breakMinutes - Pausenzeit in Minuten
   * @returns {Object} Berechnungsergebnis mit Zeiten oder Fehler
   */
  static calculateWorkingHours(startTime, endTime, breakMinutes = 0) {
    const grossMinutes = this.timeToMinutes(endTime) - this.timeToMinutes(startTime);

    if (grossMinutes <= 0) {
      return {
        error: 'Endzeit muss nach Startzeit liegen (gleicher Tag).',
      };
    }

    const breakMin = Math.max(0, Number(breakMinutes));

    if (breakMin > grossMinutes) {
      return {
        error: 'Pause darf nicht länger als Bruttozeit sein.',
      };
    }

    const netMinutes = grossMinutes - breakMin;
    const netHours = this.roundToTwoDecimals(netMinutes / 60);

    return {
      grossMinutes,
      breakMinutes: breakMin,
      netMinutes,
      netHours,
    };
  }

  /**
   * Berechnet Über- und Unterstunden basierend auf Ist- und Soll-Arbeitszeit
   * @param {number} actualHours - Tatsächlich gearbeitete Stunden
   * @param {number} expectedHours - Erwartete Arbeitszeit
   * @returns {Object} Über- und Unterstunden
   */
  static calculateOvertimeAndUndertime(actualHours, expectedHours) {
    const overtime = Math.max(0, this.roundToTwoDecimals(actualHours - expectedHours));
    const undertime = Math.max(0, this.roundToTwoDecimals(expectedHours - actualHours));

    return { overtime, undertime };
  }
}

module.exports = TimeCalculationService;
