import { randomUUID } from 'crypto';
import { Transaction } from '@sap/cds';
import { TimeEntry, User } from '#cds-models/TrackService';
import { TimeCalculationService, UserService } from '../services';
import { CustomizingService } from '../services/CustomizingService';
import { DateUtils, logger } from '../utils';

// Type definitions
interface WorkTimeData {
  breakMin: number;
  durationHoursGross: number;
  durationHoursNet: number;
  overtimeHours: number;
  undertimeHours: number;
  expectedDailyHoursDec: number;
}

/**
 * Factory für TimeEntry Erstellung
 * Zentrale Stelle für die Erzeugung von TimeEntry-Objekten
 */
export class TimeEntryFactory {
  constructor(private customizingService: CustomizingService) {}

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
  async createWorkTimeData(
    userService: UserService,
    tx: Transaction,
    userId: string,
    startTime: string,
    endTime: string,
    breakMinutes: number,
  ): Promise<WorkTimeData> {
    const workingHours = TimeCalculationService.calculateWorkingHours(startTime, endTime, breakMinutes);

    if (workingHours.error) {
      logger.validationWarning('TimeEntryFactory', workingHours.error, { startTime, endTime, breakMinutes });
      throw new Error(workingHours.error);
    }

    const expectedDaily = await userService.getExpectedDailyHours(tx, userId);
    const { overtime, undertime } = TimeCalculationService.calculateOvertimeAndUndertime(
      workingHours.netHours!,
      expectedDaily,
    );

    logger.factoryCreated('WorkTimeData', 'Work time data calculated', {
      userId,
      netHours: workingHours.netHours,
      overtime,
      undertime,
      expectedDaily,
    });

    return {
      breakMin: workingHours.breakMinutes!,
      durationHoursGross: TimeCalculationService.roundToTwoDecimals(workingHours.grossMinutes! / 60),
      durationHoursNet: workingHours.netHours!,
      overtimeHours: overtime,
      undertimeHours: undertime,
      expectedDailyHoursDec: expectedDaily,
    };
  }

  /**
   * Erstellt Non-Work-Time Entry Daten (Urlaub/Krankheit)
   * @param userService - UserService Instanz
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @returns Standard-Zeitdaten
   */
  async createNonWorkTimeData(userService: UserService, tx: Transaction, userId: string): Promise<WorkTimeData> {
    const expectedDaily = await userService.getExpectedDailyHours(tx, userId);

    return {
      breakMin: 0,
      durationHoursGross: expectedDaily,
      durationHoursNet: expectedDaily,
      overtimeHours: 0,
      undertimeHours: 0,
      expectedDailyHoursDec: expectedDaily,
    };
  }

  /**
   * Erstellt Standard-TimeEntry für automatische Generierung
   * @param userID - User ID
   * @param date - Datum für den Eintrag
   * @param user - User Objekt mit Konfiguration
   * @returns Vollständiges TimeEntry Objekt
   */
  createDefaultEntry(userID: string, date: Date, user: User): TimeEntry {
    const timeDefaults = this.customizingService.getTimeEntryDefaults();
    const userDefaults = this.customizingService.getUserDefaults();
    const dateString = DateUtils.toLocalDateString(date);
    const displayDate = DateUtils.toGermanDateString(date);
    const workingDaysPerWeek = user.workingDaysPerWeek ?? userDefaults.fallbackWorkingDays;
    const weeklyHours = Number(user.weeklyHoursDec ?? userDefaults.fallbackWeeklyHours);
    const expected =
      user.expectedDailyHoursDec ?? TimeCalculationService.roundToTwoDecimals(weeklyHours / workingDaysPerWeek);

    // Berechne Start- und Endzeit basierend auf erwarteten Stunden
    const breakMinutes = timeDefaults.defaultBreakMinutes;
    const startHour = timeDefaults.startHour;
    const startMinute = timeDefaults.startMinute;
    const grossMinutes = expected * 60 + breakMinutes; // Brutto-Arbeitszeit inkl. Pause
    const grossHours = grossMinutes / 60;

    const totalStartMinutes = startHour * 60 + startMinute;
    const totalEndMinutes = totalStartMinutes + grossMinutes;
    const endHour = Math.floor(totalEndMinutes / 60);
    const endMinute = totalEndMinutes % 60;

    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;

    logger.factoryCreated('DefaultEntry', 'Default work entry created', {
      workDate: dateString,
      expectedHours: expected,
    });

    return {
      ID: randomUUID(),
      user_ID: userID,
      workDate: dateString,
      entryType_code: timeDefaults.workEntryTypeCode,
      startTime: startTime,
      endTime: endTime,
      breakMin: breakMinutes,
      durationHoursGross: TimeCalculationService.roundToTwoDecimals(grossHours),
      durationHoursNet: expected,
      overtimeHours: 0,
      undertimeHours: 0,
      expectedDailyHoursDec: expected,
      source: timeDefaults.generatedSourceCode,
      note: `Automatisch generiert für ${displayDate}`,
      workLocation_code: user.defaultWorkLocation_code || null,
      travelType_code: null,
      status_code: timeDefaults.statusOpenCode,
    } as TimeEntry;
  }

  /**
   * Erstellt einen Wochenend-Entry (EntryType O, Zeiten = 0)
   * @param userID - User ID
   * @param date - Datum
   * @returns TimeEntry für Wochenende
   */
  createWeekendEntry(userID: string, date: Date): TimeEntry {
    const timeDefaults = this.customizingService.getTimeEntryDefaults();
    const dateString = DateUtils.toLocalDateString(date);
    const dayName = DateUtils.getWeekdayName(date);

    logger.factoryCreated('WeekendEntry', 'Weekend entry created', { workDate: dateString, dayName });

    return {
      ID: randomUUID(),
      user_ID: userID,
      workDate: dateString,
      entryType_code: timeDefaults.weekendEntryTypeCode,
      startTime: '00:00:00',
      endTime: '00:00:00',
      breakMin: 0,
      durationHoursGross: 0,
      durationHoursNet: 0,
      overtimeHours: 0,
      undertimeHours: 0,
      expectedDailyHoursDec: 0,
      source: timeDefaults.generatedSourceCode,
      note: `${dayName}`,
      workLocation_code: null,
      travelType_code: null,
      status_code: timeDefaults.statusOpenCode,
    } as TimeEntry;
  }

  /**
   * Erstellt einen Feiertags-Entry (EntryType H, Zeiten = 0)
   * @param userID - User ID
   * @param date - Datum
   * @param holidayName - Name des Feiertags
   * @returns TimeEntry für Feiertag
   */
  createHolidayEntry(userID: string, date: Date, holidayName: string): TimeEntry {
    const timeDefaults = this.customizingService.getTimeEntryDefaults();
    const dateString = DateUtils.toLocalDateString(date);

    logger.factoryCreated('HolidayEntry', 'Holiday entry created', { workDate: dateString, holidayName });

    return {
      ID: randomUUID(),
      user_ID: userID,
      workDate: dateString,
      entryType_code: timeDefaults.holidayEntryTypeCode,
      startTime: '00:00:00',
      endTime: '00:00:00',
      breakMin: 0,
      durationHoursGross: 0,
      durationHoursNet: 0,
      overtimeHours: 0,
      undertimeHours: 0,
      expectedDailyHoursDec: 0,
      source: timeDefaults.generatedSourceCode,
      note: holidayName,
      workLocation_code: null,
      travelType_code: null,
      status_code: timeDefaults.statusOpenCode,
    } as TimeEntry;
  }
}

export default TimeEntryFactory;
