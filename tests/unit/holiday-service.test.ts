/**
 * Unit Tests - HolidayService
 *
 * Testet die HolidayService-Klasse mit gemockten HTTP-Anfragen
 */
import { HolidayService } from '../../srv/track-service/handler/services/HolidayService';
import type { CustomizingService } from '../../srv/track-service/handler/services/CustomizingService';

// Mock fetch global
global.fetch = jest.fn();

describe('HolidayService - Unit Tests', () => {
  let holidayService: HolidayService;
  let mockCustomizingService: jest.Mocked<CustomizingService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock CustomizingService
    mockCustomizingService = {
      getHolidayApiConfig: jest.fn().mockReturnValue({
        baseUrl: 'https://feiertage-api.de/api/',
        countryParameter: 'nur_land',
      }),
    } as any;

    holidayService = new HolidayService(mockCustomizingService);

    // Mock environment to development mode
    process.env.NODE_ENV = 'development';
    delete process.env.VCAP_SERVICES;
  });

  describe('getHolidays', () => {
    it('should fetch and parse holidays from API', async () => {
      const mockApiResponse = {
        Neujahr: { datum: '2025-01-01', hinweis: '' },
        'Heilige Drei Könige': { datum: '2025-01-06', hinweis: '' },
        Karfreitag: { datum: '2025-04-18', hinweis: '' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const holidays = await holidayService.getHolidays(2025, 'BY');

      expect(holidays.size).toBe(3);
      expect(holidays.get('2025-01-01')).toEqual({ name: 'Neujahr', date: '2025-01-01' });
      expect(holidays.get('2025-01-06')).toEqual({ name: 'Heilige Drei Könige', date: '2025-01-06' });
      expect(holidays.get('2025-04-18')).toEqual({ name: 'Karfreitag', date: '2025-04-18' });
    });

    it('should build correct API URL', async () => {
      const mockApiResponse = {
        Neujahr: { datum: '2025-01-01', hinweis: '' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      await holidayService.getHolidays(2025, 'BY');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://feiertage-api.de/api/?jahr=2025&nur_land=BY',
        expect.any(Object),
      );
    });

    it('should use cache on second call', async () => {
      const mockApiResponse = {
        Neujahr: { datum: '2025-01-01', hinweis: '' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      // First call - should fetch from API
      const holidays1 = await holidayService.getHolidays(2025, 'BY');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const holidays2 = await holidayService.getHolidays(2025, 'BY');
      expect(global.fetch).toHaveBeenCalledTimes(1); // No additional call

      expect(holidays1).toBe(holidays2); // Same instance from cache
    });

    it('should handle different states separately in cache', async () => {
      const mockResponseBY = {
        'Heilige Drei Könige': { datum: '2025-01-06', hinweis: '' },
      };

      const mockResponseNW = {
        Neujahr: { datum: '2025-01-01', hinweis: '' },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponseBY,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponseNW,
        });

      const holidaysBY = await holidayService.getHolidays(2025, 'BY');
      const holidaysNW = await holidayService.getHolidays(2025, 'NW');

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(holidaysBY.size).toBe(1);
      expect(holidaysNW.size).toBe(1);
      expect(holidaysBY.get('2025-01-06')).toBeDefined();
      expect(holidaysNW.get('2025-01-01')).toBeDefined();
    });

    it('should return empty Map on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const holidays = await holidayService.getHolidays(2025, 'BY');

      expect(holidays.size).toBe(0);
    });

    it('should return empty Map on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const holidays = await holidayService.getHolidays(2025, 'BY');

      expect(holidays.size).toBe(0);
    });

    it('should handle empty API response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const holidays = await holidayService.getHolidays(2025, 'BY');

      expect(holidays.size).toBe(0);
    });
  });

  describe('isHoliday', () => {
    it('should return holiday if date is a holiday', async () => {
      const mockApiResponse = {
        Neujahr: { datum: '2025-01-01', hinweis: '' },
        Karfreitag: { datum: '2025-04-18', hinweis: '' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await holidayService.isHoliday('2025-01-01', 2025, 'BY');

      expect(result).toEqual({ name: 'Neujahr', date: '2025-01-01' });
    });

    it('should return null if date is not a holiday', async () => {
      const mockApiResponse = {
        Neujahr: { datum: '2025-01-01', hinweis: '' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await holidayService.isHoliday('2025-01-15', 2025, 'BY');

      expect(result).toBeNull();
    });

    it('should use cached holidays', async () => {
      const mockApiResponse = {
        Neujahr: { datum: '2025-01-01', hinweis: '' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      // First call
      await holidayService.isHoliday('2025-01-01', 2025, 'BY');

      // Second call should use cache
      const result = await holidayService.isHoliday('2025-01-01', 2025, 'BY');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ name: 'Neujahr', date: '2025-01-01' });
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      const mockApiResponse = {
        Neujahr: { datum: '2025-01-01', hinweis: '' },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      // First call - populate cache
      await holidayService.getHolidays(2025, 'BY');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Clear cache
      holidayService.clearCache();

      // Second call - should fetch again
      await holidayService.getHolidays(2025, 'BY');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Custom Configuration', () => {
    it('should use custom baseUrl from configuration', async () => {
      mockCustomizingService.getHolidayApiConfig.mockReturnValue({
        baseUrl: 'https://custom-api.example.com/',
        countryParameter: 'nur_land',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await holidayService.getHolidays(2025, 'BY');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://custom-api.example.com/?jahr=2025&nur_land=BY',
        expect.any(Object),
      );
    });

    it('should use custom country parameter from configuration', async () => {
      mockCustomizingService.getHolidayApiConfig.mockReturnValue({
        baseUrl: 'https://feiertage-api.de/api/',
        countryParameter: 'state',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await holidayService.getHolidays(2025, 'BY');

      expect(global.fetch).toHaveBeenCalledWith('https://feiertage-api.de/api/?jahr=2025&state=BY', expect.any(Object));
    });

    it('should fallback to default URL if baseUrl is invalid', async () => {
      mockCustomizingService.getHolidayApiConfig.mockReturnValue({
        baseUrl: 'invalid-url',
        countryParameter: 'nur_land',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await holidayService.getHolidays(2025, 'BY');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://feiertage-api.de/api/?jahr=2025&nur_land=BY',
        expect.any(Object),
      );
    });
  });
});
