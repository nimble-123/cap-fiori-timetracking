import { executeHttpRequest } from '@sap-cloud-sdk/http-client';
import type { DestinationOrFetchOptions } from '@sap-cloud-sdk/connectivity';
import { logger } from '../utils';
import { CustomizingService } from './CustomizingService';

/**
 * Service zur Ermittlung von deutschen Feiertagen
 * Nutzt die kostenlose Feiertage-API (feiertage-api.de)
 *
 * Lokal: Direkter HTTP-Call via fetch()
 * BTP: Destination-basiert via @sap-cloud-sdk/connectivity
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
  private customizingService: CustomizingService;

  constructor(customizingService: CustomizingService) {
    this.customizingService = customizingService;
  }

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

      let holidays: Map<string, Holiday>;

      if (this.isProduction()) {
        holidays = await this.fetchViaDestination(year, stateCode);
      } else {
        holidays = await this.fetchDirectly(year, stateCode);
      }

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
   * Fetches holidays via BTP Destination + Connectivity Service (Production)
   * @param year - Jahr
   * @param stateCode - Bundesland-Code
   * @returns Map von Datum zu Holiday
   */
  private async fetchViaDestination(year: number, stateCode: string): Promise<Map<string, Holiday>> {
    logger.serviceCall('Holiday', `Using BTP Destination for ${year}/${stateCode}`);

    const destination: DestinationOrFetchOptions = {
      destinationName: 'holiday-api',
    };

    const config = this.customizingService.getHolidayApiConfig();
    const countryParam = config.countryParameter || 'nur_land';

    const response = await executeHttpRequest(destination, {
      method: 'GET',
      url: `/api/?jahr=${year}&${countryParam}=${stateCode}`,
      timeout: 5000,
    });

    const data = (await response.json()) as HolidayApiResponse;
    return this.parseHolidays(data);
  }

  /**
   * Fetches holidays via direct HTTP call (Development)
   * @param year - Jahr
   * @param stateCode - Bundesland-Code
   * @returns Map von Datum zu Holiday
   */
  private async fetchDirectly(year: number, stateCode: string): Promise<Map<string, Holiday>> {
    const url = this.buildHolidayUrl(year, stateCode);
    logger.serviceCall('Holiday', `Direct fetch from ${url}`);

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!response.ok) {
      throw new Error(`Holiday API returned ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as HolidayApiResponse;
    return this.parseHolidays(data);
  }

  /**
   * Determines if running in production environment
   * @returns true if production, false otherwise
   */
  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production' || !!process.env.VCAP_SERVICES;
  }

  private buildHolidayUrl(year: number, stateCode: string): string {
    const config = this.customizingService.getHolidayApiConfig();
    const baseUrl = config.baseUrl || 'https://feiertage-api.de/api/';
    let url: URL;

    try {
      url = new URL(baseUrl);
    } catch (error) {
      logger.error('Invalid holiday API base URL', error as Error, { baseUrl });
      url = new URL('https://feiertage-api.de/api/');
    }

    url.searchParams.set('jahr', String(year));
    url.searchParams.set(config.countryParameter || 'nur_land', stateCode);

    return url.toString();
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
