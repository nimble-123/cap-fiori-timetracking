import { logger } from '../utils';

/**
 * Service zur Ermittlung von deutschen Feiertagen
 * Nutzt die kostenlose Feiertage-API (feiertage-api.de)
 */

interface Holiday {
  name: string;
  date: string;
}

interface HolidayApiResponse {
  [key: string]: {
    datum: string;
    hinweis: string;
  };
}

export class HolidayService {
  private cache: Map<string, Map<string, Holiday>> = new Map();

  /**
   * Ermittelt Feiertage für ein Jahr und Bundesland
   * @param year - Jahr (z.B. 2025)
   * @param stateCode - Bundesland-Code (z.B. "BY" für Bayern)
   * @returns Map von Datum-String zu Holiday-Objekt
   */
  async getHolidays(year: number, stateCode: string): Promise<Map<string, Holiday>> {
    const cacheKey = `${year}-${stateCode}`;

    // Prüfe Cache
    if (this.cache.has(cacheKey)) {
      logger.serviceCacheHit('Holiday', `Holidays for ${year}/${stateCode}`, { year, stateCode });
      return this.cache.get(cacheKey)!;
    }

    try {
      logger.serviceCall('Holiday', `Fetching holidays from API for ${year}/${stateCode}`, { year, stateCode });
      const url = `https://feiertage-api.de/api/?jahr=${year}&nur_land=${stateCode}`;

      const response = await fetch(url);

      if (!response.ok) {
        logger.error('Holiday API error', new Error(`${response.status} ${response.statusText}`), {
          year,
          stateCode,
          status: response.status,
        });
        return new Map();
      }

      const data = (await response.json()) as HolidayApiResponse;
      const holidays = this.parseHolidays(data);

      // In Cache speichern
      this.cache.set(cacheKey, holidays);

      logger.serviceInfo('Holiday', `Loaded ${holidays.size} holidays for ${year}/${stateCode}`, {
        year,
        stateCode,
        count: holidays.size,
      });
      return holidays;
    } catch (error: any) {
      logger.error('Error loading holidays', error, { year, stateCode });
      return new Map();
    }
  }

  /**
   * Parst die API-Antwort in eine Holiday-Map
   * @param data - API Response
   * @returns Map von Datum zu Holiday
   */
  private parseHolidays(data: HolidayApiResponse): Map<string, Holiday> {
    const holidays = new Map<string, Holiday>();

    for (const [name, info] of Object.entries(data)) {
      const date = info.datum;
      holidays.set(date, { name, date });
    }

    return holidays;
  }

  /**
   * Prüft ob ein Datum ein Feiertag ist
   * @param dateString - Datum im Format YYYY-MM-DD
   * @param year - Jahr
   * @param stateCode - Bundesland-Code
   * @returns Holiday-Objekt oder null
   */
  async isHoliday(dateString: string, year: number, stateCode: string): Promise<Holiday | null> {
    const holidays = await this.getHolidays(year, stateCode);
    return holidays.get(dateString) || null;
  }

  /**
   * Löscht den Cache (z.B. für Tests oder Jahreswechsel)
   */
  clearCache(): void {
    this.cache.clear();
    logger.serviceCacheCleared('Holiday');
  }
}

export default HolidayService;
