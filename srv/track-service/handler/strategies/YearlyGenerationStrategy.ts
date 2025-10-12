import { TimeEntry, User } from '#cds-models/TrackService';
import { TimeEntryFactory } from '../factories/TimeEntryFactory';
import { HolidayService } from '../services/HolidayService';

interface YearData {
  year: number;
  daysInYear: number;
  yearStartStr: string;
  yearEndStr: string;
}

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
   * Bestimmt die Daten für ein Jahr
   * @param year - Jahr (optional, Default: aktuelles Jahr)
   * @returns Jahresdaten mit Start/End Strings und Metadaten
   */
  getYearData(year?: number): YearData {
    const targetYear = year || new Date().getFullYear();
    const yearStart = new Date(targetYear, 0, 1);
    const yearEnd = new Date(targetYear, 11, 31);
    const daysInYear = this.isLeapYear(targetYear) ? 366 : 365;

    const yearStartStr = yearStart.toISOString().split('T')[0];
    const yearEndStr = yearEnd.toISOString().split('T')[0];

    console.log(`📅 Generiere für Jahr ${targetYear} (${daysInYear} Tage)`);

    return { year: targetYear, daysInYear, yearStartStr, yearEndStr };
  }

  /**
   * Prüft ob ein Jahr ein Schaltjahr ist
   * @param year - Jahr
   * @returns True wenn Schaltjahr
   */
  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Prüft ob ein Tag ein Wochenende ist
   * @param date - Das zu prüfende Datum
   * @returns True wenn Samstag oder Sonntag
   */
  isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sonntag oder Samstag
  }

  /**
   * Generiert fehlende TimeEntries für ein Jahr
   * @param userID - User ID
   * @param user - User Objekt
   * @param yearData - Jahresdaten
   * @param stateCode - Bundesland-Code für Feiertage
   * @param existingDates - Bereits existierende Daten
   * @returns Array von neuen TimeEntries
   */
  async generateMissingEntries(
    userID: string,
    user: User,
    yearData: YearData,
    stateCode: string,
    existingDates: Set<string>,
  ): Promise<TimeEntry[]> {
    const { year, daysInYear } = yearData;
    const newEntries: TimeEntry[] = [];

    // Feiertage für das Jahr laden
    const holidays = await this.holidayService.getHolidays(year, stateCode);
    console.log(`🎉 ${holidays.size} Feiertage für ${stateCode} geladen`);

    for (let dayOfYear = 0; dayOfYear < daysInYear; dayOfYear++) {
      const currentDate = new Date(year, 0, 1);
      currentDate.setDate(currentDate.getDate() + dayOfYear);

      const dateString = currentDate.toISOString().split('T')[0];

      if (existingDates.has(dateString)) {
        console.log(`⏭️  Überspringe ${dateString} - Eintrag existiert bereits`);
        continue;
      }

      // Prüfen ob Feiertag
      const holiday = holidays.get(dateString);
      if (holiday) {
        const entry = TimeEntryFactory.createHolidayEntry(userID, currentDate, holiday.name);
        newEntries.push(entry);
        console.log(`🎉 Feiertag: ${dateString} - ${holiday.name}`);
        continue;
      }

      // Prüfen ob Wochenende
      if (this.isWeekend(currentDate)) {
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
