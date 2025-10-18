import { TimeEntry, User } from '#cds-models/TrackService';
import { logger } from '../utils';
import { CustomizingService } from '../services/CustomizingService';

/**
 * Validator für Generierungs-Operationen
 *
 * Validiert:
 * - User-Existenz und -Aktivität
 * - Bundesland-Codes
 * - Generierte Entry-Integrität
 */
export class GenerationValidator {
  /**
   * Liste der gültigen deutschen Bundesland-Codes
   * Siehe: db/data/io.nimble-GermanStates.csv
   */
  private static readonly VALID_STATE_CODES = new Set([
    'BW', // Baden-Württemberg
    'BY', // Bayern
    'BE', // Berlin
    'BB', // Brandenburg
    'HB', // Bremen
    'HH', // Hamburg
    'HE', // Hessen
    'MV', // Mecklenburg-Vorpommern
    'NI', // Niedersachsen
    'NW', // Nordrhein-Westfalen
    'RP', // Rheinland-Pfalz
    'SL', // Saarland
    'SN', // Sachsen
    'ST', // Sachsen-Anhalt
    'SH', // Schleswig-Holstein
    'TH', // Thüringen
  ]);

  constructor(private customizingService: CustomizingService) {}

  /**
   * Validiert, ob ein User existiert und aktiv ist
   * @param user - User-Objekt (kann null/undefined sein)
   * @param userId - User-ID für Fehlermeldung
   * @throws Error wenn User nicht vorhanden oder inaktiv
   */
  validateUser(user: User | null | undefined, userId: string): void {
    if (!user) {
      throw new Error(`User mit ID '${userId}' nicht gefunden.`);
    }

    if (!user.active) {
      throw new Error(`User '${userId}' ist deaktiviert. Generierung nicht möglich.`);
    }

    // Prüfe ob expectedDailyHours gesetzt ist (wichtig für Berechnungen)
    if (!user.expectedDailyHoursDec || user.expectedDailyHoursDec <= 0) {
      throw new Error(
        `User '${userId}' hat keine gültigen Expected Daily Hours konfiguriert (aktuell: ${user.expectedDailyHoursDec}).`,
      );
    }

    logger.validationSuccess('User', `${user.name} validated`, {
      userId,
      dailyHours: user.expectedDailyHoursDec,
      workingDays: user.workingDaysPerWeek,
    });
  }

  /**
   * Validiert und normalisiert Bundesland-Code
   * @param stateCode - Bundesland-Code (kann undefined sein)
   * @returns Validierter State-Code
   * @throws Error wenn State-Code fehlt oder ungültig ist
   */
  validateStateCode(stateCode: string | undefined): string {
    if (!stateCode) {
      throw new Error('Bundesland (stateCode) ist erforderlich. Bitte eines der deutschen Bundesländer angeben.');
    }

    // Normalisierung auf Uppercase (falls lowercase eingegeben)
    const normalizedCode = stateCode.toUpperCase();

    if (!GenerationValidator.VALID_STATE_CODES.has(normalizedCode)) {
      const validCodes = Array.from(GenerationValidator.VALID_STATE_CODES).join(', ');
      throw new Error(
        `Ungültiger Bundesland-Code: '${stateCode}'. Gültige Codes: ${validCodes}. Siehe: db/data/io.nimble-GermanStates.csv`,
      );
    }

    logger.validationSuccess('StateCode', `Validated: ${normalizedCode}`, { stateCode: normalizedCode });
    return normalizedCode;
  }

  /**
   * Validiert generierte TimeEntries auf Integrität
   * @param entries - Array von generierten TimeEntries
   * @throws Error wenn Entries ungültig oder leer sind
   */
  validateGeneratedEntries(entries: TimeEntry[]): void {
    if (!Array.isArray(entries)) {
      throw new Error('Generierte Entries müssen ein Array sein.');
    }

    // Leeres Array ist OK (alle Tage bereits vorhanden)
    if (entries.length === 0) {
      logger.validationInfo('GeneratedEntries', 'No new entries to generate (all already exist)');
      return;
    }

    // Prüfe, ob alle Einträge grundlegende Felder haben
    const timeEntryDefaults = this.customizingService.getTimeEntryDefaults();
    const workEntryType = timeEntryDefaults.workEntryTypeCode;
    const allowedCodes = new Set([
      workEntryType,
      timeEntryDefaults.holidayEntryTypeCode,
      timeEntryDefaults.weekendEntryTypeCode,
      'V',
      'S',
    ]);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      if (!entry.user_ID) {
        throw new Error(`Entry ${i}: user_ID fehlt`);
      }

      if (!entry.workDate) {
        throw new Error(`Entry ${i}: workDate fehlt`);
      }

      if (!entry.entryType_code) {
        throw new Error(`Entry ${i}: entryType_code fehlt`);
      }

      // Prüfe auf valide Entry Types
      if (!allowedCodes.has(entry.entryType_code)) {
        throw new Error(
          `Entry ${i}: Ungültiger entryType_code '${entry.entryType_code}'. Erlaubt sind ${Array.from(allowedCodes).join(', ')}`,
        );
      }

      // Prüfe Zeitfelder (nur für Work Entries erforderlich)
      if (entry.entryType_code === workEntryType) {
        if (!entry.startTime || !entry.endTime) {
          throw new Error(`Entry ${i}: Work Entry benötigt startTime und endTime`);
        }

        if (entry.breakMin === undefined || entry.breakMin === null) {
          throw new Error(`Entry ${i}: breakMin fehlt`);
        }
      }
    }

    logger.validationSuccess('GeneratedEntries', `${entries.length} entries validated`, { count: entries.length });
  }

  /**
   * Validiert Jahr für Generierung
   * @param year - Zieljahr
   * @throws Error wenn Jahr ungültig ist
   */
  validateYear(year: number): void {
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 10; // Max 10 Jahre zurück
    const maxYear = currentYear + 5; // Max 5 Jahre voraus

    if (year < minYear || year > maxYear) {
      throw new Error(
        `Jahr ${year} liegt außerhalb des erlaubten Bereichs (${minYear}-${maxYear}). Bitte ein realistisches Jahr wählen.`,
      );
    }

    logger.validationSuccess('Year', `Validated: ${year}`, { year });
  }

  /**
   * Validiert Monat (1-12)
   * @param month - Monat als Zahl
   * @throws Error wenn Monat ungültig ist
   */
  validateMonth(month: number): void {
    if (month < 1 || month > 12) {
      throw new Error(`Monat ${month} ist ungültig. Erlaubter Bereich: 1-12`);
    }

    logger.validationSuccess('Month', `Validated: ${month}`, { month });
  }
}
