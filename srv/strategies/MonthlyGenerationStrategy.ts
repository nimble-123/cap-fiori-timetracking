import { TimeEntry, User } from '#cds-models/TrackService';
import { TimeEntryFactory } from '../factories/TimeEntryFactory';

interface MonthData {
  year: number;
  month: number;
  daysInMonth: number;
  monthStartStr: string;
  monthEndStr: string;
}

/**
 * Strategy für monatliche TimeEntries Generierung
 * Verwaltet die Logik zur automatischen Erstellung von monatlichen Einträgen
 */
export class MonthlyGenerationStrategy {
  /**
   * Bestimmt die Daten für den aktuellen Monat
   * @returns Monatsdaten mit Start/End Strings und Metadaten
   */
  getCurrentMonthData(): MonthData {
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
   * @param date - Das zu prüfende Datum
   * @param workingDaysPerWeek - Anzahl Arbeitstage pro Woche
   * @returns True wenn Arbeitstag
   */
  isWorkingDay(date: Date, workingDaysPerWeek: number = 5): boolean {
    const dayOfWeek = date.getDay(); // 0=Sonntag, 1=Montag, ...

    return workingDaysPerWeek === 5
      ? dayOfWeek >= 1 && dayOfWeek <= 5 // Mo-Fr
      : dayOfWeek >= 1 && dayOfWeek <= workingDaysPerWeek; // Flexibel
  }

  /**
   * Generiert fehlende TimeEntries für einen Monat
   * @param userID - User ID
   * @param user - User Objekt
   * @param monthData - Monatsdaten
   * @param existingDates - Bereits existierende Daten
   * @returns Array von neuen TimeEntries
   */
  generateMissingEntries(userID: string, user: User, monthData: MonthData, existingDates: Set<string>): TimeEntry[] {
    const { year, month, daysInMonth } = monthData;
    const workingDaysPerWeek = user.workingDaysPerWeek || 5;
    const newEntries: TimeEntry[] = [];

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

export default MonthlyGenerationStrategy;
