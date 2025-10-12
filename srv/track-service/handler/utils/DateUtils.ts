/**
 * Utility-Funktionen für Datumsformatierung ohne Timezone-Konvertierung
 */
export class DateUtils {
  /**
   * Formatiert ein Date-Objekt zu YYYY-MM-DD ohne UTC-Konvertierung
   *
   * Problem: date.toISOString() konvertiert zu UTC, was zu Datum-Verschiebungen führt
   * Lösung: Lokale Datumswerte direkt verwenden
   *
   * @param date - Das zu formatierende Datum
   * @returns String im Format YYYY-MM-DD (lokale Zeit)
   *
   * @example
   * const date = new Date(2025, 0, 1); // 1. Januar 2025
   * toLocalDateString(date); // "2025-01-01" (nicht "2024-12-31"!)
   */
  static toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatiert ein Date-Objekt zu YYYY-MM ohne UTC-Konvertierung
   *
   * @param date - Das zu formatierende Datum
   * @returns String im Format YYYY-MM (lokale Zeit)
   */
  static toLocalYearMonthString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Erstellt ein Date-Objekt für einen spezifischen Tag ohne Zeit
   *
   * @param year - Jahr
   * @param month - Monat (1-12, nicht 0-11!)
   * @param day - Tag
   * @returns Date-Objekt mit lokaler Zeit 00:00:00
   */
  static createLocalDate(year: number, month: number, day: number): Date {
    return new Date(year, month - 1, day);
  }
}

export default DateUtils;
