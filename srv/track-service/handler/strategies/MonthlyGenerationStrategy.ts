import { TimeEntry, User } from '#cds-models/TrackService';
import { TimeEntryFactory } from '../factories/index.js';
import { CustomizingService } from '../services/index.js';
import { DateUtils, logger } from '../utils/index.js';

/**
 * Strategy für monatliche TimeEntries Generierung
 * Verwaltet die Logik zur automatischen Erstellung von monatlichen Einträgen
 */
export class MonthlyGenerationStrategy {
  constructor(
    private timeEntryFactory: TimeEntryFactory,
    private customizingService: CustomizingService,
  ) {}
  /**
   * Generiert fehlende TimeEntries für den aktuellen Monat
   * @param userID - User ID
   * @param user - User Objekt
   * @param existingDates - Bereits existierende Daten
   * @returns Array von neuen TimeEntries
   */
  generateMissingEntries(userID: string, user: User, existingDates: Set<string>): TimeEntry[] {
    const monthData = DateUtils.getCurrentMonthData();
    logger.strategyExecute(
      'MonthlyGeneration',
      `Generating month ${monthData.year}-${(monthData.month + 1).toString().padStart(2, '0')} (${monthData.daysInMonth} days)`,
      { year: monthData.year, month: monthData.month + 1, daysInMonth: monthData.daysInMonth },
    );

    const userDefaults = this.customizingService.getUserDefaults();
    const workingDaysPerWeek = user.workingDaysPerWeek ?? userDefaults.fallbackWorkingDays;
    const newEntries: TimeEntry[] = [];

    for (let day = 1; day <= monthData.daysInMonth; day++) {
      const currentDate = new Date(monthData.year, monthData.month, day);

      if (!DateUtils.isWorkingDay(currentDate, workingDaysPerWeek)) {
        continue;
      }

      const dateString = DateUtils.toLocalDateString(currentDate);

      if (existingDates.has(dateString)) {
        logger.strategySkip('MonthlyGeneration', `Entry exists: ${dateString}`, { date: dateString });
        continue;
      }

      const entry = this.timeEntryFactory.createDefaultEntry(userID, currentDate, user);
      newEntries.push(entry);
    }

    return newEntries;
  }
}

export default MonthlyGenerationStrategy;
