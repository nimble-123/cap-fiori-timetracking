const TimeEntryFactory = require('../factories/TimeEntryFactory');

/**
 * Strategy für monatliche TimeEntry Generierung
 * Verwaltet die Logik zur automatischen Erstellung von monatlichen Einträgen
 */
class MonthlyGenerationStrategy {
  /**
   * Bestimmt die Daten für den aktuellen Monat
   * @returns {Object} Monatsdaten mit Start/End Strings und Metadaten
   */
  getCurrentMonthData() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-basiert
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    console.log(`📅 Generiere für ${year}-${(month + 1).toString().padStart(2, '0')} (${daysInMonth} Tage)`);

    return { year, month, daysInMonth, monthStartStr, monthEndStr };
  }

  /**
   * Prüft, ob ein Tag ein Arbeitstag ist
   * @param {Date} date - Das zu prüfende Datum
   * @param {number} workingDaysPerWeek - Anzahl Arbeitstage pro Woche
   * @returns {boolean} True wenn Arbeitstag
   */
  isWorkingDay(date, workingDaysPerWeek = 5) {
    const dayOfWeek = date.getDay(); // 0=Sonntag, 1=Montag, ...

    return workingDaysPerWeek === 5
      ? dayOfWeek >= 1 && dayOfWeek <= 5 // Mo-Fr
      : dayOfWeek >= 1 && dayOfWeek <= workingDaysPerWeek; // Flexibel
  }

  /**
   * Generiert fehlende TimeEntries für einen Monat
   * @param {string} userID - User ID
   * @param {Object} user - User Objekt
   * @param {Object} monthData - Monatsdaten
   * @param {Set<string>} existingDates - Bereits existierende Daten
   * @returns {Array<Object>} Array von neuen TimeEntries
   */
  generateMissingEntries(userID, user, monthData, existingDates) {
    const { year, month, daysInMonth } = monthData;
    const workingDaysPerWeek = user.workingDaysPerWeek || 5;
    const newEntries = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);

      if (!this.isWorkingDay(currentDate, workingDaysPerWeek)) {
        continue;
      }

      const dateString = currentDate.toISOString().split('T')[0];

      if (existingDates.has(dateString)) {
        console.log(`⏭️  Überspringe ${dateString} - Eintrag existiert bereits`);
        continue;
      }

      const entry = TimeEntryFactory.createDefaultEntry(userID, currentDate, user);
      newEntries.push(entry);
    }

    return newEntries;
  }
}

module.exports = MonthlyGenerationStrategy;
