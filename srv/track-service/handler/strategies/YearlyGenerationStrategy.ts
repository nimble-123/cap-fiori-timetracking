import { TimeEntry, User } from '#cds-models/TrackService';
import { TimeEntryFactory } from '../factories';
import { HolidayService } from '../services';
import { DateUtils, logger } from '../utils';

/**
 * Strategy für jährliche TimeEntries Generierung
 * Verwaltet die Logik zur automatischen Erstellung von Jahreseinträgen
 * inkl. Wochenenden (EntryType O) und Feiertagen (EntryType H)
 */
export class YearlyGenerationStrategy {
  private holidayService: HolidayService;

  constructor(holidayService: HolidayService) {
    this.holidayService = holidayService;
  }

  /**
   * Generiert fehlende TimeEntries für ein Jahr
   * @param userID - User ID
   * @param user - User Objekt
   * @param year - Jahr für die Generierung
   * @param stateCode - Bundesland-Code für Feiertage
   * @param existingDates - Bereits existierende Daten
   * @returns Array von neuen TimeEntries
   */
  async generateMissingEntries(
    userID: string,
    user: User,
    year: number,
    stateCode: string,
    existingDates: Set<string>,
  ): Promise<TimeEntry[]> {
    const yearData = DateUtils.getYearData(year);
    logger.strategyExecute('YearlyGeneration', `Generating year ${yearData.year} (${yearData.daysInYear} days)`, {
      year: yearData.year,
      daysInYear: yearData.daysInYear,
    });

    const newEntries: TimeEntry[] = [];

    // Feiertage für das Jahr laden
    const holidays = await this.holidayService.getHolidays(yearData.year, stateCode);
    logger.strategyInfo('YearlyGeneration', `Loaded ${holidays.size} holidays for ${stateCode}`, {
      count: holidays.size,
      stateCode,
    });

    for (let dayOfYear = 0; dayOfYear < yearData.daysInYear; dayOfYear++) {
      const currentDate = new Date(yearData.year, 0, 1);
      currentDate.setDate(currentDate.getDate() + dayOfYear);

      const dateString = DateUtils.toLocalDateString(currentDate);

      if (existingDates.has(dateString)) {
        logger.strategySkip('YearlyGeneration', `Entry exists: ${dateString}`, { date: dateString });
        continue;
      }

      // Prüfen ob Feiertag
      const holiday = holidays.get(dateString);
      if (holiday) {
        const entry = TimeEntryFactory.createHolidayEntry(userID, currentDate, holiday.name);
        newEntries.push(entry);
        logger.strategyEvent('YearlyGeneration', `Holiday: ${dateString} - ${holiday.name}`, {
          date: dateString,
          holiday: holiday.name,
        });
        continue;
      }

      // Prüfen ob Wochenende
      if (DateUtils.isWeekend(currentDate)) {
        const entry = TimeEntryFactory.createWeekendEntry(userID, currentDate);
        newEntries.push(entry);
        continue;
      }

      // Normaler Arbeitstag
      const entry = TimeEntryFactory.createDefaultEntry(userID, currentDate, user);
      newEntries.push(entry);
    }

    return newEntries;
  }
}

export default YearlyGenerationStrategy;
