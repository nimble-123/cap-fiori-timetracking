/**
 * Utility-Klasse für sichere Datumsoperationen ohne Timezone-Probleme
 *
 * Problem: JavaScript Date.toISOString() konvertiert immer zu UTC,
 * was bei lokalen Daten zu Off-by-One Fehlern führen kann.
 *
 * Lösung: Alle Datumsformatierungen zentral an einer Stelle mit
 * konsistentem deutschem Locale.
 */
export class DateUtils {
  /**
   * Standard-Locale für alle Datumsformatierungen
   */
  private static locale = 'de-DE';

  /**
   * Default Anzahl Arbeitstage pro Woche
   */
  private static defaultWorkingDaysPerWeek = 5;

  /**
   * Konfiguriert globale Datums-Defaults
   */
  static configure(options: { locale?: string; defaultWorkingDaysPerWeek?: number }): void {
    if (options.locale) {
      this.locale = options.locale;
    }
    if (options.defaultWorkingDaysPerWeek && options.defaultWorkingDaysPerWeek > 0) {
      this.defaultWorkingDaysPerWeek = options.defaultWorkingDaysPerWeek;
    }
  }

  /**
   * Konvertiert ein Date-Objekt zu YYYY-MM-DD String (lokal, ohne UTC-Konvertierung)
   *
   * WICHTIG: Verwendet bewusst KEINE UTC-Methoden, um Timezone-Shifts zu vermeiden
   *
   * @param date - Das zu konvertierende Date-Objekt
   * @returns Formatierter String im Format YYYY-MM-DD
   * @throws Error wenn date null, undefined oder ungültig ist
   *
   * @example
   * const date = new Date(2025, 0, 1); // 1. Jan 2025, 00:00 Lokalzeit
   * DateUtils.toLocalDateString(date); // "2025-01-01" ✅ (nicht "2024-12-31")
   */
  static toLocalDateString(date: Date): string {
    // Input-Validierung
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error(`Ungültiges Date-Objekt: ${date}`);
    }

    // Verwende LOKALE Datumsmethoden (nicht UTC)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Monate sind 0-basiert
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Konvertiert ein Date-Objekt zu YYYY-MM String (für Monatssaldo)
   *
   * @param date - Das zu konvertierende Date-Objekt
   * @returns Formatierter String im Format YYYY-MM
   * @throws Error wenn date null, undefined oder ungültig ist
   */
  static toLocalYearMonthString(date: Date): string {
    // Input-Validierung
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error(`Ungültiges Date-Objekt: ${date}`);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
  }

  /**
   * Erstellt ein Date-Objekt ohne Timezone-Probleme
   * Setzt explizit Stunden/Minuten/Sekunden auf Mittag (12:00:00),
   * um Timezone-Shifts zu vermeiden
   *
   * @param year - Jahr (z.B. 2025)
   * @param month - Monat (1-12, NICHT 0-11!)
   * @param day - Tag (1-31)
   * @returns Date-Objekt mit sicherer Uhrzeit (12:00:00)
   * @throws Error bei ungültigen Parametern
   *
   * @example
   * DateUtils.createSafeDate(2025, 1, 1); // 1. Januar 2025, 12:00:00
   */
  static createSafeDate(year: number, month: number, day: number): Date {
    // Validierung
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      throw new Error(`Ungültiges Jahr: ${year}`);
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new Error(`Ungültiger Monat: ${month} (muss 1-12 sein)`);
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      throw new Error(`Ungültiger Tag: ${day}`);
    }

    // Erstelle Date mit 12:00:00 um Timezone-Shifts zu vermeiden
    // month - 1, weil JS Monate 0-basiert sind
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);

    // Prüfe ob das Datum valide ist (z.B. nicht 31. Februar)
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      throw new Error(`Ungültiges Datum: ${year}-${month}-${day}`);
    }

    return date;
  }

  /**
   * Formatiert ein Date-Objekt für Anzeigezwecke (deutsches Format)
   *
   * @param date - Das zu formatierende Date-Objekt
   * @returns String im Format "DD.MM.YYYY"
   * @throws Error wenn date null, undefined oder ungültig ist
   *
   * @example
   * DateUtils.toGermanDateString(new Date(2025, 0, 1)); // "01.01.2025"
   */
  static toGermanDateString(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error(`Ungültiges Date-Objekt: ${date}`);
    }

    return date.toLocaleDateString(this.locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  /**
   * Gibt den Wochentagsnamen in deutscher Sprache zurück
   *
   * @param date - Das Date-Objekt
   * @returns Wochentagsname (z.B. "Montag", "Dienstag", ...)
   * @throws Error wenn date null, undefined oder ungültig ist
   *
   * @example
   * DateUtils.getWeekdayName(new Date(2025, 0, 1)); // "Mittwoch"
   */
  static getWeekdayName(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error(`Ungültiges Date-Objekt: ${date}`);
    }

    return date.toLocaleDateString(this.locale, { weekday: 'long' });
  }

  /**
   * Gibt den Wochentagsnamen in kurzer Form zurück
   *
   * @param date - Das Date-Objekt
   * @returns Kurzer Wochentagsname (z.B. "Mo", "Di", ...)
   * @throws Error wenn date null, undefined oder ungültig ist
   *
   * @example
   * DateUtils.getShortWeekdayName(new Date(2025, 0, 1)); // "Mi"
   */
  static getShortWeekdayName(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error(`Ungültiges Date-Objekt: ${date}`);
    }

    return date.toLocaleDateString(this.locale, { weekday: 'short' });
  }

  /**
   * Parst einen YYYY-MM-DD String zu einem sicheren Date-Objekt
   *
   * @param dateString - String im Format YYYY-MM-DD
   * @returns Date-Objekt mit 12:00:00 Uhrzeit
   * @throws Error bei ungültigem Format
   */
  static parseLocalDate(dateString: string): Date {
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      throw new Error(`Ungültiges Datumsformat: ${dateString} (erwartet: YYYY-MM-DD)`);
    }

    const [, yearStr, monthStr, dayStr] = match;
    return this.createSafeDate(parseInt(yearStr), parseInt(monthStr), parseInt(dayStr));
  }

  /**
   * Prüft ob ein Datum ein Wochenende ist (Samstag oder Sonntag)
   *
   * @param date - Das zu prüfende Date-Objekt
   * @returns true wenn Wochenende, sonst false
   * @throws Error wenn date null, undefined oder ungültig ist
   */
  static isWeekend(date: Date): boolean {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error(`Ungültiges Date-Objekt: ${date}`);
    }

    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sonntag oder Samstag
  }

  /**
   * Prüft ob ein Tag ein Arbeitstag ist (basierend auf Wochentag)
   *
   * @param date - Das zu prüfende Date-Objekt
   * @param workingDaysPerWeek - Anzahl Arbeitstage pro Woche (Standard: 5 = Mo-Fr)
   * @returns true wenn Arbeitstag, sonst false
   * @throws Error wenn date null, undefined oder ungültig ist
   *
   * @example
   * DateUtils.isWorkingDay(new Date(2025, 0, 13)); // true (Montag)
   * DateUtils.isWorkingDay(new Date(2025, 0, 18)); // false (Samstag)
   * DateUtils.isWorkingDay(new Date(2025, 0, 18), 6); // true (Samstag ist Arbeitstag bei 6-Tage-Woche)
   */
  static isWorkingDay(date: Date, workingDaysPerWeek: number = this.defaultWorkingDaysPerWeek): boolean {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error(`Ungültiges Date-Objekt: ${date}`);
    }

    const dayOfWeek = date.getDay(); // 0=Sonntag, 1=Montag, ..., 6=Samstag

    return workingDaysPerWeek === 5
      ? dayOfWeek >= 1 && dayOfWeek <= 5 // Mo-Fr
      : dayOfWeek >= 1 && dayOfWeek <= workingDaysPerWeek; // Flexibel
  }

  /**
   * Prüft ob ein Jahr ein Schaltjahr ist
   *
   * @param year - Jahr (z.B. 2024)
   * @returns true wenn Schaltjahr, sonst false
   *
   * @example
   * DateUtils.isLeapYear(2024); // true
   * DateUtils.isLeapYear(2025); // false
   * DateUtils.isLeapYear(2000); // true (durch 400 teilbar)
   * DateUtils.isLeapYear(1900); // false (durch 100, aber nicht durch 400 teilbar)
   */
  static isLeapYear(year: number): boolean {
    if (!Number.isInteger(year) || year < 1) {
      throw new Error(`Ungültiges Jahr: ${year}`);
    }

    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Ermittelt Daten für ein bestimmtes Jahr
   *
   * @param year - Jahr (optional, Default: aktuelles Jahr)
   * @returns Objekt mit Jahr, Anzahl Tage, Start- und End-String
   *
   * @example
   * DateUtils.getYearData(2024);
   * // { year: 2024, daysInYear: 366, yearStartStr: "2024-01-01", yearEndStr: "2024-12-31" }
   */
  static getYearData(year?: number): {
    year: number;
    daysInYear: number;
    yearStartStr: string;
    yearEndStr: string;
  } {
    const targetYear = year || new Date().getFullYear();
    const yearStart = new Date(targetYear, 0, 1);
    const yearEnd = new Date(targetYear, 11, 31);
    const daysInYear = this.isLeapYear(targetYear) ? 366 : 365;

    const yearStartStr = this.toLocalDateString(yearStart);
    const yearEndStr = this.toLocalDateString(yearEnd);

    return { year: targetYear, daysInYear, yearStartStr, yearEndStr };
  }

  /**
   * Ermittelt Daten für den aktuellen Monat
   *
   * @returns Objekt mit Jahr, Monat (0-basiert), Anzahl Tage, Start- und End-String
   *
   * @example
   * DateUtils.getCurrentMonthData();
   * // { year: 2025, month: 0, daysInMonth: 31, monthStartStr: "2025-01-01", monthEndStr: "2025-01-31" }
   */
  static getCurrentMonthData(): {
    year: number;
    month: number;
    daysInMonth: number;
    monthStartStr: string;
    monthEndStr: string;
  } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-basiert
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const monthStartStr = this.toLocalDateString(monthStart);
    const monthEndStr = this.toLocalDateString(monthEnd);

    return { year, month, daysInMonth, monthStartStr, monthEndStr };
  }

  /**
   * Ermittelt Daten für einen bestimmten Monat
   *
   * @param year - Jahr (z.B. 2025)
   * @param month - Monat (1-12, NICHT 0-11!)
   * @returns Objekt mit Jahr, Monat (0-basiert), Anzahl Tage, Start- und End-String
   * @throws Error bei ungültigen Parametern
   *
   * @example
   * DateUtils.getMonthData(2025, 1);
   * // { year: 2025, month: 0, daysInMonth: 31, monthStartStr: "2025-01-01", monthEndStr: "2025-01-31" }
   */
  static getMonthData(
    year: number,
    month: number,
  ): {
    year: number;
    month: number;
    daysInMonth: number;
    monthStartStr: string;
    monthEndStr: string;
  } {
    // Validierung
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      throw new Error(`Ungültiges Jahr: ${year}`);
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new Error(`Ungültiger Monat: ${month} (muss 1-12 sein)`);
    }

    const jsMonth = month - 1; // Konvertiere zu 0-basiert
    const daysInMonth = new Date(year, jsMonth + 1, 0).getDate();

    const monthStart = new Date(year, jsMonth, 1);
    const monthEnd = new Date(year, jsMonth + 1, 0);
    const monthStartStr = this.toLocalDateString(monthStart);
    const monthEndStr = this.toLocalDateString(monthEnd);

    return { year, month: jsMonth, daysInMonth, monthStartStr, monthEndStr };
  }
}

export default DateUtils;
