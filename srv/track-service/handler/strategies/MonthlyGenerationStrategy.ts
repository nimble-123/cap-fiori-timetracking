import { TimeEntry, User } from '#cds-models/TrackService';
import { TimeEntryFactory } from '../factories/TimeEntryFactory';
import { DateUtils } from '../utils/DateUtils';

/**
 * Strategy für monatliche TimeEntries Generierung
 * Verwaltet die Logik zur automatischen Erstellung von monatlichen Einträgen
 */
export class MonthlyGenerationStrategy {
  /**
   * Generiert fehlende TimeEntries für den aktuellen Monat
   * @param userID - User ID
   * @param user - User Objekt
   * @param existingDates - Bereits existierende Daten
   * @returns Array von neuen TimeEntries
   */
  generateMissingEntries(userID: string, user: User, existingDates: Set<string>): TimeEntry[] {
    const monthData = DateUtils.getCurrentMonthData();
    console.log(
      `📅 Generiere für ${monthData.year}-${(monthData.month + 1).toString().padStart(2, '0')} (${monthData.daysInMonth} Tage)`,
    );

    const workingDaysPerWeek = user.workingDaysPerWeek || 5;
    const newEntries: TimeEntry[] = [];

    for (let day = 1; day <= monthData.daysInMonth; day++) {
      const currentDate = new Date(monthData.year, monthData.month, day);

      if (!DateUtils.isWorkingDay(currentDate, workingDaysPerWeek)) {
        continue;
      }

      const dateString = DateUtils.toLocalDateString(currentDate);

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

export default MonthlyGenerationStrategy;
