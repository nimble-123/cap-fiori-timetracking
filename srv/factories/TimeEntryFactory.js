const { randomUUID } = require('crypto');
const TimeCalculationService = require('../services/TimeCalculationService');

/**
 * Factory für TimeEntry Erstellung
 * Zentrale Stelle für die Erzeugung von TimeEntry-Objekten
 */
class TimeEntryFactory {
  /**
   * Erstellt Work-Time Entry Daten
   * @param {Object} userService - UserService Instanz
   * @param {Object} tx - Transaction Objekt
   * @param {string} userId - User ID
   * @param {string} startTime - Startzeit
   * @param {string} endTime - Endzeit
   * @param {number} breakMinutes - Pausenzeit
   * @returns {Promise<Object>} Berechnete Zeitdaten
   */
  static async createWorkTimeData(userService, tx, userId, startTime, endTime, breakMinutes) {
    const workingHours = TimeCalculationService.calculateWorkingHours(startTime, endTime, breakMinutes);

    if (workingHours.error) {
      throw new Error(workingHours.error);
    }

    const expectedDaily = await userService.getExpectedDailyHours(tx, userId);
    const { overtime, undertime } = TimeCalculationService.calculateOvertimeAndUndertime(
      workingHours.netHours,
      expectedDaily,
    );

    return {
      breakMin: workingHours.breakMinutes,
      durationHoursGross: TimeCalculationService.roundToTwoDecimals(workingHours.grossMinutes / 60),
      durationHoursNet: workingHours.netHours,
      overtimeHours: overtime,
      undertimeHours: undertime,
    };
  }

  /**
   * Erstellt Non-Work-Time Entry Daten (Urlaub/Krankheit)
   * @param {Object} userService - UserService Instanz
   * @param {Object} tx - Transaction Objekt
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Standard-Zeitdaten
   */
  static async createNonWorkTimeData(userService, tx, userId) {
    const expectedDaily = await userService.getExpectedDailyHours(tx, userId);

    return {
      breakMin: 0,
      durationHoursGross: expectedDaily,
      durationHoursNet: expectedDaily,
      overtimeHours: 0,
      undertimeHours: 0,
    };
  }

  /**
   * Erstellt Standard-TimeEntry für automatische Generierung
   * @param {string} userID - User ID
   * @param {Date} date - Datum für den Eintrag
   * @param {Object} user - User Objekt mit Konfiguration
   * @returns {Object} Vollständiges TimeEntry Objekt
   */
  static createDefaultEntry(userID, date, user) {
    const dateString = date.toISOString().split('T')[0];
    const workingDaysPerWeek = user.workingDaysPerWeek || 5;
    const expected = user.expectedDailyHoursDec || (user.weeklyHoursDec || 36) / workingDaysPerWeek;

    return {
      ID: randomUUID(),
      user_ID: userID,
      workDate: dateString,
      entryType_code: 'W',
      startTime: '08:00:00',
      endTime: '15:42:00',
      breakMin: 30,
      source: 'GENERATED',
      note: `Automatisch generiert für ${date.toLocaleDateString('de-DE')}`,
      // Berechnete Werte
      durationHoursGross: 7.7,
      durationHoursNet: 7.2,
      overtimeHours: Math.max(0, 7.2 - expected),
      undertimeHours: Math.max(0, expected - 7.2),
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
  }
}

module.exports = TimeEntryFactory;
