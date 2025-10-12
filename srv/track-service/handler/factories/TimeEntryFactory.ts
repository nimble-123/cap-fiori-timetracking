import { randomUUID } from 'crypto';
import { Transaction } from '@sap/cds';
import { TimeEntry, User } from '#cds-models/TrackService';
import { TimeCalculationService } from '../services/TimeCalculationService';
import { UserService } from '../services/UserService';

// Type definitions
interface WorkTimeData {
  breakMin: number;
  durationHoursGross: number;
  durationHoursNet: number;
  overtimeHours: number;
  undertimeHours: number;
}

/**
 * Factory für TimeEntry Erstellung
 * Zentrale Stelle für die Erzeugung von TimeEntry-Objekten
 */
export class TimeEntryFactory {
  /**
   * Erstellt Work-Time Entry Daten
   * @param userService - UserService Instanz
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param startTime - Startzeit
   * @param endTime - Endzeit
   * @param breakMinutes - Pausenzeit
   * @returns Berechnete Zeitdaten
   */
  static async createWorkTimeData(
    userService: UserService,
    tx: Transaction,
    userId: string,
    startTime: string,
    endTime: string,
    breakMinutes: number,
  ): Promise<WorkTimeData> {
    const workingHours = TimeCalculationService.calculateWorkingHours(startTime, endTime, breakMinutes);

    if (workingHours.error) {
      throw new Error(workingHours.error);
    }

    const expectedDaily = await userService.getExpectedDailyHours(tx, userId);
    const { overtime, undertime } = TimeCalculationService.calculateOvertimeAndUndertime(
      workingHours.netHours!,
      expectedDaily,
    );

    return {
      breakMin: workingHours.breakMinutes!,
      durationHoursGross: TimeCalculationService.roundToTwoDecimals(workingHours.grossMinutes! / 60),
      durationHoursNet: workingHours.netHours!,
      overtimeHours: overtime,
      undertimeHours: undertime,
    };
  }

  /**
   * Erstellt Non-Work-Time Entry Daten (Urlaub/Krankheit)
   * @param userService - UserService Instanz
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @returns Standard-Zeitdaten
   */
  static async createNonWorkTimeData(userService: UserService, tx: Transaction, userId: string): Promise<WorkTimeData> {
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
   * @param userID - User ID
   * @param date - Datum für den Eintrag
   * @param user - User Objekt mit Konfiguration
   * @returns Vollständiges TimeEntry Objekt
   */
  static createDefaultEntry(userID: string, date: Date, user: User): TimeEntry {
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
      durationHoursGross: expected + 0.5,
      durationHoursNet: expected,
      overtimeHours: 0,
      undertimeHours: 0,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    } as TimeEntry;
  }

  /**
   * Erstellt einen Wochenend-Entry (EntryType O, Zeiten = 0)
   * @param userID - User ID
   * @param date - Datum
   * @returns TimeEntry für Wochenende
   */
  static createWeekendEntry(userID: string, date: Date): TimeEntry {
    const dateString = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('de-DE', { weekday: 'long' });

    return {
      ID: randomUUID(),
      user_ID: userID,
      workDate: dateString,
      entryType_code: 'O', // O = Frei/Wochenende
      startTime: '00:00:00',
      endTime: '00:00:00',
      breakMin: 0,
      durationHoursGross: 0,
      durationHoursNet: 0,
      overtimeHours: 0,
      undertimeHours: 0,
      source: 'GENERATED',
      note: `${dayName}`,
    } as TimeEntry;
  }

  /**
   * Erstellt einen Feiertags-Entry (EntryType H, Zeiten = 0)
   * @param userID - User ID
   * @param date - Datum
   * @param holidayName - Name des Feiertags
   * @returns TimeEntry für Feiertag
   */
  static createHolidayEntry(userID: string, date: Date, holidayName: string): TimeEntry {
    const dateString = date.toISOString().split('T')[0];

    return {
      ID: randomUUID(),
      user_ID: userID,
      workDate: dateString,
      entryType_code: 'H', // H = Feiertag
      startTime: '00:00:00',
      endTime: '00:00:00',
      breakMin: 0,
      durationHoursGross: 0,
      durationHoursNet: 0,
      overtimeHours: 0,
      undertimeHours: 0,
      source: 'GENERATED',
      note: holidayName,
    } as TimeEntry;
  }
}

export default TimeEntryFactory;
